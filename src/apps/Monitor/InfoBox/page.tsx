import React from 'react';
import './style.css';

interface InfoBoxProps {
  label: string;
  value: string;
  icon?: string;
  iconOn?: string;
  iconOff?: string;
  onChange?: (checked: boolean) => void;
  toggleMode?: 'switch' | 'button';
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
  toggleMode = 'switch',
  buttonLabel,
  onButtonClick
}) => {
  const isToggle = typeof onChange === 'function';
  const checked = value.toLowerCase() === 'on';
  const displayIcon = isToggle && (iconOn || iconOff) 
    ? (checked ? iconOn : iconOff) 
    : icon;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const handleToggleButton = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className="info-box">
      <div className="info-text">
        <label>{label}</label>
        <div className="info-content">
          {isToggle ? (
            toggleMode === 'switch' ? (
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={checked} 
                  onChange={handleChange} 
                />
                <span className="slider"></span>
              </label>
            ) : (
              <button className="toggle-button" onClick={handleToggleButton}>
                {checked ? '1' : '0'}
              </button>
            )
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
