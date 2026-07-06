import React, { useState, useEffect } from 'react';

interface FeatureTypesProps {
  title: string;
  allOptions: string[];
  selectedOptions: string[];
  onSelect: Function;
  cssClassnamesForSelected?: string;
}

export default function FeatureTypes({
  title,
  allOptions = [],
  selectedOptions = [],
  cssClassnamesForSelected = 'bg-accent border-accent text-choco-dark shadow-3xs',
  onSelect,
}: FeatureTypesProps) {
  const [_selected, setSelected] = useState(selectedOptions);

  const _onSelect = (option: string) => {
    debugger
    const newSelection = _selected.includes(option) ? _selected.filter(h => h !== option) : [..._selected, option];
    setSelected(newSelection);
    onSelect(option, newSelection);
  };

  return (
    <div>
      <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
        {title}
      </label>
      <div className="flex flex-wrap gap-1 leading-none">
        {allOptions.map((option) => {
          const isSelected = _selected.includes(option);
          return (
            <button
              id={`btn-feature-toggle-${option}`}
              key={option}
              type="button"
              onClick={() => _onSelect(option)}
              className={`text-[10px] lowercase px-3 py-1.5 rounded-full font-display font-bold transition-all border cursor-pointer
                  ${isSelected ? cssClassnamesForSelected : 'bg-cream-base border-rose-border/40 text-choco-medium hover:bg-rose-border/10'
                }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  )
}
