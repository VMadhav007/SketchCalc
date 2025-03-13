import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState("");
  const canvasRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configure canvas with proper dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas dimensions to match its CSS size
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#000000";
      context.lineWidth = 4;
      
      // Set background
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      setCtx(context);
    };
    
    // Initial setup
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    let x, y;
    
    // Handle mouse or touch event
    if (e.touches && e.touches[0]) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    
    return { x, y };
  };

  const startDraw = (e) => {
    if (!ctx) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShowResults(false);
  };

  const sendCanvasToBackend = async () => {
    if (!canvasRef.current) return;
    
    // Show loading state in results area
    setResults("Processing your drawing...");
    setShowResults(true);
    
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      const response = await fetch("http://localhost:5000/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      
      const data = await response.text();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      setResults("Error processing your drawing. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <div className="bg-circle"></div>
      <div className="bg-lines"></div>
      
      <header className="header">
        <div className="logo"></div>
        <div className="visit-link"></div>
      </header>
      
      <main className="content">
        <div className="canvas-container">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          
          <div className="buttons">
            <button className="reset-btn" onClick={resetCanvas}>Reset</button>
            <button className="run-btn" onClick={sendCanvasToBackend}>Run</button>
          </div>
        </div>
        
        <div className={`results-container ${showResults ? 'visible' : ''}`}>
          <div className="results-content">
            {results}
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <div className="page-indicator"></div>
        <div className="year-label"></div>
      </footer>
    </div>
  );
}

export default App;