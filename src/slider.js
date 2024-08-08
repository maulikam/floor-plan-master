import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import './slider.css'
export default function Slider({ capturedImages }) {
    return (<Carousel>
        {(capturedImages || []).map(el => {
            return <div>
                <img src={el} />
            </div>
        })}

    </Carousel>
    );
}