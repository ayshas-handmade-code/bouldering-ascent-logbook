import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CollapsibleBlock({ title, children, initiallyCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(!initiallyCollapsed);

  return (
    <div className="bg-cream-base p-4 rounded-[20px] border border-rose-border/60 space-y-3 font-sans shadow-3xs">
      <span onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between">
        <p className="text-[10px] font-display font-bold text-choco-medium tracking-normal uppercase flex items-center gap-1.5"
        >
          {title}
        </p>

        <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${!isOpen ? '' : 'rotate-180'}`}
          stroke="var(--color-choco-medium)"
          strokeWidth={4} />
      </span>

      {isOpen && children}
    </div>
  );
}
