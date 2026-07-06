/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import TagListEditor from './TagListEditor';

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

  /** Returns a pair of (handleAdd, handleRemove) for a list state. */
  function makeListHandlers(
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    newValue: string,
    setNewValue: React.Dispatch<React.SetStateAction<string>>,
    duplicateMessage: string,
  ) {
    const handleAdd = () => {
      const trimmed = newValue.trim();
      if (!trimmed) return;
      if (items.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
        alert(duplicateMessage);
        return;
      }
      setItems([...items, trimmed]);
      setNewValue('');
    };

    const handleRemove = (item: string) => {
      setItems(items.filter(i => i !== item));
    };

    return { handleAdd, handleRemove };
  }

  const { handleAdd: handleAddHold, handleRemove: handleRemoveHold } =
    makeListHandlers(holdTypes, setHoldTypes, newHold, setNewHold, 'Hold feature already exists.');

  const { handleAdd: handleAddRouteType, handleRemove: handleRemoveRouteType } =
    makeListHandlers(routeTypes, setRouteTypes, newRouteType, setNewRouteType, 'Style/route type already exists.');

  const { handleAdd: handleAddHandPlacement, handleRemove: handleRemoveHandPlacement } =
    makeListHandlers(handPlacements, setHandPlacements, newHandPlacement, setNewHandPlacement, 'Hand placement already exists.');

  const { handleAdd: handleAddFootPlacement, handleRemove: handleRemoveFootPlacement } =
    makeListHandlers(footPlacements, setFootPlacements, newFootPlacement, setNewFootPlacement, 'Foot placement already exists.');

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
          <TagListEditor
            title="Hold Features"
            description="Define the types of holds you want to track on climbs (e.g. Crimps, Slopers)."
            items={holdTypes}
            emptyMessage="No holds defined. Add some below."
            inputPlaceholder="New hold feature (e.g. Pockets)"
            inputValue={newHold}
            onInputChange={setNewHold}
            onAdd={handleAddHold}
            onRemove={handleRemoveHold}
          />

          <div className="border-t border-rose-border/30 my-4" />

          <TagListEditor
            title="Styles / Features"
            description="Define the route angles or movement features you track (e.g. Overhang, Dyno)."
            items={routeTypes}
            emptyMessage="No styles defined. Add some below."
            inputPlaceholder="New style / route type (e.g. Dyno)"
            inputValue={newRouteType}
            onInputChange={setNewRouteType}
            onAdd={handleAddRouteType}
            onRemove={handleRemoveRouteType}
          />

          <TagListEditor
            title="Hand Placements"
            description="Define the hand placement techniques that you want to track (e.g. Bump, Cross-Over, etc.)."
            items={handPlacements}
            emptyMessage="No hand placements defined. Add some below."
            inputPlaceholder="New hand placement technique (e.g. bump)"
            inputValue={newHandPlacement}
            onInputChange={setNewHandPlacement}
            onAdd={handleAddHandPlacement}
            onRemove={handleRemoveHandPlacement}
          />

          <TagListEditor
            title="Foot Placements"
            description="Define the foot placement techniques that you want to track (e.g. Smear, Flag, etc.)."
            items={footPlacements}
            emptyMessage="No foot placements defined. Add some below."
            inputPlaceholder="New foot placement technique (e.g. smear)"
            inputValue={newFootPlacement}
            onInputChange={setNewFootPlacement}
            onAdd={handleAddFootPlacement}
            onRemove={handleRemoveFootPlacement}
          />
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
