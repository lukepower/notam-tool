import React from 'react';
import { NotamWithStatus } from '../types';
import './NotamCard.css';

interface NotamCardProps {
  notam: NotamWithStatus;
  onMarkAsRead: (notamId: string) => void;
}

const NotamCard: React.FC<NotamCardProps> = ({ notam, onMarkAsRead }) => {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const formatDistance = (distance?: number): string => {
    if (distance === undefined) return 'N/A';
    return `${distance.toFixed(1)} NM`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`notam-card ${notam.shouldHighlight ? 'highlight' : ''} ${notam.isRead ? 'read' : 'unread'}`}
      style={{ borderLeftColor: getSeverityColor(notam.severity) }}
    >
      <div className="notam-header">
        <h3 className="notam-title">{notam.title}</h3>
        <div className="notam-badges">
          {notam.shouldHighlight && notam.wasReadWhenFar && (
            <span className="badge badge-warning">⚠️ NOW CLOSE</span>
          )}
          {notam.shouldHighlight && notam.daysSincePublished >= 7 && (
            <span className="badge badge-info">🔄 RESURFACED</span>
          )}
          {notam.isRead && !notam.shouldHighlight && (
            <span className="badge badge-read">✓ Read</span>
          )}
          <span 
            className="badge badge-severity"
            style={{ backgroundColor: getSeverityColor(notam.severity) }}
          >
            {notam.severity.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="notam-description">{notam.description}</p>

      <div className="notam-details">
        <div className="detail-row">
          <span className="detail-label">Distance:</span>
          <span className="detail-value">{formatDistance(notam.currentDistance)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Effective:</span>
          <span className="detail-value">{formatDate(notam.effectiveDate)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Expires:</span>
          <span className="detail-value">{formatDate(notam.expiryDate)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Published:</span>
          <span className="detail-value">
            {formatDate(notam.published)} ({notam.daysSincePublished}d ago)
          </span>
        </div>
        {notam.altitudeMin !== undefined && notam.altitudeMax !== undefined && (
          <div className="detail-row">
            <span className="detail-label">Altitude:</span>
            <span className="detail-value">
              {notam.altitudeMin}' - {notam.altitudeMax}'
            </span>
          </div>
        )}
        {notam.readAt && (
          <div className="detail-row">
            <span className="detail-label">Read:</span>
            <span className="detail-value">{formatDate(notam.readAt)}</span>
          </div>
        )}
      </div>

      {!notam.isRead && (
        <button 
          className="mark-read-btn"
          onClick={() => onMarkAsRead(notam.id)}
        >
          Mark as Read
        </button>
      )}
    </div>
  );
};

export default NotamCard;
