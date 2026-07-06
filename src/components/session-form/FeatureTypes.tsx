import React, { useState } from 'react';

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
  const [selected, setSelected] = useState(selectedOptions);

  const _onSelect = (option: string) => {
    const newSelection = selectedOptions.includes(option) ? selectedOptions.filter(h => h !== option) : [...selectedOptions, option];
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
          const selected = selectedOptions.includes(option);
          return (
            <button
              id={`btn-feature-toggle-${option}`}
              key={option}
              type="button"
              onClick={() => _onSelect(option)}
              className={`text-[10px] lowercase px-3 py-1.5 rounded-full font-display font-bold transition-all border cursor-pointer
                  ${selected ? cssClassnamesForSelected : 'bg-cream-base border-rose-border/40 text-choco-medium hover:bg-rose-border/10'
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
