/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingStats } from '../../types';
import { Trophy, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  stats: ClimbingStats;
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div id="dashboard-header-container" className="bg-cream-card border border-rose-border p-6 rounded-[28px] text-choco-dark shadow-sm relative overflow-hidden">
      {/* Abstract background grid subtle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#FFD3DC_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="relative flex justify-between items-start">
        <div>
          <span className="text-[10px] bg-accent/20 border border-accent/40 px-3 py-1 text-choco-medium font-display font-semibold rounded-full flex items-center gap-1 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-accent fill-accent" /> MY CLIMBY ADVENTURES 🌸
          </span>
          <h1 className="text-xl font-display font-bold mt-2.5 tracking-tight leading-none text-choco-dark">
            Personal Progress ✨
          </h1>
          <p className="text-[11px] text-choco-medium mt-1">Crush every hold, reach the sky! 🧗‍♀️</p>
        </div>
        <div className="p-2.5 bg-accent/20 border border-rose-border rounded-full text-accent shadow-xs">
          <Trophy className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Major Counters Grid */}
      <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-rose-border/40 bg-cookie-bg/60 rounded-2xl p-3">
        <div className="text-center">
          <p className="text-[10px] text-choco-light font-display font-medium uppercase">Sessions</p>
          <p className="text-base font-display font-bold mt-1 text-choco-dark">🍪 {stats.totalSessions}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-choco-light font-display font-medium uppercase">Max Send</p>
          <p className="text-base font-display font-bold mt-1 text-berry-accent animate-pulse">👑 {stats.maxGrade}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-choco-light font-display font-medium uppercase">Flashes</p>
          <p className="text-base font-display font-bold mt-1 text-choco-dark">⚡ {stats.totalFlashes}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-choco-light font-display font-medium uppercase">Rate</p>
          <p className="text-base font-display font-bold mt-1 text-sky-accent">🎈 {stats.flashRate}%</p>
        </div>
      </div>
    </div>
  );
}
