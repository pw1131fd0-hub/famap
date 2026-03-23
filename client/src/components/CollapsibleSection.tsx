import React from 'react';

export interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  emoji?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  emoji = ''
}) => (
  <div className="detail-section">
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: '8px 12px',
        background: isExpanded ? '#f0f8ff' : '#fafafa',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.95em',
        fontWeight: '600',
        transition: 'all 0.2s ease'
      }}
      aria-expanded={isExpanded}
      aria-label={`Toggle ${title} section`}
    >
      <span>{emoji} {title}</span>
      <span style={{
        display: 'inline-block',
        transition: 'transform 0.2s ease',
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }} aria-hidden="true">▼</span>
    </button>
    {isExpanded && (
      <div style={{ paddingTop: '8px' }}>
        {children}
      </div>
    )}
  </div>
);
