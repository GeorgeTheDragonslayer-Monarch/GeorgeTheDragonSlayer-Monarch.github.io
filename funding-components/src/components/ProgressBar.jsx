import React from 'react';

const ProgressBar = ({ 
  current, 
  target, 
  showPercentage = false, 
  showAmounts = false,
  height = '8px',
  className = '' 
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isCompleted = percentage >= 100;

  return (
    <div className={`progress-bar-container ${className}`}>
      <div 
        className="progress-bar" 
        style={{ height }}
      >
        <div 
          className={`progress-fill ${isCompleted ? 'completed' : ''}`}
          style={{ 
            width: `${percentage}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
      
      {(showPercentage || showAmounts) && (
        <div className="progress-info">
          {showPercentage && (
            <span className="progress-percentage">
              {Math.round(percentage)}%
            </span>
          )}
          {showAmounts && (
            <span className="progress-amounts">
              ${current.toLocaleString()} / ${target.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

