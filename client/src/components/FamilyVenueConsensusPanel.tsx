import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import {
  findConsensusVenues,
  findCompromiseVenues,
  getSummaryStats,
  type FamilyMember,
  type VenueCompatibilityScore,
} from '../utils/familyVenueConsensus';
import type { Location } from '../types';
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Smile,
  Frown,
  Meh,
  Users2,
} from 'lucide-react';

interface FamilyVenueConsensusPanelProps {
  members: FamilyMember[];
  venues: Location[];
  onVenueSelected?: (venue: Location) => void;
}

export const FamilyVenueConsensusPanel: React.FC<FamilyVenueConsensusPanelProps> = ({
  members,
  venues,
  onVenueSelected,
}) => {
  const { language } = useLanguage();
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);

  const consensusResult = useMemo(
    () => findConsensusVenues(members, venues, 5),
    [members, venues]
  );

  const summaryStats = useMemo(
    () => getSummaryStats(members, venues),
    [members, venues]
  );

  const compromiseVenues = useMemo(
    () => findCompromiseVenues(members, venues, 3),
    [members, venues]
  );

  const translations = {
    en: {
      title: 'Family Venue Consensus',
      subtitle: 'Find venues everyone will enjoy',
      memberCount: `${members.length} family members reviewing options`,
      topChoices: 'Top Recommendations',
      conflicts: 'Preference Differences',
      recommendations: 'Smart Suggestions',
      compromises: 'Compromise Options',
      consensusStrong: 'Strong Consensus',
      consensusModerate: 'Good Compromise',
      consensusWeak: 'Mixed Opinions',
      consensusConflicted: 'Conflicting Preferences',
      satisfaction: 'Group Satisfaction',
      score: 'Compatibility Score',
      noConflicts: 'Everyone agrees on preferences!',
      selectVenue: 'Select This Venue',
      memberScores: 'Member Compatibility',
      allSatisfied: 'All members satisfied',
      someSatisfied: 'Most members satisfied',
      mixed: 'Mixed satisfaction',
      compromiseRating: 'Compromise Quality',
      avgScore: 'Average Group Score',
      consensusRate: 'Venues with Strong Consensus',
      popularCategory: 'Most Popular Category',
      commonFacilities: 'Shared Preferences',
    },
    zh: {
      title: '家庭場地共識',
      subtitle: '找到每個人都喜歡的地方',
      memberCount: `${members.length} 位家庭成員評估選項`,
      topChoices: '推薦排名',
      conflicts: '偏好差異',
      recommendations: '智慧建議',
      compromises: '折衷選項',
      consensusStrong: '強烈共識',
      consensusModerate: '良好折衷',
      consensusWeak: '意見分歧',
      consensusConflicted: '偏好衝突',
      satisfaction: '群體滿意度',
      score: '相容性評分',
      noConflicts: '每個人都同意偏好！',
      selectVenue: '選擇此地點',
      memberScores: '成員相容性',
      allSatisfied: '所有成員滿意',
      someSatisfied: '大多數成員滿意',
      mixed: '滿意度混合',
      compromiseRating: '折衷品質',
      avgScore: '平均群體評分',
      consensusRate: '強烈共識場地',
      popularCategory: '最受歡迎的類別',
      commonFacilities: '共享偏好',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const renderConsensusLevel = (level: string) => {
    const config = {
      strong: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      moderate: { icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      weak: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
      conflicted: { icon: Frown, color: 'text-red-600', bg: 'bg-red-50' },
    };

    const conf = config[level as keyof typeof config] || config.weak;
    const Icon = conf.icon;

    return <Icon className={`w-5 h-5 ${conf.color}`} />;
  };

  const renderMemberCompatibility = (venueSCore: VenueCompatibilityScore) => {
    return (
      <div className="space-y-2">
        {members.map((member) => {
          const score = venueSCore.memberScores.get(member.id) || 0;
          const isSatisfied = score > 60;

          return (
            <div key={member.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{member.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      isSatisfied ? 'bg-green-600' : score > 40 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right">{score}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVenueCard = (venue: VenueCompatibilityScore, index: number) => {
    const isExpanded = expandedVenue === venue.venueId;

    return (
      <div
        key={venue.venueId}
        className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setExpandedVenue(isExpanded ? null : venue.venueId)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
            <h3 className="font-bold text-lg">{venue.venueName}</h3>
          </div>
          {renderConsensusLevel(venue.consensusLevel)}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-blue-50 rounded p-2">
            <div className="text-xs text-gray-600">{t.score}</div>
            <div className="text-xl font-bold text-blue-600">{venue.overallScore}</div>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <div className="text-xs text-gray-600">{t.satisfaction}</div>
            <div className="text-xl font-bold text-purple-600">
              {venue.satisfiedMembers.length}/{members.length}
            </div>
          </div>
          <div className="bg-indigo-50 rounded p-2">
            <div className="text-xs text-gray-600">{t.compromiseRating}</div>
            <div className="text-xl font-bold text-indigo-600">{venue.compromiseRating}</div>
          </div>
        </div>

        {/* Recommendation */}
        <p className="text-sm text-gray-700 mb-3 italic">{venue.recommendationReason}</p>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t pt-3 space-y-3">
            {/* Member Scores */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t.memberScores}</h4>
              {renderMemberCompatibility(venue)}
            </div>

            {/* Conflict Areas */}
            {venue.conflictAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t.conflicts}
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {venue.conflictAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Select Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVenueSelected?.(venues.find((v) => v.id === venue.venueId)!);
              }}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
            >
              {t.selectVenue}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
        <p className="text-sm text-gray-500 mt-1">{t.memberCount}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="text-xs text-gray-600">{t.avgScore}</div>
          <div className="text-2xl font-bold text-blue-600">{summaryStats.averageGroupScore}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="text-xs text-gray-600">{t.consensusRate}</div>
          <div className="text-2xl font-bold text-green-600">{summaryStats.consensusPercentage}%</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="text-xs text-gray-600">{t.popularCategory}</div>
          <div className="text-lg font-bold text-purple-600">{summaryStats.mostRequestedCategory || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
          <div className="text-xs text-gray-600">{t.commonFacilities}</div>
          <div className="text-lg font-bold text-indigo-600">{summaryStats.commonFacilities.length}</div>
        </div>
      </div>

      {/* Preference Conflicts */}
      {consensusResult.conflictingPreferences.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t.conflicts}
          </h3>
          <ul className="space-y-1">
            {consensusResult.conflictingPreferences.map((conflict, idx) => (
              <li key={idx} className="text-sm text-yellow-800">
                • {conflict}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Recommendations */}
      {consensusResult.topChoices.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t.topChoices}
          </h3>
          <div className="space-y-3">
            {consensusResult.topChoices.map((venue, idx) => renderVenueCard(venue, idx))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {consensusResult.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Smile className="w-5 h-5" />
            {t.recommendations}
          </h3>
          <ul className="space-y-1">
            {consensusResult.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-800">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compromise Options */}
      {compromiseVenues.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            {t.compromises}
          </h3>
          <div className="space-y-2">
            {compromiseVenues.map((venue) => (
              <div key={venue.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">{venue.name?.en || 'Unknown'}</span>
                </div>
                <button
                  onClick={() => onVenueSelected?.(venue)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t.selectVenue}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {consensusResult.topChoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No venues available for family consensus</p>
        </div>
      )}
    </div>
  );
};
