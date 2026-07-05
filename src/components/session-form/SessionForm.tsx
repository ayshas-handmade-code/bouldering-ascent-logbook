/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ClimbingSession, RouteLog, Location } from '../../types';
import {
  BOULDERING_GRADES_V,
  BOULDERING_GRADES_FONT,
  CLIMB_COLORS,
  WALL_LOCATIONS
} from '../../data';
import {
  X, Plus, ChevronDown, Check, Star, Sparkles,
  Trash2, Calendar, MapPin, AlignLeft, Info
} from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import RouteGrade from './RouteGrade';
import RouteColor from './RouteColor';
import styles from './SessionForm.module.css';
import AttemptTracker from './AttemptTracker';
import useSaveSession from './hooks/use-save-session';
import useDeleteSession from './hooks/use-delete-session';
import FeatureTypes from './FeatureTypes';

interface SessionFormProps {
  locations: Location[];
  sessionToEdit?: ClimbingSession | null;
  onClose: () => void;
  onDelete: () => void;
  holdTypes: string[];
  routeTypes: string[];
}

export default function SessionForm({
  locations,
  sessionToEdit,
  onClose,
  onDelete,
  holdTypes,
  routeTypes,
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

  const { saveSessionToDb } = useSaveSession();
  const { deleteSessionFromDb } = useDeleteSession();
  const [sessionId, setSessionId] = useState<ClimbingSession | null>(sessionToEdit?.id || `sess-${Date.now()}`);

  const handleAddRoute = () => {
    const selectedLoc = locations.find(loc => loc.id === locationId);
    const wallOptions = selectedLoc?.type === 'gym'
      ? (selectedLoc.wallLocations !== undefined ? selectedLoc.wallLocations : WALL_LOCATIONS)
      : (selectedLoc?.wallLocations !== undefined ? selectedLoc.wallLocations : WALL_LOCATIONS);

    const newRoute: RouteLog = {
      id: `new-route-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      grade: activeGradeSystem === 'v' ? 'V1' : '6A',
      color: 'Purple',
      wallLocation: wallOptions[0] || 'Slab',
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

  const validateForm = async () => {
    // Form validation
    if (!locationId) {
      setErrors('Please select a climbing location.');
      return false;
    }

    if (routes.length === 0) {
      setErrors('Please add at least one climb/route to this session.');
      return false;
    }

    // Checking required route fields (grade, color, wallLocation are mandatory)
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (!route.grade) {
        setErrors(`Class log #${i + 1} is missing a required Difficulty Grade.`);
        return false;
      }
      if (!route.color) {
        setErrors(`Class log #${i + 1} is missing a required Hold Color.`);
        return false;
      }
      if (!route.wallLocation || !route.wallLocation.trim()) {
        setErrors(`Climb #${i + 1} needs a Wall Location (e.g., "The Cave", "East Wall").`);
        return false;
      }
    }

    const selectedLoc = locations.find(loc => loc.id === locationId);
    if (!selectedLoc) {
      setErrors('Invalid climbing location selected.');
      return false;
    }

    return true;
  }

  const saveSession = async () => {
    if (!await validateForm()) {
      return;
    }

    const selectedLoc = locations.find(loc => loc.id === locationId);
    const completedSession: ClimbingSession = {
      id: sessionId,
      date,
      locationId,
      locationName: selectedLoc.name,
      locationType: selectedLoc.type,
      climbsCount: routes.length,
      notes,
      routes,
    };

    saveSessionToDb(completedSession);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    saveSession();
    onClose();
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    const warningMessage = "⚠️ Are you sure you want to delete this bouldering session? This action is irreversible.";

    if (await window.confirm(warningMessage)) {
      // TODO: figure out why awaiting deleteSessionFromDb doesn't return from the callstack.
      deleteSessionFromDb(sessionId);
      onDelete();
    }

  }

  useEffect(() => {
    (async () => {
      console.log("Saving.....")
      await saveSession();
      console.log("Save Successful!", new Date().toLocaleTimeString());
    })();
  }, [routes]);

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
                    onChange={(e) => {
                      const newLocId = e.target.value;
                      setLocationId(newLocId);
                      const newLoc = locations.find(loc => loc.id === newLocId);
                      const newWallOptions = newLoc?.type === 'gym'
                        ? (newLoc.wallLocations !== undefined ? newLoc.wallLocations : WALL_LOCATIONS)
                        : (newLoc?.wallLocations !== undefined ? newLoc.wallLocations : WALL_LOCATIONS);

                      if (newWallOptions.length > 0) {
                        setRoutes(prevRoutes =>
                          prevRoutes.map(r => {
                            if (!newWallOptions.includes(r.wallLocation)) {
                              return { ...r, wallLocation: newWallOptions[0] };
                            }
                            return r;
                          })
                        );
                      }
                    }}
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
                        <div className={styles.route_grade_and_color_container}>
                          <RouteGrade route={route}
                            handleUpdateRouteField={handleUpdateRouteField}
                            activeGradeSystem={activeGradeSystem}
                          />

                          <RouteColor route={route}
                            handleUpdateRouteField={handleUpdateRouteField}
                            CLIMB_COLORS={CLIMB_COLORS}
                          />
                        </div>

                        <AttemptTracker
                          handleUpdateRouteField={handleUpdateRouteField}
                          route={route}
                        />

                        {/* ROW 2: Wall Location & Photo Upload */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Required: Wall Location */}
                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-1.5">
                              Wall Location / zone *
                            </label>
                            <div className="relative">
                              <select
                                id={`select-wall-loc-${route.id}`}
                                value={route.wallLocation}
                                onChange={(e) => handleUpdateRouteField(route.id, 'wallLocation', e.target.value)}
                                className="w-full text-xs font-display font-semibold appearance-none text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-4 py-2.5 pr-10 outline-none focus:border-accent"
                              >
                                {(() => {
                                  const selectedLoc = locations.find(loc => loc.id === locationId);
                                  const wallOptions = selectedLoc?.type === 'gym'
                                    ? (selectedLoc.wallLocations !== undefined ? selectedLoc.wallLocations : WALL_LOCATIONS)
                                    : (selectedLoc?.wallLocations !== undefined ? selectedLoc.wallLocations : WALL_LOCATIONS);

                                  // Ensure current route's wallLocation is included so it's not hidden/lost if it was custom
                                  const optionsToRender = [...wallOptions];
                                  if (route.wallLocation && !optionsToRender.includes(route.wallLocation)) {
                                    optionsToRender.push(route.wallLocation);
                                  }

                                  return optionsToRender.map((wall) => (
                                    <option key={wall} value={wall}>
                                      {wall}
                                    </option>
                                  ));
                                })()}
                              </select>
                              <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-choco-medium pointer-events-none" />
                            </div>
                          </div>

                          {/* Route Photo Feature */}
                          <PhotoUploader
                            route={route}
                            handleUpdateRouteField={handleUpdateRouteField}
                          />

                        </div>

                        {/* ROW 3: Holds and Route Types */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FeatureTypes
                            title="Holds Features (multi-select)"
                            allOptions={holdTypes}
                            selectedOptions={route.holdsType}
                            onSelect={(option) => { handleHoldTypeToggle(route.id, option) }}
                          />

                          <div>
                            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
                              Styles / features (multi-select)
                            </label>
                            <div className="flex flex-wrap gap-1 leading-none">
                              {routeTypes.map((rType) => {
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
                      </div>
                    )
                    }
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
            onClick={handleDelete}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-cream-base hover:bg-rose-border/20 text-choco-medium rounded-full border border-rose-border transition-all uppercase cursor-pointer"
          >
            Delete
          </button>
          <button
            id="btn-save-session"
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-gradient-to-r from-accent to-accent-hover text-choco-dark rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-1 uppercase shadow-md shadow-accent/20 cursor-pointer"
          >
            Complete Session 🍰
          </button>
        </div>
      </div >
    </div >
  );
}
