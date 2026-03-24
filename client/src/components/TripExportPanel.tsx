import React, { useState } from 'react';
import { Download, Share2, Calendar, FileText, Sheet3, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import {
  downloadICalendar,
  downloadTripHTML,
  downloadTripCSV,
  generateShareLink,
  type TripData
} from '../utils/tripExport';
import '../styles/TripExportPanel.css';

interface TripExportPanelProps {
  trip: TripData;
  onClose: () => void;
  darkMode: boolean;
}

export function TripExportPanel({ trip, onClose, darkMode }: TripExportPanelProps) {
  const { language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);

  const handleExportICalendar = () => {
    downloadICalendar(trip);
  };

  const handleExportPDF = () => {
    downloadTripHTML(trip, language === 'zh-TW' ? 'zh' : 'en');
  };

  const handleExportCSV = () => {
    downloadTripCSV(trip, language === 'zh-TW' ? 'zh' : 'en');
  };

  const handleCopyShareLink = () => {
    const link = generateShareLink(trip);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = generateShareLink(trip);

  return (
    <div className={`trip-export-panel ${darkMode ? 'dark' : 'light'}`}>
      <div className="export-header">
        <h3>{language === 'zh-TW' ? '匯出和分享' : 'Export & Share'}</h3>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="export-content">
        <div className="export-section">
          <h4>{language === 'zh-TW' ? '匯出選項' : 'Export Options'}</h4>
          <div className="export-buttons">
            <button
              className="export-btn calendar-btn"
              onClick={handleExportICalendar}
              title={language === 'zh-TW' ? '匯出為日曆格式' : 'Export as Calendar'}
            >
              <Calendar size={20} />
              <span>{language === 'zh-TW' ? 'iCalendar' : 'iCalendar'}</span>
            </button>

            <button
              className="export-btn pdf-btn"
              onClick={handleExportPDF}
              title={language === 'zh-TW' ? '匯出為列印版本' : 'Export as Printable'}
            >
              <FileText size={20} />
              <span>{language === 'zh-TW' ? '列印' : 'Print'}</span>
            </button>

            <button
              className="export-btn csv-btn"
              onClick={handleExportCSV}
              title={language === 'zh-TW' ? '匯出為 CSV' : 'Export as CSV'}
            >
              <Sheet3 size={20} />
              <span>{language === 'zh-TW' ? 'CSV' : 'CSV'}</span>
            </button>
          </div>
        </div>

        <div className="share-section">
          <h4>{language === 'zh-TW' ? '分享旅行計畫' : 'Share Trip Plan'}</h4>
          <p className="share-description">
            {language === 'zh-TW'
              ? '生成可分享的連結，讓家庭成員可以查看和導入這個旅行計畫'
              : 'Generate a shareable link so family members can view and import this trip plan'}
          </p>

          {!showShareLink ? (
            <button
              className="share-btn"
              onClick={() => setShowShareLink(true)}
            >
              <Share2 size={20} />
              <span>{language === 'zh-TW' ? '產生分享連結' : 'Generate Share Link'}</span>
            </button>
          ) : (
            <div className="share-link-container">
              <div className="share-link-input">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="share-link"
                />
                <button
                  className="copy-btn"
                  onClick={handleCopyShareLink}
                  title={language === 'zh-TW' ? '複製連結' : 'Copy link'}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="link-info">
                {copied
                  ? (language === 'zh-TW' ? '已複製到剪貼簿' : 'Copied to clipboard')
                  : (language === 'zh-TW' ? '連結已複製準備分享' : 'Share this link with family')}
              </p>
              <button
                className="hide-link-btn"
                onClick={() => setShowShareLink(false)}
              >
                {language === 'zh-TW' ? '隱藏連結' : 'Hide Link'}
              </button>
            </div>
          )}
        </div>

        <div className="info-section">
          <h4>{language === 'zh-TW' ? '提示' : 'Tips'}</h4>
          <ul className="tips-list">
            <li>
              {language === 'zh-TW'
                ? '• iCalendar 格式可以匯入到 Google Calendar, Outlook 等日曆應用'
                : '• iCalendar format can be imported to Google Calendar, Outlook, etc.'}
            </li>
            <li>
              {language === 'zh-TW'
                ? '• 列印格式適合列印出來帶到景點'
                : '• Printable format is perfect to bring along on your outing'}
            </li>
            <li>
              {language === 'zh-TW'
                ? '• CSV 格式適合在試算表軟體中編輯'
                : '• CSV format can be edited in spreadsheet software'}
            </li>
            <li>
              {language === 'zh-TW'
                ? '• 分享連結允許他人查看並導入你的旅行計畫'
                : '• Share link allows others to view and import your trip plan'}
            </li>
          </ul>
        </div>

        <div className="trip-summary">
          <h4>{language === 'zh-TW' ? '旅行摘要' : 'Trip Summary'}</h4>
          <div className="summary-row">
            <span className="label">{language === 'zh-TW' ? '名稱:' : 'Name:'}</span>
            <span className="value">{trip.name}</span>
          </div>
          <div className="summary-row">
            <span className="label">{language === 'zh-TW' ? '日期:' : 'Date:'}</span>
            <span className="value">{new Date(trip.date).toLocaleDateString()}</span>
          </div>
          <div className="summary-row">
            <span className="label">{language === 'zh-TW' ? '預算:' : 'Budget:'}</span>
            <span className="value">NT${trip.budget}</span>
          </div>
          <div className="summary-row">
            <span className="label">{language === 'zh-TW' ? '成員:' : 'Members:'}</span>
            <span className="value">{trip.members.length}</span>
          </div>
          <div className="summary-row">
            <span className="label">{language === 'zh-TW' ? '地點:' : 'Locations:'}</span>
            <span className="value">
              {trip.finalLocations.length > 0
                ? trip.finalLocations.length
                : trip.suggestedLocations.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
