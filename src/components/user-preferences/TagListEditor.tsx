import { Plus, X } from 'lucide-react';

/** Reusable tag-list editor section. */
export default function TagListEditor({
  title,
  description,
  items,
  emptyMessage,
  inputPlaceholder,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  items: string[];
  emptyMessage: string;
  inputPlaceholder: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-display font-bold text-choco-dark uppercase">
        {title}
      </h3>
      <p className="text-[10px] text-choco-medium leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap gap-1.5 p-3 bg-cream-base rounded-2xl border border-rose-border/50 min-h-[60px]">
        {items.length === 0 ? (
          <span className="text-[10px] text-choco-light/60 font-semibold italic">{emptyMessage}</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 text-[10px] bg-sky-accent/20 border border-sky-accent/40 text-choco-dark font-display font-bold px-2.5 py-1 rounded-full"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-choco-medium hover:text-red-500 font-bold ml-0.5 cursor-pointer text-xs"
                title={`Remove ${item}`}
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
          placeholder={inputPlaceholder}
          value={inputValue}
          onInput={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          className="flex-1 text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 rounded-full px-3.5 py-2 outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 uppercase"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}