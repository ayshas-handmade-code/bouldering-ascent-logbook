import { RouteLog } from '../../types';

interface FeatureTypesProps {
    holdTypes: string[];
    route: RouteLog;
    handleHoldTypeToggle: Function;
}

export default function FeatureTypes({
    holdTypes,
    route,
    handleHoldTypeToggle,
}: FeatureTypesProps) {
    return (
        <div>
            <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
                Holds Features (multi-select)
            </label>
            <div className="flex flex-wrap gap-1 leading-none">
                {holdTypes.map((hold) => {
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
    )
}