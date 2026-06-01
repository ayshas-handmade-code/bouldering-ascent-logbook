/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingSession } from '../types';
import { getHoldTypeBreakdown, getRouteTypeBreakdown } from '../utils';
import { Compass } from 'lucide-react';

interface StyleAffinityProps {
  sessions: ClimbingSession[];
}

export default function StyleAffinity({ sessions }: StyleAffinityProps) {
  const topHolds = getHoldTypeBreakdown(sessions).slice(0, 4);
  const topstyles = getRouteTypeBreakdown(sessions).slice(0, 4);

  return (
    <div className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-xs flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-display font-bold text-choco-dark flex items-center gap-1.5 mb-1">
          <Compass className="w-3.5 h-3.5 text-accent" /> Style Affinity 🍬
        </h4>
        <p className="text-[11px] text-choco-light mb-4">Cozy splits by hold types and walls</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Holds list */}
        <div>
          <p className="text-[10px] uppercase font-display font-bold text-choco-light mb-2">Holds Type</p>
          <div className="space-y-1.5">
            {topHolds.map((h) => (
              <div key={h.name} className="flex items-center justify-between bg-cream-base/50 p-2.5 rounded-2xl border border-rose-border/40 text-[11px] text-choco-medium hover:scale-102 transition-transform shadow-3xs">
                <span className="text-[10px] uppercase font-display font-bold text-choco-medium">{h.name}</span>
                <span className="bg-accent text-choco-dark text-[10px] font-display font-bold px-2 py-0.5 rounded-full">
                  {h.count}
                </span>
              </div>
            ))}
            {topHolds.length === 0 && (
              <span className="text-[10px] text-choco-light italic">None logged yet</span>
            )}
          </div>
        </div>

        {/* Climbing style */}
        <div>
          <p className="text-[10px] uppercase font-display font-bold text-choco-light mb-2">Wall Style</p>
          <div className="space-y-1.5">
            {topstyles.map((style) => (
              <div key={style.name} className="flex items-center justify-between bg-cream-base/50 p-2.5 rounded-2xl border border-rose-border/40 text-[11px] text-choco-medium hover:scale-102 transition-transform shadow-3xs">
                <span className="text-[10px] uppercase font-display font-bold text-choco-medium">{style.name}</span>
                <span className="bg-sky-accent/40 text-choco-dark text-[10px] font-display font-bold px-2 py-0.5 rounded-full">
                  {style.count}
                </span>
              </div>
            ))}
            {topstyles.length === 0 && (
              <span className="text-[10px] text-choco-light italic">None logged yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
