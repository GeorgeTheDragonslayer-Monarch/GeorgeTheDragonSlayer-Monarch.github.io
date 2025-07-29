import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ current, target, showPercentage = false, className = '' }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="progress-percentage">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;

