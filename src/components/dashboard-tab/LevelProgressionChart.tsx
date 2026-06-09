/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingSession } from '../../types';
import { TrendingUp } from 'lucide-react';

interface LevelProgressionChartProps {
  sessions: ClimbingSession[];
}

export default function LevelProgressionChart({ sessions }: LevelProgressionChartProps) {
  const chronSessions = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8); // Show up to last 8 sessions

  const gradeReferenceList = [
    'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14'
  ];

  const chartData = chronSessions.map((sess) => {
    let maxIdx = -1;
    sess.routes.forEach(r => {
      if (r.sends > 0) {
        const gradeIdx = gradeReferenceList.indexOf(r.grade);
        if (gradeIdx > maxIdx) maxIdx = gradeIdx;
      }
    });
    return {
      label: sess.date.split('-').slice(1).join('/'), // MM/DD
      value: maxIdx === -1 ? 0 : maxIdx + 1, // +1 so V0 is 2, VB is 1, etc.
      grade: maxIdx === -1 ? 'None' : gradeReferenceList[maxIdx],
      location: sess.locationName,
    };
  });

  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i * (svgWidth - paddingX * 2)) / Math.max(1, chartData.length - 1);
    const maxYValue = 16;
    const y = svgHeight - paddingY - (d.value * (svgHeight - paddingY * 2)) / maxYValue;
    return { x, y, ...d };
  });

  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-xs">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xs font-display font-bold text-choco-dark flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-accent" /> Level Progression 📈
          </h3>
          <p className="text-[11px] text-choco-medium font-medium">My peak climb levels per session (last 8 sessions)</p>
        </div>
        <span className="text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-medium px-2.5 py-1 rounded-full font-display font-bold">
          V-SCALE SCALE
        </span>
      </div>

      {sessions.length < 2 ? (
        <div className="h-32 bg-cream-base/50 border border-dashed border-rose-border rounded-[24px] flex items-center justify-center text-center p-4">
          <p className="text-xs text-choco-medium font-medium">
            Log at least <span className="text-accent font-bold">2 climbing sessions</span> to build your cozy trend chart! 🧸
          </p>
        </div>
      ) : (
        <div id="svg-trendline-box" className="w-full overflow-x-auto select-none">
          <div className="min-w-[420px] h-44 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9EB5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF9EB5" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid guidelines */}
              {[0, 4, 8, 12, 16].map((gridVal) => {
                const yVal = svgHeight - paddingY - (gridVal * (svgHeight - paddingY * 2)) / 16;
                return (
                  <g key={gridVal}>
                    <line
                      x1={paddingX}
                      y1={yVal}
                      x2={svgWidth - paddingX}
                      y2={yVal}
                      stroke="#FFF0F2"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingX - 10}
                      y={yVal + 3}
                      fill="#A58B8B"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {gridVal === 0 ? 'None' : `V${gridVal - 1}`}
                    </text>
                  </g>
                );
              })}

              {/* Underlay Ambient Gradient */}
              {areaD && (
                <path d={areaD} fill="url(#chartGradient)" />
              )}

              {/* Connection Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FF9EB5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Circles and Data Values */}
              {points.map((pt, pIdx) => (
                <g key={pIdx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#ffffff"
                    stroke="#FF9EB5"
                    strokeWidth="3"
                  />

                  {/* Grade annotation */}
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    fill="#FF6B8B"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.grade}
                  </text>

                  {/* Date label at bottom */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    fill="#A58B8B"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
