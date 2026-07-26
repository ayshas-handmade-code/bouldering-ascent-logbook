/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClimbingSession, RouteLog } from '../../types';
import { exportLogToCSV, downloadCSVFile } from '../../utils';
import PhotoViewer from '../PhotoViewer';
import {
  Download, Filter, Search, Calendar, MapPin,
  Trash2, Edit, ChevronRight, Star, Plus, CheckCircle2,
  Award, Zap, Building2, Trees, SlidersHorizontal, Layers, GripHorizontal,
  ChevronDown

} from 'lucide-react';
import SessionImporter from '../session-import/SessionImport';

import styles from './LogbookTab.module.css';
import LogbookCardHeader from './logbook-card-header';

interface LogbookTabProps {
  sessions: ClimbingSession[];
  onAddSession: () => void;
  onEditSession: (session: ClimbingSession) => void;
  onDeleteSession: (id: string) => void;
  onToggleRouteFavorite: (sessionId: string, routeId: string) => void;
  selectedSessionId?: string | null;
}

export default function LogbookTab({
  sessions,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onToggleRouteFavorite,
  selectedSessionId,
}: LogbookTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState<'all' | 'gym' | 'outdoor'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>(() => {
    // If selectedSessionId is passed, pre-expand it
    if (selectedSessionId) {
      return { [selectedSessionId]: true };
    }
    return {};
  });

  // Export entire log to CSV file
  const handleCSVExport = () => {
    if (sessions.length === 0) {
      alert('Your logbook is empty. Record some sessions to export');
      return;
    }
    const csvContent = exportLogToCSV(sessions);
    downloadCSVFile(csvContent, `${new Date().toISOString()}-climbing_sessions_logbook.csv`);
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter logs based on filters
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredSessions = sortedSessions.filter(session => {
    // 1. Search term (matches location name or session notes)
    const matchesSearch =
      session.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Location type
    const matchesType =
      locationTypeFilter === 'all' ||
      session.locationType === locationTypeFilter;

    // 3. Favorites only (sessions with at least one favorite route)
    const matchesFavorites =
      !showFavoritesOnly ||
      session.routes.some(r => r.isFavorite);

    return matchesSearch && matchesType && matchesFavorites;
  });

  return (
    <div id="logbook-tab-container" className="space-y-6 pb-24 animate-fade-in font-sans">
      {/* Logbook Header */}
      <div className={`flex justify-between items-center bg-cream-card p-5 
        rounded-[24px] border border-rose-border shadow-xs 
        ${styles.import_export_container}`}
      >
        <div>
          <h2 className="text-sm font-display font-bold text-choco-dark">Crag Journal 📖</h2>
          <p className="text-[11px] text-choco-medium font-medium mt-0.5 leading-none">Your sweet climbing chronicles ✨</p>
        </div>

        <div className="flex gap-2">
          {/* CSV Download Action */}
          <button
            id="btn-export-csv"
            onClick={handleCSVExport}
            title="Download CSV Backup"
            className="px-3 py-2.5 bg-sky-accent/20 hover:bg-sky-accent/30 text-choco-dark rounded-full border border-sky-accent/50 transition-all font-display font-bold text-[10px] flex items-center gap-1 active:scale-95 shadow-3xs"
          >
            <Download className="w-3.5 h-3.5 text-choco-dark" />
            Export
          </button>

          <SessionImporter />

          {/* New session button */}
          <button
            id="btn-add-session-tab"
            onClick={onAddSession}
            className="px-4 py-2.5 bg-gradient-to-r from-accent to-accent-hover active:scale-95 text-choco-dark rounded-full text-[10px] font-display font-bold flex items-center gap-1 transition-all shadow-sm shadow-accent/15"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Log
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-cream-card p-5 rounded-[24px] border border-rose-border shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-choco-light" />
          </span>
          <input
            id="search-sessions-input"
            type="text"
            placeholder="Search by gym or notes... 🧸"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-cream-base border border-rose-border rounded-full focus:outline-none focus:border-accent transition-all font-display font-semibold text-choco-dark placeholder-choco-light/60"
          />
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex gap-1.5 text-[10px] font-display font-bold">
            <button
              id="filter-type-all"
              onClick={() => setLocationTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-full border transition-all ${locationTypeFilter === 'all'
                ? 'bg-accent border-accent text-choco-dark shadow-3xs'
                : 'bg-cream-base border-rose-border/55 text-choco-medium hover:bg-rose-border/20'
                }`}
            >
              All Sites
            </button>
            <button
              id="filter-type-gym"
              onClick={() => setLocationTypeFilter('gym')}
              className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1 
                ${locationTypeFilter === 'gym'
                  ? 'bg-accent border-accent text-choco-dark shadow-3xs'
                  : 'bg-cream-base border-rose-border/55 text-choco-medium hover:bg-rose-border/20'
                }`}
            >
              <Building2 className="w-3 h-3" /> Gyms
            </button>
            <button
              id="filter-type-outdoor"
              onClick={() => setLocationTypeFilter('outdoor')}
              className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1 
                ${locationTypeFilter === 'outdoor'
                  ? 'bg-accent border-accent text-choco-dark shadow-3xs'
                  : 'bg-cream-base border-rose-border/55 text-choco-medium hover:bg-rose-border/20'
                }`}
            >
              <Trees className="w-3 h-3" /> Crags
            </button>
          </div >

          <label className="flex items-center gap-1.5 text-[11px] font-display font-bold text-choco-medium cursor-pointer select-none">
            <input
              id="checkbox-favorites-only"
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="rounded-full border-rose-border text-accent focus:ring-accent w-4 h-4 cursor-pointer accent-accent"
            />
            <span>Starred Climbs ⭐️</span>
          </label>
        </div >
      </div >

      {/* SESSIONS CHRONOLOGICAL CARDS */}
      < div className="space-y-4" >
        {
          filteredSessions.map((session) => {
            const isExpanded = expandedSessions[session.id] || false;

            return (
              <div
                id={`session-card-${session.id}`}
                key={session.id}
                className={`bg-cream-card rounded-[28px] border transition-all shadow-2xs overflow-hidden 
                ${isExpanded
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-rose-border/80 hover:border-accent'
                  }`}
              >
                <LogbookCardHeader
                  session={session}
                  onEditSession={onEditSession}
                  onDeleteSession={onDeleteSession}
                  toggleSessionExpand={toggleSessionExpand}
                  isExpanded={isExpanded}
                />

                {/* Expandable Route Listings */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-rose-border/40 pt-4 bg-cookie-bg/60 space-y-4">
                    {session.notes && (
                      <div className={`${styles.dot_grid_background} bg-cream-card/90 p-4 rounded-[20px] border border-rose-border shadow-3xs`}>
                        <p className="text-[10px] font-display font-bold text-choco-light uppercase tracking-wider mb-1">Session Summary Notes 🧸</p>
                        <p className="text-xs font-medium text-choco-medium whitespace-pre-line leading-relaxed italic">
                          "{session.notes}"
                        </p>
                      </div>
                    )}

                    {/* Route Columns */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-display font-bold tracking-widest text-choco-light">Climb Route Details</p>

                      {session.routes.map((route) => (
                        <div
                          id={`sess-route-item-${route.id}`}
                          key={route.id}
                          className="bg-cream-card p-4 rounded-2xl border border-rose-border shadow-2xs flex flex-col gap-3 hover:border-accent transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">


                              <div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Color badge tag */}
                                  <span
                                    id={`log-route-color-tag-${route.id}`}
                                    className="w-4 h-4 rounded-full border border-rose-border/60 flex items-center shrink-0 justify-center shadow-xs animate-fade-in"
                                    style={{ backgroundColor: route.color === 'Black' ? '#18181b' : route.color === 'White' ? '#fafafa' : route.color }}
                                  />
                                  <span className="text-[10px] bg-accent/15 border border-rose-border/40 px-2 py-0.5 rounded-full text-choco-medium font-display font-semibold lowercase">
                                    {route.color}
                                  </span>
                                  <span className="text-sm font-display font-bold text-choco-dark bg-cream-base px-2 py-0.5 rounded-lg">
                                    {route.grade}
                                  </span>
                                  <span className="text-[10px] bg-sky-accent/20 border border-sky-accent/40 px-2 py-0.5 rounded-full text-choco-medium font-display font-semibold lowercase">
                                    {route.wallLocation}
                                  </span>
                                </div>

                                {/* Holst & Styles details column */}
                                <div className="flex items-center gap-1 flex-wrap mt-2.5">
                                  {route.holdsType.map(hold => (
                                    <span key={hold} className="text-[10px] bg-cream-base border border-rose-border/30 text-choco-medium font-display font-medium px-2 py-0.5 rounded-full lowercase">
                                      {hold} 🍬
                                    </span>
                                  ))}
                                  {route.routeType.map(type => (
                                    <span key={type} className="text-[10px] bg-mint-accent/20 border border-mint-accent/40 text-choco-medium font-display font-medium px-2 py-0.5 rounded-full lowercase">
                                      {type} 🌿
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Star triggers */}
                              <button
                                id={`btn-favorite-route-${route.id}`}
                                onClick={() => onToggleRouteFavorite(session.id, route.id)}
                                className={`p-1.5 rounded-full transition-all border 
                                ${route.isFavorite
                                    ? 'bg-accent/20 text-berry-accent border-accent/60'
                                    : 'bg-cream-base text-choco-light border-rose-border/50 hover:bg-rose-border/20'
                                  }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${route.isFavorite ? 'fill-accent' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Climb Route specific stats metrics & Image */}
                          <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-dashed border-rose-border/40 font-sans">
                            <div className="flex gap-4 flex-wrap">
                              <div className="text-center bg-cream-base border border-rose-border/50 px-3 py-1.5 rounded-xl block shadow-3xs">
                                <span className="flex text-[8px] font-display font-bold text-choco-light uppercase">Attempts</span>
                                <span className="text-[11px] font-display font-semibold text-choco-dark">{route.attempts}</span>
                              </div>

                              {route.sends > 0 ? (
                                <div className="flex-col gap-2 text-center bg-mint-accent/15 border border-mint-accent/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-mint-accent" />
                                    <span className="block text-[8px] font-display font-bold text-choco-medium uppercase">Sends</span>
                                  </div>
                                  <span className="text-[11px] font-display font-semibold text-choco-dark">{route.sends}</span>
                                </div>
                              ) : (
                                <div className="flex-col gap-2 text-center bg-cream-base border border-rose-border/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                  <div className="text-left">
                                    <span className="w-1.5 h-1.5 rounded-full bg-choco-light" />
                                    <span className="block text-[8px] font-display font-bold text-choco-light uppercase">Sends</span>
                                  </div>
                                  <span className="text-[11px] font-display font-semibold text-choco-light">None</span>

                                </div>
                              )}

                              {route.flashes > 0 && (
                                <div className="flex-col gap-2 items-center text-center bg-sky-accent/20 border border-sky-accent/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs animate-pulse">
                                  <div className="flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-sky-accent fill-sky-accent" />
                                    <span className="block text-[8px] font-display font-bold text-choco-medium uppercase">
                                      Flash
                                    </span>
                                  </div>
                                  <span className="text-[16px] font-display font-bold text-choco-dark uppercase  mt-[-5px]">
                                    🏆
                                  </span>

                                </div>
                              )}
                            </div>

                            {/* Render Climb Image from IndexedDB Storage if photoId exists */}
                            {route.photoId && (
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-display font-bold uppercase text-choco-light">View Photo:</span>
                                <PhotoViewer
                                  photoId={route.photoId}
                                  className="w-9 h-9 border border-rose-border object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all rounded-lg shadow-3xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        }

        {
          filteredSessions.length === 0 && (
            <div className="text-center py-16 bg-cream-card rounded-[28px] border-2 border-dashed border-rose-border shadow-sm">
              <Filter className="w-10 h-10 text-rose-border mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-display font-bold text-choco-dark">No sessions found 🎈</p>
              <p className="text-xs text-choco-light font-display font-semibold mt-1">Adjust filters or record a new sweet climb.</p>

              <button
                id="btn-add-session-empty"
                onClick={onAddSession}
                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-choco-dark text-xs font-display font-bold rounded-full transition-all flex items-center gap-1.5 mx-auto active:scale-95 shadow-md shadow-accent/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Log First Sessions
              </button>
            </div>
          )
        }
      </div >
    </div >
  );
}
