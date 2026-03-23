import React from 'react';
import type { Event } from '../types';

interface EventsListProps {
  events?: Event[];
  language: 'zh' | 'en';
}

export const EventsList: React.FC<EventsListProps> = ({ events, language }) => {

  if (!events || events.length === 0) {
    return (
      <div className="events-list-empty">
        <p>{language === 'zh' ? '暫無活動' : 'No events'}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'zh'
      ? date.toLocaleDateString('zh-TW', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const getEventTypeLabel = (eventType: string) => {
    const typeMap: Record<string, { zh: string; en: string }> = {
      birthday_party: { zh: '生日派對', en: 'Birthday Party' },
      class: { zh: '課程', en: 'Class' },
      workshop: { zh: '工作坊', en: 'Workshop' },
      performance: { zh: '表演', en: 'Performance' },
      activity: { zh: '活動', en: 'Activity' },
      other: { zh: '其他', en: 'Other' }
    };
    return (typeMap[eventType] || { zh: eventType, en: eventType })[language];
  };

  return (
    <div className="events-list">
      <h3>{language === 'zh' ? '🎉 活動' : '🎉 Events'}</h3>
      {events.map((event) => (
        <div key={event.id} className="event-item">
          <div className="event-header">
            <h4>{language === 'zh' ? event.title.zh : event.title.en}</h4>
            <span className="event-type-badge">{getEventTypeLabel(event.eventType)}</span>
          </div>
          <p className="event-description">
            {language === 'zh' ? event.description.zh : event.description.en}
          </p>
          <div className="event-details">
            <div className="event-time">
              <strong>{language === 'zh' ? '時間：' : 'Time: '}</strong>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </div>
            {event.ageRange && (
              <div className="event-age-range">
                <strong>{language === 'zh' ? '年齡：' : 'Age: '}</strong>
                {event.ageRange.minAge && event.ageRange.maxAge
                  ? `${event.ageRange.minAge}-${event.ageRange.maxAge} ${language === 'zh' ? '歲' : 'years'}`
                  : event.ageRange.minAge
                  ? `${event.ageRange.minAge}+ ${language === 'zh' ? '歲' : 'years'}`
                  : `${language === 'zh' ? '不限' : 'All ages'}`}
              </div>
            )}
            {event.capacity && (
              <div className="event-capacity">
                <strong>{language === 'zh' ? '容納人數：' : 'Capacity: '}</strong>
                {event.capacity}
              </div>
            )}
            {event.price !== undefined && event.price > 0 && (
              <div className="event-price">
                <strong>{language === 'zh' ? '價格：' : 'Price: '}</strong>
                ${event.price}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
