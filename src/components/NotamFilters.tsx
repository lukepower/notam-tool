import React from 'react';
import './NotamFilters.css';

interface NotamFiltersProps {
  showRead: boolean;
  showUnread: boolean;
  showHighlighted: boolean;
  onToggleRead: () => void;
  onToggleUnread: () => void;
  onToggleHighlighted: () => void;
}

const NotamFilters: React.FC<NotamFiltersProps> = ({
  showRead,
  showUnread,
  showHighlighted,
  onToggleRead,
  onToggleUnread,
  onToggleHighlighted
}) => {
  return (
    <div className="notam-filters">
      <h4 className="filters-title">Filter NOTAMs:</h4>
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${showUnread ? 'active' : ''}`}
          onClick={onToggleUnread}
        >
          📋 Unread
        </button>
        <button 
          className={`filter-btn ${showRead ? 'active' : ''}`}
          onClick={onToggleRead}
        >
          ✓ Read
        </button>
        <button 
          className={`filter-btn ${showHighlighted ? 'active' : ''}`}
          onClick={onToggleHighlighted}
        >
          ⚠️ Highlighted Only
        </button>
      </div>
    </div>
  );
};

export default NotamFilters;
