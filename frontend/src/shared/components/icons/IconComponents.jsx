import React from 'react';
import * as Icons from './PremiumIcons';

/**
 * PremiumIcon Component - Universal icon wrapper for replacing emojis
 * Supports all emoji types used in PhilixMate
 */
export const PremiumIcon = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  className = '',
  style = {},
  ...props 
}) => {
  // Map name to icon component
  const IconComponent = Icons.NAME_TO_ICON_MAP[name];
  
  if (!IconComponent) {
    console.warn(`Icon not found for name: ${name}`);
    return null;
  }

  return (
    <span 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      {...props}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

/**
 * IconButton - Clickable icon component with hover effects
 */
export const IconButton = ({
  name,
  size = 24,
  color = 'currentColor',
  onClick,
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'all 200ms ease',
        ...props.style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
      }}
      {...props}
    >
      <PremiumIcon name={name} size={size} color={color} />
    </button>
  );
};

/**
 * InlineIcon - Icon with inline text styling
 */
export const InlineIcon = ({ 
  name, 
  size = 20, 
  color = 'currentColor',
  marginRight = 6,
  className = ''
}) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight, gap: 4 }} className={className}>
      <PremiumIcon name={name} size={size} color={color} />
    </span>
  );
};

export default PremiumIcon;
