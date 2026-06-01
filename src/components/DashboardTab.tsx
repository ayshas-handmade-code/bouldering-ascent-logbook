/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingSession, Location } from '../types';
import { computeStats } from '../utils';
import DashboardHeader from './DashboardHeader';
import LevelProgressionChart from './LevelProgressionChart';
import GradeSpread from './GradeSpread';
import StyleAffinity from './StyleAffinity';
import StarredItems from './StarredItems';

interface DashboardTabProps {
  sessions: ClimbingSession[];
  locations: Location[];
  onSelectSession: (id: string) => void;
}

export default function DashboardTab({
  sessions,
  locations,
  onSelectSession,
}: DashboardTabProps) {
  const stats = computeStats(sessions);

  return (
    <div id="dashboard-tab-container" className="space-y-6 pb-24 animate-fade-in font-sans">
      
      {/* 1. HERO METRIC SLATE */}
      <DashboardHeader stats={stats} />

      {/* 2. CHRONOLOGICAL PROGRESS CHART */}
      <LevelProgressionChart sessions={sessions} />

      {/* 3. BENTO SECTION: GRADE DISTRIBUTION & SEND TYPES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GradeSpread sessions={sessions} />
        <StyleAffinity sessions={sessions} />
      </div>

      {/* 4. FAVORITED ITEMS LIST (GYMS & ROUTES) */}
      <StarredItems 
        sessions={sessions} 
        locations={locations} 
        onSelectSession={onSelectSession} 
      />

    </div>
  );
}
