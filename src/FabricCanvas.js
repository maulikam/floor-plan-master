import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric'; // Ensure you import fabric correctly
import Slider from './slider';

const FabricCanvas = ({ lines, setIsCaptured, capturedImages }) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const linesCoors = [{ x: 100, y: 100 }];
    let currentX = 100; // Initial X position (center of the canvas)
    let currentY = 100; // Initial Y position (center of the canvas)
    const scale = 20; // Assuming 1 foot = 10 pixels, you can adjust this scale.
    const isMobile = () => {
        return /Mobi|Android/i.test(navigator.userAgent);
    };
    const height = isMobile() ? 400 : 480;
    const width = isMobile() ? 300 : 640;
    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current);
        fabricCanvas.setDimensions({ width: width, height: height });
        setCanvas(fabricCanvas);

        // Draw lines from the lines prop
        lines.forEach((element) => {
            drawLine(element.lineLength, element.direction, fabricCanvas);
        });

        return () => {
            fabricCanvas.dispose();
            setCanvas(null);
        };
    }, [lines]); // Add lines as a dependency to re-run effect when lines change

    const clearCanvas = () => {
        canvas.clear(); // Clear the canvas
        setIsCaptured(1);
    };
    const finish = () => {

    };

    const feetToPixels = (feet) => {
        return feet * scale;
    };

    const drawLine = (lineLength, direction, canvas) => {
        if (!canvas) return;

        const lengthInPixels = feetToPixels(parseFloat(lineLength));
        let x2 = currentX;
        let y2 = currentY;

        if (direction === 'left') {
            x2 -= lengthInPixels;
        } else if (direction === 'right') {
            x2 += lengthInPixels;
        } else if (direction === 'top') {
            y2 -= lengthInPixels;
        } else if (direction === 'bottom') {
            y2 += lengthInPixels;
        }

        const line = new fabric.Line([currentX, currentY, x2, y2], {
            stroke: 'red',
            strokeWidth: 5,
        });
        canvas.add(line);
        canvas.renderAll();

        currentX = x2;
        currentY = y2;
        // if (!linesCoors.some(el => el.x == currentX && el.y == currentY))
        //     linesCoors.push({ x: currentX, y: currentY })
        // if (linesCoors.length >= 4) {
        //     const line = new fabric.Line([currentX, currentY, linesCoors[0].x, linesCoors[0].y], {
        //         stroke: 'blue',
        //         strokeWidth: 5,
        //     });
        //     canvas.add(line);
        //     canvas.renderAll();
        // }
    };

    return (
        <div>
            <canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid #000', margin: 'auto' }}></canvas>
            <div className='controls'><button onClick={clearCanvas}>Done</button>
                <button onClick={finish}>Finish</button>
            </div>
            <Slider capturedImages={capturedImages}></Slider>
        </div>
    );
};

export default FabricCanvas;

