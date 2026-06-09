import { Sparkles } from "lucide-react";

export default function AttemptTracker({
    handleUpdateRouteField,
    route,
}) {
    return <div className="bg-cream-base p-4 rounded-[20px] border border-rose-border/60 space-y-3 font-sans shadow-3xs">
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
};