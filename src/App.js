import React, { useRef, useState, useEffect } from 'react';
import FabricCanvas from './FabricCanvas';
import './App.css'
const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // const messageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(1);
  const [referenceSize, setReferenceSize] = useState(0);
  const [isReferenceSet, setIsReferenceSet] = useState(false);
  const [referenceLength, setReferenceLength] = useState(0);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('');
  const [lines, setlines] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);

  const startCamera = async (useFrontCamera) => {
    const video = videoRef.current;
    const constraints = {
      video: {
        facingMode: useFrontCamera ? 'user' : 'environment'
      }
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
    } catch (err) {
      console.error("Error accessing the camera: " + err);
    }
  };
  useEffect(() => {
    const video = videoRef.current;
    // Access the device camera and stream to video element
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => {
        console.error("Error accessing the camera: " + err);
      });

    video.addEventListener('canplay', () => {
      if (video.paused || video.ended) {
        return;
      }
      video.play();
    });


    exitFullscreen();
  }, [videoRef.current]);
  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    } else if (document.mozFullScreenElement) {
      document.mozCancelFullScreen();
    } else if (document.msFullscreenElement) {
      document.msExitFullscreen();
    }
  }
  const captureImage = () => {
    setIsCaptured(2)
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Ensure canvas dimensions match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Calculate aspect ratio to fit the video into the canvas
    const hRatio = canvas.width / video.videoWidth;
    const vRatio = canvas.height / video.videoHeight;
    const ratio = Math.min(hRatio, vRatio);

    // Calculate the position to center the image on the canvas
    const centerX = (canvas.width - video.videoWidth * ratio) / 2;
    const centerY = (canvas.height - video.videoHeight * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, centerX, centerY, video.videoWidth * ratio, video.videoHeight * ratio);
    // context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      const dataURL = canvas.toDataURL('image/png');
      setCapturedImages(prevImages => [...prevImages, dataURL]);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    // messageRef.current.textContent = '';
    setIsDrawing(false);
    setIsCaptured(3)
    setIsReferenceSet(false);
    setReferenceLength(0);
  };

  function drawCircle(x, y) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    const radius = 5; // radius of the circle
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = 'blue';
    context.fill();
    context.closePath();
  }
  const handleMouseClick = (e) => {
    if (isReferenceSet) {
      if (!direction) {
        alert('please select next possible direction')
        return
      }
      else if (!referenceSize) {
        alert('please set referenced object size in ft')
        return
      }
    }
    if (isDrawing) {
      setEndPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      drawLine(e);
      setIsDrawing(false);
      drawCircle(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    } else {
      setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      setIsDrawing(true);
      drawCircle(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
  };

  const drawLine = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const endX = e.nativeEvent.offsetX;
    const endY = e.nativeEvent.offsetY;

    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endX, endY);
    context.stroke();

    const pixelDistance = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));

    if (!isReferenceSet) {
      setReferenceLength(pixelDistance);
      setIsReferenceSet(true);
      // messageRef.current.textContent = 'Reference line set. Draw other lines to measure distance in feet.';
    } else {
      const distanceInFeet = (pixelDistance / referenceLength) * referenceSize;
      const midX = (startPoint.x + endX) / 2;
      const midY = (startPoint.y + endY) / 2;

      context.font = '16px Arial';
      context.fillStyle = 'red';
      context.fillText(`${distanceInFeet.toFixed(2)} ft`, midX, midY);

      // messageRef.current.textContent = `Distance: ${distanceInFeet.toFixed(2)} ft`;
      setlines(prev => [...prev, { lineLength: distanceInFeet.toFixed(2), direction }])
      setDirection('');
      setReferenceSize(0)
    }
  };

  return (
    <div style={{ height: '100vh', margin: 0 }}>
      <video ref={videoRef} autoPlay width='640' height='480' style={{ display: isCaptured === 1 ? 'block' : 'none', width: '100%', height: '100%' }}></video>
      {<canvas ref={canvasRef} width='640' height='480' style={{ border: '1px solid black', display: isCaptured === 2 ? 'block' : 'none' }} onClick={handleMouseClick}></canvas>}
      <div id="controls" className='controls' style={{ marginTop: '20px' }}>
        {isCaptured === 1 && <button onClick={captureImage}>Capture Image</button>}
        {isCaptured === 2 && <><button onClick={clearCanvas}>Next</button>
          {/* <p ref={messageRef}></p> */}
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="">Select</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
          <input type='text' value={referenceSize} onChange={(e) => { setReferenceSize(parseFloat(e.target.value || 0)) }} placeholder='enter size of reference line in ft' /></>}
        {isCaptured === 1 &&
          <><button onClick={() => startCamera(true)}>Front Camera</button>
            <button onClick={() => startCamera(false)}>Back Camera</button></>}
      </div>
      {isCaptured === 3 && <FabricCanvas lines={lines} setIsCaptured={setIsCaptured} capturedImages={capturedImages}></FabricCanvas>}
    </div>
  );
};

export default App;
