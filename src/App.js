import React, { useState } from "react";
import Canvas from "./components/Canvas.js";
import "./App.css";

function App() {
    const [clicks, setClicks] = useState({ left: false, middle: false, right: false });

    // {left: false, middle: false, right: false}
    const leftClick = () => {
        setClicks({ ...clicks, left: true });
    };

    const middleClick = () => {
        setClicks({ ...clicks, middle: true });
    };

    const rightClick = () => {
        setClicks({ ...clicks, right: true });
    };

    const handleButtonReset = (key) => {
        setClicks({ ...clicks, [key]: false });
    };

    return (
        <div className="main">
            <div className="middle">
                <div className="empty">
                    <p>little-eggchi</p>
                </div>
                <div className="canvas">
                    <Canvas clicks={clicks} onButtonReset={handleButtonReset}/>
                </div>
                <div className="button-container">
                    <button onClick={leftClick}></button>
                    <button onClick={middleClick}></button>
                    <button onClick={rightClick}></button>
                </div>
            </div>
        </div>
    );
}

export default App;
