import { X, Heart, MapPin, Copy } from 'lucide-react';
import type { Location, Review, ReviewCreateDTO, CrowdednessReport, CrowdednessReportCreateDTO, Event } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { CollapsibleSection } from './CollapsibleSection';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import { CrowdednessReportForm } from './CrowdednessReportForm';
import { CrowdednessReportList } from './CrowdednessReportList';
import { EventsList } from './EventsList';
import { isLocationOpen } from '../utils/locationUtils';
import { DAY_NAMES_ZH } from '../config/mapConfig';

interface LocationDetailPanelProps {
  location: Location;
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  reviews: Review[];
  onReviewSubmit: (data: ReviewCreateDTO) => Promise<void>;
  crowdednessReports: CrowdednessReport[];
  onCrowdednessReportSubmit: (data: CrowdednessReportCreateDTO) => Promise<void>;
  events?: Event[];
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  isInComparison?: boolean;
  onComparisonToggle?: (e: React.MouseEvent) => void;
}

export function LocationDetailPanel({
  location,
  isFavorite,
  onFavoriteToggle,
  onClose,
  reviews,
  onReviewSubmit,
  crowdednessReports,
  onCrowdednessReportSubmit,
  events,
  expandedSections,
  onToggleSection,
  isInComparison = false,
  onComparisonToggle,
}: LocationDetailPanelProps) {
  const { language, t } = useTranslation();

  return (
    <div className="location-detail-overlay">
      <header className="detail-header">
        <div>
          <div className="detail-title-row">
            <h2>{location.name[language]}</h2>
            <button
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={onFavoriteToggle}
              aria-label={isFavorite ? t.common.removeFromFavorites : t.common.addToFavorites}
            >
              <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            {onComparisonToggle && (
              <button
                className={`comparison-button ${isInComparison ? 'active' : ''}`}
                onClick={onComparisonToggle}
                aria-label={isInComparison ? (language === 'zh' ? '從比較中移除' : 'Remove from comparison') : (language === 'zh' ? '加入比較' : 'Add to comparison')}
                title={isInComparison ? (language === 'zh' ? '從比較中移除' : 'Remove from comparison') : (language === 'zh' ? '加入比較' : 'Add to comparison')}
              >
                <Copy size={24} />
              </button>
            )}
          </div>
          <p className="category-label">{t.categories[location.category]}</p>
        </div>
        <button
          onClick={onClose}
          className="close-detail-button"
        >
          <X size={20} />
        </button>
      </header>
      <div className="detail-content">
        {/* Basic Information - Always Expanded */}
        <CollapsibleSection
          title={language === 'zh' ? '基本信息' : 'Basic Info'}
          emoji="ℹ️"
          isExpanded={expandedSections['basic']}
          onToggle={() => onToggleSection('basic')}
        >
          <div className="detail-section">
            <h4>{t.locationDetail.address}</h4>
            <p>{location.address[language]}</p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(location.name[language])},${encodeURIComponent(location.address[language])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-button"
              title={t.locationDetail.directions}
            >
              <MapPin size={16} />
              <span>{t.locationDetail.directions}</span>
            </a>
          </div>
          {location.phoneNumber && (
            <div className="detail-section">
              <h4>{t.locationDetail.phone || 'Phone'}</h4>
              <a
                href={`tel:${location.phoneNumber}`}
                className="phone-button"
                title="Call"
              >
                📞 {location.phoneNumber}
              </a>
            </div>
          )}
          {location.pricing && (
            <div className="detail-section">
              <h4>{t.locationDetail.pricing}</h4>
              <p>{location.pricing.isFree ? t.locationDetail.isFree : location.pricing.priceRange || 'Paid'}</p>
            </div>
          )}
          {location.ageRange && (location.ageRange.minAge !== undefined || location.ageRange.maxAge !== undefined) && (
            <div className="detail-section">
              <h4>{t.locationDetail.ageRange}</h4>
              <p>
                {location.ageRange.minAge && location.ageRange.maxAge
                  ? `${location.ageRange.minAge} - ${location.ageRange.maxAge} ${language === 'zh' ? '歲' : 'years'}`
                  : location.ageRange.minAge ? `${location.ageRange.minAge}+ ${language === 'zh' ? '歲' : 'years'}`
                  : `Up to ${location.ageRange.maxAge} ${language === 'zh' ? '歲' : 'years'}`}
              </p>
            </div>
          )}
        </CollapsibleSection>

        {/* Operating Hours & Facilities */}
        {(location.operatingHours || location.facilities) && (
          <CollapsibleSection
            title={language === 'zh' ? '設施與營業時間' : 'Facilities & Hours'}
            emoji="🏢"
            isExpanded={expandedSections['facilities']}
            onToggle={() => onToggleSection('facilities')}
          >
            {location.operatingHours && (
              <div className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4>{t.locationDetail.openingHours}</h4>
                  {(() => {
                    const { isOpen, message } = isLocationOpen(location.operatingHours);
                    return (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8em',
                        fontWeight: '600',
                        background: isOpen ? '#d4edda' : '#f8d7da',
                        color: isOpen ? '#155724' : '#721c24',
                      }}>
                        {isOpen ? '🟢' : '🔴'} {message}
                      </span>
                    );
                  })()}
                </div>
                <div className="hours-list">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayName = language === 'zh'
                      ? DAY_NAMES_ZH[day]
                      : day.substring(0, 3).toUpperCase();
                    const hours = location.operatingHours![day as keyof typeof location.operatingHours];
                    return hours ? (
                      <p key={day} className="hours-item">
                        <strong>{language === 'zh' ? `週${dayName}` : dayName}:</strong> {hours}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <div className="detail-section">
              <h4>{t.locationDetail.facilities}</h4>
              <div className="facility-chips">
                {location.facilities.map(f => (
                  <span key={f} className="chip">{t.facilities[f as keyof typeof t.facilities] || f}</span>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Transit & Parking */}
        {(location.publicTransit || location.parking) && (
          <CollapsibleSection
            title={language === 'zh' ? '交通與停車' : 'Transit & Parking'}
            emoji="🚗"
            isExpanded={expandedSections['transit']}
            onToggle={() => onToggleSection('transit')}
          >
            {location.publicTransit && (
              <div className="detail-section">
                <h4>🚇 {language === 'zh' ? '公共運輸' : 'Public Transit'}</h4>
                {location.publicTransit.nearestMRT && (
                  <p>
                    <strong>{language === 'zh' ? '最近捷運' : 'Nearest MRT'}:</strong> {location.publicTransit.nearestMRT.station}
                    ({location.publicTransit.nearestMRT.line}) - 約 {Math.round(location.publicTransit.nearestMRT.distance / 100)}00m
                  </p>
                )}
                {location.publicTransit.busLines && location.publicTransit.busLines.length > 0 && (
                  <p>
                    <strong>{language === 'zh' ? '公車路線' : 'Bus Lines'}:</strong> {location.publicTransit.busLines.join(', ')}
                  </p>
                )}
              </div>
            )}
            {location.parking && (
              <div className="detail-section">
                <h4>🅿️ {language === 'zh' ? '停車資訊' : 'Parking'}</h4>
                <p>
                  <strong>{language === 'zh' ? '停車' : 'Parking'}</strong>: {location.parking.available ? (language === 'zh' ? '✅ 有停車位' : '✅ Available') : (language === 'zh' ? '❌ 無停車位' : '❌ Not Available')}
                </p>
                {location.parking.cost && (
                  <p>
                    <strong>{language === 'zh' ? '費用' : 'Cost'}</strong>: {location.parking.cost}
                  </p>
                )}
                {location.parking.hasValidation && (
                  <p>
                    <strong>{language === 'zh' ? '停車驗證' : 'Validation'}</strong>: {language === 'zh' ? '✅ 有停車驗證' : '✅ Available'}
                  </p>
                )}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Amenities */}
        {(location.toilet || location.hasWiFi || location.allergens) && (
          <CollapsibleSection
            title={language === 'zh' ? '便利設施' : 'Amenities'}
            emoji="🏪"
            isExpanded={expandedSections['amenities']}
            onToggle={() => onToggleSection('amenities')}
          >
            {location.toilet && (
              <div className="detail-section">
                <h4>🚽 {language === 'zh' ? '廁所設施' : 'Toilet Facilities'}</h4>
                <p>
                  <strong>{language === 'zh' ? '廁所' : 'Toilet'}</strong>: {location.toilet.available ? (language === 'zh' ? '✅ 有廁所' : '✅ Available') : (language === 'zh' ? '❌ 無廁所' : '❌ Not Available')}
                </p>
                {location.toilet.childrenFriendly && (
                  <p>
                    <strong>{language === 'zh' ? '兒童友善' : 'Kid-Friendly'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
                  </p>
                )}
                {location.toilet.hasChangingTable && (
                  <p>
                    <strong>{language === 'zh' ? '換尿布台' : 'Changing Table'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                  </p>
                )}
              </div>
            )}
            {location.hasWiFi && (
              <div className="detail-section">
                <h4>📶 WiFi</h4>
                <p>{language === 'zh' ? '✅ 有免費WiFi' : '✅ Free WiFi Available'}</p>
              </div>
            )}
            {location.allergens && location.allergens.commonAllergens && location.allergens.commonAllergens.length > 0 && (
              <div className="detail-section">
                <h4>⚠️ {language === 'zh' ? '常見過敏原' : 'Common Allergens'}</h4>
                <p>{location.allergens.commonAllergens.join(', ')}</p>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Comfort & Crowding */}
        {location.crowding && (
          <CollapsibleSection
            title={language === 'zh' ? '舒適度與人潮' : 'Comfort & Crowding'}
            emoji="👥"
            isExpanded={expandedSections['comfort']}
            onToggle={() => onToggleSection('comfort')}
          >
            <div className="detail-section">
              <h4>👥 {language === 'zh' ? '人氣資訊' : 'Crowding Info'}</h4>
              {location.crowding.quietHours && (
                <p>
                  <strong>{language === 'zh' ? '安靜時段' : 'Quiet Hours'}</strong>: {location.crowding.quietHours}
                </p>
              )}
              {location.crowding.peakHours && (
                <p>
                  <strong>{language === 'zh' ? '尖峰時段' : 'Peak Hours'}</strong>: {location.crowding.peakHours}
                </p>
              )}
              {location.crowding.averageCrowding && (
                <p>
                  <strong>{language === 'zh' ? '平均人潮' : 'Average Crowding'}</strong>: {
                    location.crowding.averageCrowding === 'light' ? (language === 'zh' ? '人少' : 'Light') :
                    location.crowding.averageCrowding === 'moderate' ? (language === 'zh' ? '中等' : 'Moderate') :
                    (language === 'zh' ? '人多' : 'Heavy')
                  }
                </p>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Nursing & Diaper */}
        {location.nursingAmenities && (
          <div className="detail-section">
            <h4>👶 {language === 'zh' ? '哺乳/換尿布設施' : 'Nursing & Diaper Facilities'}</h4>
            {location.nursingAmenities.hasDedicatedArea && (
              <p>
                <strong>{language === 'zh' ? '專用區域' : 'Dedicated Area'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.nursingAmenities.hasChangingTable && (
              <p>
                <strong>{language === 'zh' ? '換尿布台' : 'Changing Table'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.nursingAmenities.hasPowerOutlet && (
              <p>
                <strong>{language === 'zh' ? '電源' : 'Power Outlet'}</strong>: {language === 'zh' ? '✅ 有(可用溫奶器)' : '✅ Available (for warmers)'}
              </p>
            )}
            {location.nursingAmenities.hasRefrigerator && (
              <p>
                <strong>{language === 'zh' ? '冰箱' : 'Refrigerator'}</strong>: {language === 'zh' ? '✅ 有(可冷藏母乳)' : '✅ Available (for breast milk)'}
              </p>
            )}
            {location.nursingAmenities.hasWarmWater && (
              <p>
                <strong>{language === 'zh' ? '熱水' : 'Warm Water'}</strong>: {language === 'zh' ? '✅ 有(可泡奶粉)' : '✅ Available (for formula)'}
              </p>
            )}
          </div>
        )}

        {/* Weather Coverage */}
        {location.weatherCoverage && (
          <div className="detail-section">
            <h4>🌦️ {language === 'zh' ? '天候保護' : 'Weather Coverage'}</h4>
            <p>
              <strong>{language === 'zh' ? '室內/戶外' : 'Indoor/Outdoor'}</strong>: {location.weatherCoverage.isIndoor ? (language === 'zh' ? '🏢 室內' : '🏢 Indoor') : (language === 'zh' ? '🏞️ 戶外' : '🏞️ Outdoor')}
            </p>
            {location.weatherCoverage.hasRoof && (
              <p>
                <strong>{language === 'zh' ? '有屋頂' : 'Has Roof'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
              </p>
            )}
            {location.weatherCoverage.hasShade && (
              <p>
                <strong>{language === 'zh' ? '有遮蔭' : 'Has Shade'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
              </p>
            )}
            {location.weatherCoverage.weatherProtection && (
              <p>
                <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {location.weatherCoverage.weatherProtection}
              </p>
            )}
          </div>
        )}

        {/* Nearby Amenities */}
        {location.nearbyAmenities && (
          <div className="detail-section">
            <h4>🏪 {language === 'zh' ? '附近設施' : 'Nearby Amenities'}</h4>
            {location.nearbyAmenities.convenientStores !== undefined && location.nearbyAmenities.convenientStores > 0 && (
              <p>
                <strong>{language === 'zh' ? '便利商店' : 'Convenient Stores'}</strong>: {location.nearbyAmenities.convenientStores} {language === 'zh' ? '家(200m內)' : ' shops (within 200m)'}
              </p>
            )}
            {location.nearbyAmenities.nearbyRestrooms && (
              <p>
                <strong>{language === 'zh' ? '附近廁所' : 'Nearby Restrooms'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.nearbyAmenities.nearbyRestaurants && (
              <p>
                <strong>{language === 'zh' ? '附近餐廳' : 'Nearby Restaurants'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.nearbyAmenities.nearbyPublicTransit && (
              <p>
                <strong>{language === 'zh' ? '大眾運輸' : 'Public Transit'}</strong>: {location.nearbyAmenities.nearbyPublicTransit}
              </p>
            )}
          </div>
        )}

        {/* Accessibility */}
        {location.accessibility && (
          <div className="detail-section">
            <h4>♿ {language === 'zh' ? '無障礙設施' : 'Accessibility Features'}</h4>
            {location.accessibility.wheelchairAccessible && (
              <p>
                <strong>{language === 'zh' ? '輪椅可進入' : 'Wheelchair Accessible'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
              </p>
            )}
            {location.accessibility.accessibleToilet && (
              <p>
                <strong>{language === 'zh' ? '無障礙廁所' : 'Accessible Toilet'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.accessibility.disabledParking && (
              <p>
                <strong>{language === 'zh' ? '身心障礙停車位' : 'Disabled Parking'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.accessibility.hasElevator && (
              <p>
                <strong>{language === 'zh' ? '電梯' : 'Elevator'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.accessibility.hasRamp && (
              <p>
                <strong>{language === 'zh' ? '坡道' : 'Ramp'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.accessibility.accessibilityNotes && (
              <p>
                <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {location.accessibility.accessibilityNotes}
              </p>
            )}
          </div>
        )}

        {/* Activity */}
        {location.activity && (
          <div className="detail-section">
            <h4>🎪 {language === 'zh' ? '遊戲活動' : 'Activities & Equipment'}</h4>
            {location.activity.mainActivities && (
              <p>
                <strong>{language === 'zh' ? '主要活動' : 'Main Activities'}</strong>: {location.activity.mainActivities}
              </p>
            )}
            {location.activity.activityTypes && location.activity.activityTypes.length > 0 && (
              <p>
                <strong>{language === 'zh' ? '活動類型' : 'Activity Types'}</strong>: {location.activity.activityTypes.join(', ')}
              </p>
            )}
            {location.activity.equipment && location.activity.equipment.length > 0 && (
              <p>
                <strong>{language === 'zh' ? '設施設備' : 'Equipment'}</strong>: {location.activity.equipment.join(', ')}
              </p>
            )}
            {location.activity.ageAppropriate && (
              <p>
                <strong>{language === 'zh' ? '適合年齡' : 'Age Range'}</strong>: {location.activity.ageAppropriate.minAge || 0} - {location.activity.ageAppropriate.maxAge || '18'} {language === 'zh' ? '歲' : ' years'}
              </p>
            )}
          </div>
        )}

        {/* Safety */}
        {location.safety && (
          <div className="detail-section">
            <h4>🛡️ {language === 'zh' ? '安全信息' : 'Safety Information'}</h4>
            {location.safety.safetyRating && (
              <p>
                <strong>{language === 'zh' ? '安全評分' : 'Safety Rating'}</strong>: {'⭐'.repeat(Math.round(location.safety.safetyRating))} ({location.safety.safetyRating.toFixed(1)}/5)
              </p>
            )}
            {location.safety.playAreaSafety && (
              <p>
                <strong>{language === 'zh' ? '遊戲區安全' : 'Play Area Safety'}</strong>: {language === 'zh' ?
                  (location.safety.playAreaSafety === 'excellent' ? '🟢 優良' :
                   location.safety.playAreaSafety === 'good' ? '🟢 良好' :
                   location.safety.playAreaSafety === 'fair' ? '🟡 普通' : '🔴 需改善') :
                  (location.safety.playAreaSafety === 'excellent' ? '🟢 Excellent' :
                   location.safety.playAreaSafety === 'good' ? '🟢 Good' :
                   location.safety.playAreaSafety === 'fair' ? '🟡 Fair' : '🔴 Needs Improvement')}
              </p>
            )}
            {location.safety.firstAidAvailable && (
              <p>
                <strong>{language === 'zh' ? '急救設備' : 'First Aid Available'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Yes'}
              </p>
            )}
            {location.safety.supervisionAvailable && (
              <p>
                <strong>{language === 'zh' ? '工作人員監督' : 'Staff Supervision'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
              </p>
            )}
            {location.safety.safetyNotes && (
              <p>
                <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {location.safety.safetyNotes}
              </p>
            )}
          </div>
        )}

        {/* Quality Metrics */}
        {location.qualityMetrics && (
          <div className="detail-section">
            <h4>✨ {language === 'zh' ? '清潔與維護' : 'Cleanliness & Maintenance'}</h4>
            {location.qualityMetrics.cleanlinessRating && (
              <p>
                <strong>{language === 'zh' ? '清潔度評分' : 'Cleanliness Rating'}</strong>: {'⭐'.repeat(Math.round(location.qualityMetrics.cleanlinessRating))} ({location.qualityMetrics.cleanlinessRating.toFixed(1)}/5)
              </p>
            )}
            {location.qualityMetrics.maintenanceStatus && (
              <p>
                <strong>{language === 'zh' ? '維護狀態' : 'Maintenance Status'}</strong>: {language === 'zh' ?
                  (location.qualityMetrics.maintenanceStatus === 'excellent' ? '🟢 優良' :
                   location.qualityMetrics.maintenanceStatus === 'good' ? '🟢 良好' :
                   location.qualityMetrics.maintenanceStatus === 'fair' ? '🟡 普通' : '🔴 需改善') :
                  (location.qualityMetrics.maintenanceStatus === 'excellent' ? '🟢 Excellent' :
                   location.qualityMetrics.maintenanceStatus === 'good' ? '🟢 Good' :
                   location.qualityMetrics.maintenanceStatus === 'fair' ? '🟡 Fair' : '🔴 Needs Improvement')}
              </p>
            )}
            {location.qualityMetrics.lastMaintenanceDate && (
              <p>
                <strong>{language === 'zh' ? '最後維護日期' : 'Last Maintenance'}</strong>: {new Date(location.qualityMetrics.lastMaintenanceDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
              </p>
            )}
            {location.qualityMetrics.cleanlinessNotes && (
              <p>
                <strong>{language === 'zh' ? '清潔說明' : 'Cleanliness Notes'}</strong>: {location.qualityMetrics.cleanlinessNotes}
              </p>
            )}
          </div>
        )}

        {/* Crowdedness Reports Section */}
        <CollapsibleSection
          title={language === 'zh' ? '實時人潮報告' : 'Real-time Crowding Reports'}
          emoji="👥"
          isExpanded={expandedSections['crowdedness']}
          onToggle={() => onToggleSection('crowdedness')}
        >
          <div className="detail-section">
            <CrowdednessReportForm
              onSubmit={onCrowdednessReportSubmit}
              language={language}
            />
            <CrowdednessReportList
              reports={crowdednessReports}
              language={language}
            />
          </div>
        </CollapsibleSection>

        {/* Events Section */}
        <EventsList
          events={events}
          language={language}
        />

        {/* Reviews Section */}
        <div className="detail-section">
          <h3>{language === 'zh' ? '用戶評論' : 'User Reviews'}</h3>
          <ReviewForm onSubmit={onReviewSubmit} />
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
