import { type CrowdednessReport } from '../types';

interface CrowdednessReportListProps {
  reports: CrowdednessReport[];
  language: 'zh' | 'en';
}

export function CrowdednessReportList({ reports, language }: CrowdednessReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="no-reports-message">
        {language === 'zh' ? '暫無人潮報告' : 'No crowding reports yet'}
      </div>
    );
  }

  const getCrowdingEmoji = (level: string) => {
    switch (level) {
      case 'light':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'heavy':
        return '🔴';
      default:
        return '🤔';
    }
  };

  const getCrowdingLabel = (level: string) => {
    if (language === 'zh') {
      switch (level) {
        case 'light':
          return '人少';
        case 'moderate':
          return '中等';
        case 'heavy':
          return '人多';
        default:
          return '';
      }
    } else {
      switch (level) {
        case 'light':
          return 'Light';
        case 'moderate':
          return 'Moderate';
        case 'heavy':
          return 'Heavy';
        default:
          return '';
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return language === 'zh' ? '剛剛' : 'Just now';
    } else if (diffMins < 60) {
      return language === 'zh' ? `${diffMins}分鐘前` : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return language === 'zh' ? `${diffHours}小時前` : `${diffHours}h ago`;
    } else {
      return language === 'zh' ? `${diffDays}天前` : `${diffDays}d ago`;
    }
  };

  return (
    <div className="crowdedness-report-list">
      <h4 className="reports-title">
        👥 {language === 'zh' ? '最新人潮報告' : 'Recent Crowding Reports'}
      </h4>
      <div className="reports-container">
        {reports.slice(0, 5).map((report) => (
          <div key={report.id} className="report-item">
            <div className="report-header">
              <div className="report-crowding">
                <span className="crowding-emoji">
                  {getCrowdingEmoji(report.crowdingLevel)}
                </span>
                <span className="crowding-level-label">
                  {getCrowdingLabel(report.crowdingLevel)}
                </span>
              </div>
              <span className="report-time">{formatTime(report.createdAt)}</span>
            </div>
            <div className="report-user">
              {report.userName ? (
                <span className="user-name">{report.userName}</span>
              ) : (
                <span className="user-anonymous">{language === 'zh' ? '匿名' : 'Anonymous'}</span>
              )}
            </div>
            {report.comment && (
              <div className="report-comment">{report.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
