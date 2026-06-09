/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ClimbingSession, RouteLog, Location } from '../../types';
import {
  BOULDERING_GRADES_V,
  BOULDERING_GRADES_FONT,
  HOLD_TYPES,
  ROUTE_TYPES,
  CLIMB_COLORS,
  WALL_LOCATIONS
} from '../../data';
import { processPhotoUpload } from '../../utils';
import { savePhoto, getPhoto } from '../../photoStore';
import {
  X, Plus, ChevronDown, Check, Star, Sparkles,
  Camera, Trash2, Calendar, MapPin, AlignLeft, Info
} from 'lucide-react';
import RouteGrade from './RouteGrade';
import RouteColor from './RouteColor';

interface SessionFormProps {
  locations: Location[];
  sessionToEdit?: ClimbingSession | null;
  onSave: (session: ClimbingSession) => void;
  onClose: () => void;
}

export default function SessionForm({
  locations,
  sessionToEdit,
  onSave,
  onClose,
}: SessionFormProps) {
  // Session levels state
  const [date, setDate] = useState<string>(
    sessionToEdit?.date || new Date().toISOString().split('T')[0]
  );
  const [locationId, setLocationId] = useState<string>(
    sessionToEdit?.locationId || (locations[0]?.id || '')
  );
  const [notes, setNotes] = useState<string>(sessionToEdit?.notes || '');
  const [routes, setRoutes] = useState<RouteLog[]>(sessionToEdit?.routes || []);

  // System settings
  const [activeGradeSystem, setActiveGradeSystem] = useState<'v' | 'font'>('v');
  const [collapsedRoutes, setCollapsedRoutes] = useState<Record<string, boolean>>({});

  // Error validations
  const [errors, setErrors] = useState<string | null>(null);

  // Pre-load photo previews for current routes if editing
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sessionToEdit?.routes) {
      sessionToEdit.routes.forEach(async (route) => {
        if (route.photoId) {
          const base64 = await getPhoto(route.photoId);
          if (base64) {
            setPhotoPreviews(prev => ({ ...prev, [route.id]: base64 }));
          }
        }
      });
    }
  }, [sessionToEdit]);

  const handleAddRoute = () => {
    const newRoute: RouteLog = {
      id: `new-route-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      grade: activeGradeSystem === 'v' ? 'V3' : '6A',
      color: 'Red',
      wallLocation: WALL_LOCATIONS[0] || 'Main Boulder',
      holdsType: [],
      routeType: [],
      attempts: 1,
      sends: 1,
      flashes: 1, // Flashed is default if 1 attempt and sent
      isFavorite: false,
    };
    setRoutes([...routes, newRoute]);
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
    // Clean preview state
    const updatedPreviews = { ...photoPreviews };
    delete updatedPreviews[id];
    setPhotoPreviews(updatedPreviews);
  };

  const handleUpdateRouteField = <K extends keyof RouteLog>(
    routeId: string,
    field: K,
    value: RouteLog[K]
  ) => {
    setRoutes(
      routes.map((r) => {
        if (r.id !== routeId) return r;

        const updated = { ...r, [field]: value };

        // Auto-synchronize attempts, sends, and flashes
        if (field === 'flashes' && value === 1) {
          updated.attempts = 1;
          updated.sends = 1;
        } else if (field === 'attempts' || field === 'sends') {
          // If attempts are more than 1 or sends is 0, it cannot be a flash
          if (updated.attempts !== 1 || updated.sends === 0) {
            updated.flashes = 0;
          } else if (updated.attempts === 1 && updated.sends > 0) {
            updated.flashes = 1;
          }
        }

        return updated;
      })
    );
  };

  const handlePhotoUpload = async (routeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const resizedBase64 = await processPhotoUpload(file);
      const photoId = `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Save directly to raw IndexedDB
      await savePhoto(photoId, resizedBase64);

      // Update routes state
      handleUpdateRouteField(routeId, 'photoId', photoId);
      setPhotoPreviews(prev => ({ ...prev, [routeId]: resizedBase64 }));
    } catch (err) {
      console.error('Failed to upload/compress photo:', err);
      alert('Error compressing climbing photo. Please try a different photo.');
    }
  };

  const handleRemovePhoto = (routeId: string) => {
    handleUpdateRouteField(routeId, 'photoId', undefined);
    const updated = { ...photoPreviews };
    delete updated[routeId];
    setPhotoPreviews(updated);
  };

  const handleHoldTypeToggle = (routeId: string, hold: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const currentHolds = route.holdsType;
    const nextHolds = currentHolds.includes(hold)
      ? currentHolds.filter(h => h !== hold)
      : [...currentHolds, hold];

    handleUpdateRouteField(routeId, 'holdsType', nextHolds);
  };

  const handleRouteTypeToggle = (routeId: string, type: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const currentstyles = route.routeType;
    const nextstyles = currentstyles.includes(type)
      ? currentstyles.filter(t => t !== type)
      : [...currentstyles, type];

    handleUpdateRouteField(routeId, 'routeType', nextstyles);
  };

  const toggleRouteCollapse = (routeId: string) => {
    setCollapsedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    // Form validation
    if (!locationId) {
      setErrors('Please select a climbing location.');
      return;
    }

    if (routes.length === 0) {
      setErrors('Please add at least one climb/route to this session.');
      return;
    }

    // Checking required route fields (grade, color, wallLocation are mandatory)
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (!route.grade) {
        setErrors(`Class log #${i + 1} is missing a required Difficulty Grade.`);
        return;
      }
      if (!route.color) {
        setErrors(`Class log #${i + 1} is missing a required Hold Color.`);
        return;
      }
      if (!route.wallLocation || !route.wallLocation.trim()) {
        setErrors(`Climb #${i + 1} needs a Wall Location (e.g., "The Cave", "East Wall").`);
        return;
      }
    }

    const selectedLoc = locations.find(loc => loc.id === locationId);
    if (!selectedLoc) {
      setErrors('Invalid climbing location selected.');
      return;
    }

    const completedSession: ClimbingSession = {
      id: sessionToEdit?.id || `sess-${Date.now()}`,
      date,
      locationId,
      locationName: selectedLoc.name,
      locationType: selectedLoc.type,
      climbsCount: routes.length,
      notes,
      routes,
    };

    onSave(completedSession);
  };

  return (
    <div id="session-form-modal-overlay"
      className="fixed  items-center inset-0 bg-choco-dark/40 backdrop-blur-xs z-40 flex flex-col justify-end sm:justify-center p-0 sm:p-4 transition-all">
      <div
        id="session-form-container"
        className="bg-cream-card w-full sm:max-w-2xl sm:rounded-[32px] shadow-xl flex flex-col max-h-[92vh] sm:max-h-[85vh] rounded-t-none border border-rose-border overflow-hidden animate-slide-up"
      >
        {/* Modal Header */}
        <div className="bg-cream-card px-5 py-4 border-b border-rose-border/50 flex items-center justify-between shadow-2xs">
          <div>
            <span className="bg-accent/25 border border-accent/40 text-[9px] font-display font-bold uppercase px-2.5 py-0.5 rounded-full block w-fit mb-0.5 text-choco-medium">
              {sessionToEdit ? 'Modify Ascent 🧗‍♀️' : 'New Session 🌟'}
            </span>
            <h2 className="text-sm font-display font-bold text-choco-dark uppercase leading-none mt-1">
              {sessionToEdit ? 'Edit Session Log' : 'Log Climbing Session'}
            </h2>
          </div>
          <button
            id="btn-close-session-form"
            onClick={onClose}
            className="p-1.5 bg-cream-base border border-rose-border text-choco-medium hover:text-choco-dark rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Section 1: Session Details */}
          <div className="bg-cream-card/90 p-5 rounded-[24px] border border-rose-border/80 space-y-4 shadow-3xs">
            <h3 className="text-[10px] font-display font-bold text-choco-dark uppercase flex items-center gap-1 border-b border-rose-border/30 pb-2">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Session Info 🧸
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display font-bold uppercase text-choco-medium mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-choco-light" /> Climb Date *
                </label>
                <input
                  id="session-date-picker"
                  type="date"
                  value={date}
                  max={new Date().toISOString().split('T')[0]} // limit to today/past
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2.5 outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold uppercase text-choco-medium mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-choco-light" /> Spot Location *
                </label>
                <div className="relative">
                  <select
                    id="session-location-selector"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full text-xs font-display font-semibold appearance-none text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2.5 pr-10 outline-none focus:border-accent"
                  >
                    <option value="" disabled>Choose Spot...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-cream-card text-choco-dark">
                        {loc.name.toUpperCase()} {loc.isFavorite ? '★' : ''} ({loc.type === 'gym' ? 'gym' : 'crag'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-choco-medium pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display font-bold uppercase text-choco-medium mb-1.5 flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-choco-light" /> Optional Notes / feel / vibes
              </label>
              <textarea
                id="session-notes-input"
                rows={2}
                placeholder="How did the session go? Wall codes, temperatures, feelings..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs font-display font-medium text-choco-dark bg-cream-base border border-rose-border/85 rounded-2xl px-3.5 py-2.5 outline-none focus:border-accent placeholder-choco-light/50"
              />
            </div>
          </div>

          {/* Section 2: ASCENT ENTRIES */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-display font-bold text-choco-dark flex items-center gap-2">
                Logged Ascents ✨ ({routes.length})
              </h3>

              {/* Diff system selector */}
              <div className="flex bg-cream-base p-1 border border-rose-border/50 rounded-full text-[9px] font-display font-bold uppercase">
                <button
                  id="tab-toggle-v"
                  type="button"
                  onClick={() => setActiveGradeSystem('v')}
                  className={`px-3 py-1 rounded-full transition-all uppercase ${activeGradeSystem === 'v'
                    ? 'bg-accent text-choco-dark font-display font-bold'
                    : 'text-choco-medium'
                    }`}
                >
                  V-Scale
                </button>
                <button
                  id="tab-toggle-font"
                  type="button"
                  onClick={() => setActiveGradeSystem('font')}
                  className={`px-3 py-1 rounded-full transition-all uppercase ${activeGradeSystem === 'font'
                    ? 'bg-accent text-choco-dark font-display font-bold'
                    : 'text-choco-medium'
                    }`}
                >
                  Font
                </button>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {errors && (
              <div id="session-form-errors" className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2 text-[11px] font-display font-bold text-red-500">
                <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errors}</span>
              </div>
            )}

            {/* ROUTE LIST LOOPS */}
            <div className="space-y-4">
              {routes.map((route, idx) => {
                const isCollapsed = collapsedRoutes[route.id] || false;
                const activePhotoBase64 = photoPreviews[route.id];

                return (
                  <div
                    id={`route-entry-block-${route.id}`}
                    key={route.id}
                    className="bg-cream-card rounded-[24px] border border-rose-border/90 overflow-hidden transition-all duration-250 hover:border-accent shadow-3xs"
                  >
                    {/* Header bar of the climb (Collapsible toggler) */}
                    <div
                      id={`route-header-${route.id}`}
                      className="px-4 py-3 bg-cream-base/30 border-b border-rose-border/30 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => toggleRouteCollapse(route.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          id={`route-color-badge-${route.id}`}
                          className="w-4 h-4 rounded-full border border-rose-border shrink-0 flex items-center justify-center text-xs shadow-xs"
                          style={{ backgroundColor: CLIMB_COLORS.find(c => c.name === route.color)?.hex || '#ccc' }}
                        />
                        <div>
                          <p className="text-xs font-display font-bold text-choco-dark lowercase truncate max-w-[180px] sm:max-w-none">
                            climb #{idx + 1}: <span className="text-accent font-extrabold">{route.grade}</span> — {route.color}
                          </p>
                          <p className="text-[10px] font-display font-semibold text-choco-medium lowercase mt-0.5">
                            zone: {route.wallLocation || 'main'}
                            {route.attempts > 0 && ` • ${route.attempts} try`}
                            {route.sends > 0 && ` • sent ✓`}
                            {route.flashes > 0 && ` • flash ⚡`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {/* Favorite Star */}
                        <button
                          id={`btn-fav-route-${route.id}`}
                          type="button"
                          onClick={() => handleUpdateRouteField(route.id, 'isFavorite', !route.isFavorite)}
                          className={`p-1.5 rounded-full border bg-cream-base border-rose-border/50 transition-all ${route.isFavorite ? 'text-berry-accent border-accent/60 bg-accent/25' : 'text-choco-light hover:text-choco-medium'
                            }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${route.isFavorite ? 'fill-accent' : ''}`} />
                        </button>

                        {/* Collapsing arrow */}
                        <button
                          id={`btn-collapse-toggle-${route.id}`}
                          type="button"
                          onClick={() => toggleRouteCollapse(route.id)}
                          className="p-1.5 text-choco-medium hover:text-choco-dark rounded-full bg-cream-base border border-rose-border/50 animate-fade-in"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                        </button>

                        {/* Delete Trash */}
                        <button
                          id={`btn-del-route-${route.id}`}
                          type="button"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 bg-cream-base border border-red-200 rounded-full transition-all animate-fade-in"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Ascent Log Content */}
                    {!isCollapsed && (
                      <div className="p-5 space-y-5 font-sans animate-fade-in bg-cookie-bg/40">
                        {/* ROW 1: Grade Selector & Color Picker */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Required: Grade */}
                          <RouteGrade route={route}
                            handleUpdateRouteField={handleUpdateRouteField}
                            activeGradeSystem={activeGradeSystem}
                            BOULDERING_GRADES_V={BOULDERING_GRADES_V}
                            BOULDERING_GRADES_FONT={BOULDERING_GRADES_FONT}
                          />

                         <RouteColor route={route}
                            handleUpdateRouteField={handleUpdateRouteField}
                            CLIMB_COLORS={CLIMB_COLORS}
                          />

                        </div>

                        {/* ROW 2: Wall Location & Photo Upload */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Required: Wall Location */}
                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-1.5">
                              Wall Location / zone *
                            </label>
                            <div className="relative">
                              <input
                                id={`input-wall-loc-${route.id}`}
                                type="text"
                                list={`wall-locs-list-${route.id}`}
                                placeholder="e.g. Cave Area, Slab, Arête..."
                                value={route.wallLocation}
                                onChange={(e) => handleUpdateRouteField(route.id, 'wallLocation', e.target.value)}
                                className="w-full text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-4 py-2.5 outline-none focus:border-accent"
                              />
                              <datalist id={`wall-locs-list-${route.id}`}>
                                {WALL_LOCATIONS.map((wall) => (
                                  <option key={wall} value={wall}>{wall}</option>
                                ))}
                              </datalist>
                            </div>
                          </div>

                          {/* Route Photo Feature */}
                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-1.5">
                              Attach Climb Photo 🌸
                            </label>

                            {activePhotoBase64 ? (
                              <div className="flex items-center gap-2 bg-cream-base p-2 rounded-2xl border border-rose-border/50 font-sans shadow-3xs">
                                <img
                                  src={activePhotoBase64}
                                  alt="Route Preview"
                                  className="w-10 h-10 object-cover rounded-lg border border-rose-border shadow-xs"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 text-[10px] font-display font-bold uppercase text-accent truncate">
                                  photo saved ✓
                                </div>
                                <button
                                  id={`btn-remove-photo-${route.id}`}
                                  type="button"
                                  onClick={() => handleRemovePhoto(route.id)}
                                  className="text-[10px] uppercase bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded-full transition-all font-display font-bold cursor-pointer"
                                >
                                  remove
                                </button>
                              </div>
                            ) : (
                              <div className="relative group">
                                <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-cream-base border border-dashed border-rose-border hover:border-accent rounded-full text-xs font-display font-semibold text-choco-medium cursor-pointer text-center transition-all shadow-3xs">
                                  <Camera className="w-3.5 h-3.5 text-choco-light group-hover:text-accent" />
                                  <span className="text-[10px] tracking-wide uppercase">Upload Photo 🌸</span>
                                  <input
                                    id={`file-upload-input-${route.id}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => handlePhotoUpload(route.id, event)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* ROW 3: Holds and Route Types */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
                              Holds Features (multi-select)
                            </label>
                            <div className="flex flex-wrap gap-1 leading-none">
                              {HOLD_TYPES.map((hold) => {
                                const selected = route.holdsType.includes(hold);
                                return (
                                  <button
                                    id={`btn-hold-toggle-${route.id}-${hold}`}
                                    key={hold}
                                    type="button"
                                    onClick={() => handleHoldTypeToggle(route.id, hold)}
                                    className={`text-[10px] lowercase px-3 py-1.5 rounded-full font-display font-bold transition-all border cursor-pointer ${selected
                                      ? 'bg-accent border-accent text-choco-dark shadow-3xs'
                                      : 'bg-cream-base border-rose-border/40 text-choco-medium hover:bg-rose-border/10'
                                      }`}
                                  >
                                    {hold}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
                              Styles / features (multi-select)
                            </label>
                            <div className="flex flex-wrap gap-1 leading-none">
                              {ROUTE_TYPES.map((rType) => {
                                const selected = route.routeType.includes(rType);
                                return (
                                  <button
                                    id={`btn-type-toggle-${route.id}-${rType}`}
                                    key={rType}
                                    type="button"
                                    onClick={() => handleRouteTypeToggle(route.id, rType)}
                                    className={`text-[10px] lowercase px-3 py-1.5 rounded-full font-display font-bold transition-all border cursor-pointer ${selected
                                      ? 'bg-sky-accent border-sky-accent/[0.45] text-choco-dark shadow-3xs'
                                      : 'bg-cream-base border-rose-border/40 text-choco-medium hover:bg-rose-border/10'
                                      }`}
                                  >
                                    {rType}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* ROW 4: Attempts, Sends, Flashes Tracking */}
                        <div className="bg-cream-base p-4 rounded-[20px] border border-rose-border/60 space-y-3 font-sans shadow-3xs">
                          <p className="text-[10px] font-display font-bold text-choco-medium tracking-normal uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-accent fill-accent" /> Climbing Tracker 🎈
                          </p>

                          <div className="grid grid-cols-3 gap-3 uppercase">
                            {/* Attempt Counter */}
                            <div className="bg-cream-card p-3 rounded-2xl text-center border border-rose-border shadow-3xs flex flex-col justify-between">
                              <label className="block text-[9px] font-display font-bold text-choco-light mb-1">Attempts</label>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  id={`btn-attempt-dec-${route.id}`}
                                  type="button"
                                  onClick={() => handleUpdateRouteField(route.id, 'attempts', Math.max(1, route.attempts - 1))}
                                  className="w-6 h-6 rounded-full bg-cream-base border border-rose-border text-choco-dark flex items-center justify-center font-display font-semibold select-none cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-display font-bold text-choco-dark px-1 bg-cream-base border border-rose-border/30 rounded-md py-0.5 w-6 text-center select-none">{route.attempts}</span>
                                <button
                                  id={`btn-attempt-inc-${route.id}`}
                                  type="button"
                                  onClick={() => handleUpdateRouteField(route.id, 'attempts', route.attempts + 1)}
                                  className="w-6 h-6 rounded-full bg-cream-base border border-rose-border text-choco-dark flex items-center justify-center font-display font-semibold select-none cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Sends Counter */}
                            <div className="bg-cream-card p-3 rounded-2xl text-center border border-rose-border shadow-3xs flex flex-col justify-between">
                              <label className="block text-[9px] font-display font-bold text-choco-light mb-1">Sends</label>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  id={`btn-send-dec-${route.id}`}
                                  type="button"
                                  onClick={() => handleUpdateRouteField(route.id, 'sends', Math.max(0, route.sends - 1))}
                                  className="w-6 h-6 rounded-full bg-cream-base border border-rose-border text-choco-dark flex items-center justify-center font-display font-semibold select-none cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-display font-bold text-choco-dark px-1 bg-cream-base border border-rose-border/30 rounded-md py-0.5 w-6 text-center select-none">{route.sends}</span>
                                <button
                                  id={`btn-send-inc-${route.id}`}
                                  type="button"
                                  onClick={() => handleUpdateRouteField(route.id, 'sends', route.sends + 1)}
                                  className="w-6 h-6 rounded-full bg-cream-base border border-rose-border text-choco-dark flex items-center justify-center font-display font-semibold select-none cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Flash Toggles */}
                            <div className="bg-cream-card p-3 rounded-2xl text-center border border-rose-border shadow-3xs flex flex-col justify-between">
                              <label className="block text-[9px] font-display font-bold text-choco-light">Flash ⭐️</label>
                              <div className="flex items-center justify-center mt-1">
                                <button
                                  id={`btn-flash-toggle-${route.id}`}
                                  type="button"
                                  onClick={() => handleUpdateRouteField(route.id, 'flashes', route.flashes === 1 ? 0 : 1)}
                                  className={`px-3.5 py-1 rounded-full text-[9px] font-display font-bold transition-all border shadow-3xs cursor-pointer ${route.flashes === 1
                                    ? 'bg-accent border-accent text-choco-dark'
                                    : 'bg-cream-base border-rose-border/50 text-choco-medium'
                                    }`}
                                >
                                  {route.flashes === 1 ? 'Yes ✨' : 'No 🧸'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] font-display font-semibold text-choco-medium/80 leading-snug">
                            * note: flashing implies sending a route perfectly cleanly on your very first try! selecting 'Yes' automatically coordinates attempts to 1 and sends to 1.
                          </p>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Add Route Button */}
            <button
              id="btn-add-route-entry"
              type="button"
              onClick={handleAddRoute}
              className="w-full py-4 bg-cream-card hover:bg-cream-base border-2 border-dashed border-rose-border hover:border-accent rounded-2xl flex items-center justify-center gap-1.5 text-xs font-display font-bold text-choco-medium transition-all shadow-3xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-accent stroke-[2.5]" /> Add Another Climb 🍭
            </button>
          </div>
        </form>

        {/* Form Footer */}
        <div className="bg-cream-card px-5 py-4 border-t border-rose-border/40 flex items-center gap-3 shadow-xs">
          <button
            id="btn-cancel-session"
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-cream-base hover:bg-rose-border/20 text-choco-medium rounded-full border border-rose-border transition-all uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-session"
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-gradient-to-r from-accent to-accent-hover text-choco-dark rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-1 uppercase shadow-md shadow-accent/20 cursor-pointer"
          >
            Save Session 🍰
          </button>
        </div>
      </div>
    </div>
  );
}
