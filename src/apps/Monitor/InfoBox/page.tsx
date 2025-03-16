import React from 'react';
import './style.css';

interface InfoBoxProps {
  label: string;
  value: string;
  icon?: string;
  iconOn?: string;
  iconOff?: string;
  onChange?: () => void;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const InfoBox: React.FC<InfoBoxProps> = ({ 
  label, 
  value, 
  icon, 
  iconOn, 
  iconOff, 
  onChange,
  buttonLabel,
  onButtonClick
}) => {
  const isToggle = typeof onChange === 'function';
  const checked = value.toLowerCase() === 'on';
  const displayIcon = isToggle && (iconOn || iconOff) ? (checked ? iconOn : iconOff) : icon;

  return (
    <div className="info-box">
      <div className="info-text">
        <label>{label}</label>
        <div className="info-content">
          {isToggle ? (
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={checked} 
                onChange={onChange} 
              />
              <span className="slider"></span>
            </label>
          ) : (
            <p>{value}</p>
          )}

          {buttonLabel && onButtonClick && (
            <button 
              className="info-button"
              onClick={onButtonClick}
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
      
      <div className="info-icon">
        {displayIcon && <img src={displayIcon} alt={`${label} icon`} />}
      </div>
    </div>
  );
};

export default InfoBox;