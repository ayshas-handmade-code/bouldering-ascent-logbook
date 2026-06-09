import { Check } from 'lucide-react';
import styles from './RouteColor.module.css';

export default function RouteColor({
    route,
    handleUpdateRouteField,
    CLIMB_COLORS
}) {
    return <div className={styles.container}>
        <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
            Hold Color *
        </label>
        <div className={`${styles.route_selector} bg-cream-base p-2 rounded-2xl border border-rose-border/60 shadow-3xs`}>
            {CLIMB_COLORS.map((colObj) => {
                const selected = route.color === colObj.name;
                return (
                    <button
                        id={`btn-color-opt-${route.id}-${colObj.name}`}
                        key={colObj.name}
                        type="button"
                        onClick={() => handleUpdateRouteField(route.id, 'color', colObj.name)}
                        title={colObj.name}
                        className={`${styles.color_options} relative w-full aspect-square rounded-full border border-rose-border/30 flex items-center justify-center transition-transform transform active:scale-90 cursor-pointer ${selected ? 'ring-2 ring-accent scale-102' : 'hover:scale-102'
                            }`}
                        style={{ backgroundColor: colObj.hex }}
                    >
                        {selected && (
                            <Check className={`w-4 h-4 font-bold ${colObj.name === 'White' || colObj.name === 'Yellow'
                                ? 'text-slate-900'
                                : 'text-white'
                                }`} />
                        )}
                    </button>
                );
            })}
        </div>
    </div>
}