import { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';

const Dot = ({ index, onPointerDown, isSelected }) => {
  return (
    <div
      id={`dot-${index}`}
      onPointerDown={(e) => onPointerDown(e, index)}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: isSelected ? "#4caf50" : "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        position: "relative",
        zIndex: 2,
      }}
    ></div>
  );
};

const GesturePattern = ({ onPatternChange }) => {
  const [pattern, setPattern] = useState([]);
  const [positions, setPositions] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const gridRef = useRef();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const updateDotPositions = () => {
      const newPos = {};
      for (let i = 1; i <= 9; i++) {
        const el = document.getElementById(`dot-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const gridRect = gridRef.current.getBoundingClientRect();
          newPos[i] = {
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2
          };
        }
      }
      setPositions(newPos);
    };

    updateDotPositions();
    window.addEventListener("resize", updateDotPositions);
    return () => {
      window.removeEventListener("resize", updateDotPositions);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetPattern = () => {
    setPattern([]);
    setIsDrawing(false);
    setStartTime(null);
    onPatternChange?.([]);
  };

  const handlePointerDown = (e, index) => {
    resetPattern(); // Reset any existing pattern
    setStartTime(Date.now());
    setPattern([index]);
    setIsDrawing(true);
    onPatternChange?.([index]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let i = 1; i <= 9; i++) {
      const dot = positions[i];
      if (!dot || pattern.includes(i)) continue;
      const distance = Math.hypot(dot.x - x, dot.y - y);
      if (distance < 25) {
        const newPattern = [...pattern, i];
        setPattern(newPattern);
        onPatternChange?.(newPattern);
        break;
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // If the pattern was drawn too quickly (less than 500ms) or has less than 4 points,
    // consider it invalid and reset
    if (duration < 500 || pattern.length < 4) {
      toast.error("Pattern must be drawn in one continuous motion with at least 4 points");
      resetPattern();
      return;
    }

    toast.success("Pattern drawn successfully!");
    setIsDrawing(false);
    setStartTime(null);
  };

  const getLineCoordinates = (from, to) => {
    if (!positions[from] || !positions[to]) return null;
    return {
      x1: positions[from].x,
      y1: positions[from].y,
      x2: positions[to].x,
      y2: positions[to].y
    };
  };

  const styles = {
    container: {
      position: "relative",
      paddingx : '20px',
      textAlign: "center",
    },
    grid: {
      width: "180px",
      height: "180px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "40px",
      position: "relative",
      padding: "20px",
    },
    line: {
      position: "absolute",
      height: "4px",
      backgroundColor: "#4caf50",
      transformOrigin: "0 0",
      zIndex: 1,
    },
    resetButton: {
      marginTop: "20px",
      padding: "8px 16px",
      backgroundColor: "#f44336",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    }
  };

  return (
    <div
      style={styles.container}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <h3 style={{color: "black"}}>Draw Pattern</h3>
      <div ref={gridRef} style={styles.grid}>
        {/* Draw connecting lines */}
        {pattern.map((dot, index) => {
          if (index === 0) return null;
          const coords = getLineCoordinates(pattern[index - 1], dot);
          if (!coords) return null;

          const length = Math.hypot(coords.x2 - coords.x1, coords.y2 - coords.y1);
          const angle = Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180 / Math.PI;

          return (
            <div
              key={`line-${index}`}
              style={{
                ...styles.line,
                width: `${length}px`,
                left: `${coords.x1}px`,
                top: `${coords.y1}px`,
                transform: `rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {/* Draw dots */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
          <Dot
            key={index}
            index={index}
            onPointerDown={handlePointerDown}
            isSelected={pattern.includes(index)}
          />
        ))}
      </div>
      <button 
        style={styles.resetButton}
        onClick={() => {
          resetPattern();
          toast.info("Pattern reset");
        }}
      >
        Reset Pattern
      </button>
    </div>
  );
};

export default GesturePattern;
