import React from "react";

const EmotionSelector: React.FC = () => {
  return (
    <div>
      <h2>Select Your Emotion</h2>
      {/* Emotion selection logic will go here */}
      <button>😊 Happy</button>
      <button>😢 Sad</button>
      <button>😡 Angry</button>
      {/* Add more emotions as needed */}
    </div>
  );
};

export default EmotionSelector;
