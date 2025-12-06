import React from 'react'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./index.css";
export const CustomCarousel = ({children}:any) => {
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 4
        },
        desktop: {
            breakpoint: { max: 2900, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };
    const CustomRightArrow = ({ onClick, ...rest }: any) => {
        const {
            onMove,
            carouselState: { currentSlide, deviceType }
        } = rest;
        // onMove means if dragging or swiping in progress.
        return (<button onClick={() => onClick()} className="custom-right-arrow">
            <img src="/assets/icons/rightArrow.svg" alt="Right Arrow" />
        </button>)
    };
    const CustomLeftArrow = ({ onClick, ...rest }: any) => {
        const {
            onMove,
            carouselState: { currentSlide, deviceType }
        } = rest;
        return (<button onClick={() => onClick()} className="custom-left-arrow">
            <img src="/assets/icons/leftArrow.svg" alt="Left Arrow" />
        </button>)
    }
    return (
        <Carousel className='myCarouselClass'
      
        // keyBoardControl={true}
        showDots={true}
        
        transitionDuration={500}
        // containerClass="carousel-container"
        responsive={responsive} customRightArrow={<CustomRightArrow onClick={()=>{}} />} customLeftArrow={<CustomLeftArrow onClick={()=>{}} />}> 
        {children}
        </Carousel>
    )
}
