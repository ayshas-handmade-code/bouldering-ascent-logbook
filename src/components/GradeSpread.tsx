/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingSession } from '../types';
import { getGradeBreakdown } from '../utils';
import { Activity } from 'lucide-react';

interface GradeSpreadProps {
  sessions: ClimbingSession[];
}

export default function GradeSpread({ sessions }: GradeSpreadProps) {
  const gradeBreakdown = getGradeBreakdown(sessions);

  return (
    <div className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-xs flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-display font-bold text-choco-dark flex items-center gap-1.5 mb-1">
          <Activity className="w-3.5 h-3.5 text-accent" /> Grade Spread 🍭
        </h4>
        <p className="text-[11px] text-choco-light mb-4">Total sweet ascents completed per difficulty</p>
      </div>

      <div className="space-y-3 flex-1">
        {gradeBreakdown.length === 0 ? (
          <p className="text-xs text-choco-light italic py-6 text-center font-display">No sends yet 🐇</p>
        ) : (
          gradeBreakdown.slice(0, 5).map((g) => {
            const totalClimbs = g.attempts;
            
            return (
              <div key={g.grade} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-choco-dark font-display font-semibold">{g.grade}</span>
                  <span className="text-choco-medium font-medium">
                    {g.sends} Sends <span className="text-[10px] text-choco-light">({g.flashes} Flash ⚡)</span>
                  </span>
                </div>
                {/* Custom dual colored progress bar */}
                <div className="w-full h-3 bg-cream-base rounded-full overflow-hidden flex border border-rose-border/40">
                  <div 
                    className="bg-accent h-full transition-all"
                    style={{ width: `${(g.sends / Math.max(1, totalClimbs)) * 100}%` }}
                  />
                  <div 
                    className="bg-sky-accent h-full transition-all"
                    style={{ width: `${(g.flashes / Math.max(1, totalClimbs)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
