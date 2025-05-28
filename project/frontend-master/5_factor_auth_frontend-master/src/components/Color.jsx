import React, { useState } from 'react';
import { toast } from 'react-toastify';

const   Color = ({ onColorSelect, initialColors = [] }) => {
  const [selectedColors, setSelectedColors] = useState(initialColors);
  
  const validColors = [
    { name: "red", value: "#ff0000" },
    { name: "blue", value: "#0000ff" },
    { name: "green", value: "#00ff00" },
    { name: "yellow", value: "#ffff00" },
    { name: "black", value: "#000000" },
    { name: "white", value: "#ffffff" },
    { name: "purple", value: "#800080" },
    { name: "orange", value: "#ffa500" },
    { name: "pink", value: "#ffc0cb" },
    { name: "brown", value: "#a52a2a" },
  ];

  const handleColorClick = (color) => {
    if (selectedColors.includes(color.name)) {
      // Deselect the color
      const newColors = selectedColors.filter(c => c !== color.name);
      setSelectedColors(newColors);
      onColorSelect?.(newColors);
    } else {
      // Select the color (max 3)
      if (selectedColors.length >= 3) {
        toast.error("You can select a maximum of 3 colors");
        return;
      }
      const newColors = [...selectedColors, color.name];
      setSelectedColors(newColors);
      onColorSelect?.(newColors);
    }
  };

  const resetSelection = () => {
    setSelectedColors([]);
    onColorSelect?.([]);
  };

  const styles = {
    container: {
      position: "relative",
      padding: "20px",
      textAlign: "center",
    },
    grid: {
      width: "240px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "10px",
      position: "relative",
    },
    colorDot: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      margin: "0 auto",
      cursor: "pointer",
      border: "2px solid #ddd",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    selectedDot: {
      transform: "scale(1.1)",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
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
    },
    instructions: {
      color: "black",
      marginBottom: "15px",
      fontSize: "14px",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {validColors.map((color) => (
          <div
            key={color.name}
            style={{
              ...styles.colorDot,
              backgroundColor: color.value,
              ...(selectedColors.includes(color.name) && styles.selectedDot)
            }}
            onClick={() => handleColorClick(color)}
            title={color.name}
          />
        ))}
      </div>
      
      {selectedColors.length > 0 && (
        <button 
          style={styles.resetButton} 
          onClick={resetSelection}
        >
          Reset Selection
        </button>
      )}
    </div>
  );
};

export default Color;