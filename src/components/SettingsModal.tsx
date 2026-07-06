/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  holdTypes: string[];
  routeTypes: string[];
  footPlacements: string[];
  handPlacements: string[];
  onSaveSettings: (settings: { holdTypes: string[]; routeTypes: string[]; footPlacements: string[]; handPlacements: string[] }) => Promise<void>;
}

export default function SettingsModal({
  onClose,
  holdTypes: initialHoldTypes,
  routeTypes: initialRouteTypes,
  footPlacements: initialFootPlacements,
  handPlacements: initialHandPlacements,
  onSaveSettings
}: SettingsModalProps) {
  const [holdTypes, setHoldTypes] = useState<string[]>(initialHoldTypes);
  const [routeTypes, setRouteTypes] = useState<string[]>(initialRouteTypes);
  const [footPlacements, setFootPlacements] = useState<string[]>(initialFootPlacements);
  const [handPlacements, setHandPlacements] = useState<string[]>(initialHandPlacements);

  const [newHold, setNewHold] = useState('');
  const [newRouteType, setNewRouteType] = useState('');
  const [newHandPlacement, setNewHandPlacement] = useState('');
  const [newFootPlacement, setNewFootPlacement] = useState('');

  const [saving, setSaving] = useState(false);

  const handleAddHold = () => {
    const trimmed = newHold.trim();
    if (!trimmed) return;
    if (holdTypes.some(h => h.toLowerCase() === trimmed.toLowerCase())) {
      alert('Hold feature already exists.');
      return;
    }
    setHoldTypes([...holdTypes, trimmed]);
    setNewHold('');
  };

  const handleRemoveHold = (hold: string) => {
    setHoldTypes(holdTypes.filter(h => h !== hold));
  };

  const handleAddRouteType = () => {
    const trimmed = newRouteType.trim();
    if (!trimmed) return;
    if (routeTypes.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      alert('Style/route type already exists.');
      return;
    }
    setRouteTypes([...routeTypes, trimmed]);
    setNewRouteType('');
  };

  const handleRemoveRouteType = (rType: string) => {
    setRouteTypes(routeTypes.filter(r => r !== rType));
  };

  const handleAddHandPlacement = () => {
    const trimmed = newHandPlacement.trim();
    if (!trimmed) return;
    if (handPlacements.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      alert('Hand placement already exists.');
      return;
    }
    setHandPlacements([...handPlacements, trimmed]);
    setNewHandPlacement('');
  };

  const handleRemoveHandPlacement = (rType: string) => {
    setHandPlacements(handPlacements.filter(r => r !== rType));
  };

  const handleAddFootPlacement = () => {
    const trimmed = newFootPlacement.trim();
    if (!trimmed) return;
    if (footPlacements.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      alert('Foot placement already exists.');
      return;
    }
    setFootPlacements([...footPlacements, trimmed]);
    setNewFootPlacement('');
  };

  const handleRemoveFootPlacement = (rType: string) => {
    setFootPlacements(footPlacements.filter(r => r !== rType));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({ holdTypes, routeTypes, footPlacements, handPlacements });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="settings-modal-overlay" className="fixed items-center inset-0 bg-choco-dark/40 backdrop-blur-xs z-40 flex flex-col justify-end sm:justify-center p-0 sm:p-4 transition-all">
      <div id="settings-container" className="bg-cream-card w-full sm:max-w-md sm:rounded-[32px] shadow-xl flex flex-col max-h-[85vh] rounded-t-none border border-rose-border overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-cream-card px-5 py-4 border-b border-rose-border/50 flex items-center justify-between shadow-2xs">
          <div>
            <span className="bg-accent/25 border border-accent/40 text-[9px] font-display font-bold uppercase px-2.5 py-0.5 rounded-full block w-fit mb-0.5 text-choco-medium">
              Preferences ⚙️
            </span>
            <h2 className="text-sm font-display font-bold text-choco-dark uppercase leading-none mt-1">
              Customize Log Options
            </h2>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 bg-cream-base border border-rose-border text-choco-medium hover:text-choco-dark rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Hold Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-choco-dark uppercase">
              Hold Features
            </h3>
            <p className="text-[10px] text-choco-medium leading-relaxed">
              Define the types of holds you want to track on climbs (e.g. Crimps, Slopers).
            </p>

            <div className="flex flex-wrap gap-1.5 p-3 bg-cream-base rounded-2xl border border-rose-border/50 min-h-[60px]">
              {holdTypes.length === 0 ? (
                <span className="text-[10px] text-choco-light/60 font-semibold italic">No holds defined. Add some below.</span>
              ) : (
                holdTypes.map((hold) => (
                  <span
                    key={hold}
                    className="inline-flex items-center gap-1 text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-dark font-display font-bold px-2.5 py-1 rounded-full"
                  >
                    {hold}
                    <button
                      type="button"
                      onClick={() => handleRemoveHold(hold)}
                      className="text-choco-medium hover:text-red-500 font-bold ml-0.5 cursor-pointer text-xs"
                      title={`Remove ${hold}`}
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New hold feature (e.g. Pockets)"
                value={newHold}
                onChange={(e) => setNewHold(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHold(); } }}
                className="flex-1 text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddHold}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="border-t border-rose-border/30 my-4" />

          {/* Styles / Route Types */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-choco-dark uppercase">
              Styles / Features
            </h3>
            <p className="text-[10px] text-choco-medium leading-relaxed">
              Define the route angles or movement features you track (e.g. Overhang, Dyno).
            </p>

            <div className="flex flex-wrap gap-1.5 p-3 bg-cream-base rounded-2xl border border-rose-border/50 min-h-[60px]">
              {routeTypes.length === 0 ? (
                <span className="text-[10px] text-choco-light/60 font-semibold italic">No styles defined. Add some below.</span>
              ) : (
                routeTypes.map((rType) => (
                  <span
                    key={rType}
                    className="inline-flex items-center gap-1 text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-dark font-display font-bold px-2.5 py-1 rounded-full"
                  >
                    {rType}
                    <button
                      type="button"
                      onClick={() => handleRemoveRouteType(rType)}
                      className="text-choco-medium hover:text-red-500 font-bold ml-0.5 cursor-pointer text-xs"
                      title={`Remove ${rType}`}
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New style / route type (e.g. Dyno)"
                value={newRouteType}
                onChange={(e) => setNewRouteType(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRouteType(); } }}
                className="flex-1 text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddRouteType}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Hand Placements */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-choco-dark uppercase">
              Hand Placements
            </h3>
            <p className="text-[10px] text-choco-medium leading-relaxed">
              Define the hand placement techniques that you want to track (e.g. Bump, Cross-Over, etc.).
            </p>

            <div className="flex flex-wrap gap-1.5 p-3 bg-cream-base rounded-2xl border border-rose-border/50 min-h-[60px]">
              {handPlacements.length === 0 ? (
                <span className="text-[10px] text-choco-light/60 font-semibold italic">No styles defined. Add some below.</span>
              ) : (
                handPlacements.map((rType) => (
                  <span
                    key={rType}
                    className="inline-flex items-center gap-1 text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-dark font-display font-bold px-2.5 py-1 rounded-full"
                  >
                    {rType}
                    <button
                      type="button"
                      onClick={() => handleRemoveHandPlacement(rType)}
                      className="text-choco-medium hover:text-red-500 font-bold ml-0.5 cursor-pointer text-xs"
                      title={`Remove ${rType}`}
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New hand placement technique (e.g. bump)"
                value={newHandPlacement}
                onChange={(e) => setNewHandPlacement(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHandPlacement(); } }}
                className="flex-1 text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddHandPlacement}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Foot Placements */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold text-choco-dark uppercase">
              Foot Placements
            </h3>
            <p className="text-[10px] text-choco-medium leading-relaxed">
              Define the foot placement techniques that you want to track (e.g. Smear, Flag, etc.).
            </p>

            <div className="flex flex-wrap gap-1.5 p-3 bg-cream-base rounded-2xl border border-rose-border/50 min-h-[60px]">
              {footPlacements.length === 0 ? (
                <span className="text-[10px] text-choco-light/60 font-semibold italic">No styles defined. Add some below.</span>
              ) : (
                footPlacements.map((rType) => (
                  <span
                    key={rType}
                    className="inline-flex items-center gap-1 text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-dark font-display font-bold px-2.5 py-1 rounded-full"
                  >
                    {rType}
                    <button
                      type="button"
                      onClick={() => handleRemoveFootPlacement(rType)}
                      className="text-choco-medium hover:text-red-500 font-bold ml-0.5 cursor-pointer text-xs"
                      title={`Remove ${rType}`}
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New foot placement technique (e.g. smear)"
                value={newFootPlacement}
                onChange={(e) => setNewFootPlacement(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFootPlacement(); } }}
                className="flex-1 text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddFootPlacement}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cream-card px-5 py-4 border-t border-rose-border/40 flex gap-3 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-cream-base hover:bg-rose-border/20 text-choco-medium rounded-full border border-rose-border transition-all uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex-1 py-2.5 text-xs font-display font-bold bg-gradient-to-r from-accent to-accent-hover text-choco-dark rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-1 uppercase shadow-md shadow-accent/20 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Preferences 🍰'}
          </button>
        </div>
      </div>
    </div>
  );
}
