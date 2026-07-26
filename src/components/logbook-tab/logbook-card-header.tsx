import { Building2, Trees, Star, Calendar, Edit, Trash2, ChevronDown } from "lucide-react";
import { ClimbingSession } from "../../types";

interface LogbookCardProps {
  session: ClimbingSession;
  onEditSession: (session: ClimbingSession) => void;
  onDeleteSession: (id: string) => void;
  toggleSessionExpand: (id: string) => void;
  isExpanded: boolean;
}

export default function LogbookCardHeader({ session, onEditSession, onDeleteSession, toggleSessionExpand, isExpanded }: LogbookCardProps) {

  // Compute summary stats for current session log
  const totalAttempts = session.routes.reduce((sum, r) => sum + r.attempts, 0);
  const totalSends = session.routes.reduce((sum, r) => sum + r.sends, 0);
  const totalFlashes = session.routes.reduce((sum, r) => sum + r.flashes, 0);
  return <>
    {/* Card Header section */}
    <div
      id={`session-trigger-${session.id}`}
      onClick={() => toggleSessionExpand(session.id)}
      className="p-5 flex items-start justify-between cursor-pointer"
    >
      <div className="flex gap-3">
        <div className={`p-2.5 rounded-full shrink-0 border border-rose-border bg-cream-base text-accent`}>
          {session.locationType === 'gym'
            ? <Building2 className="w-5 h-5 stroke-[2]" />
            : <Trees className="w-5 h-5 stroke-[2]" />
          }
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display font-bold text-choco-dark text-sm sm:text-base leading-tight">
              {session.locationName}
            </h3>
            {session.routes.some(r => r.isFavorite) && (
              <Star className="w-3.5 h-3.5 text-accent fill-accent animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-[10px] font-display font-bold text-choco-medium">
            <span className="flex items-center gap-1 text-choco-medium bg-cream-base px-2.5 py-1 rounded-full border border-rose-border/40">
              <Calendar className="w-3 h-3 text-accent" /> {session.date}
            </span>
            <span>•</span>
            <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
              {session.routes.length} Routes
            </span>
            <span>•</span>
            <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
              {session.routes.reduce((sum, r) => sum + r.attempts, 0)} Climbs
            </span>
          </div>
        </div>
      </div>

      {/* Quick aggregates and control triggers */}
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button
          id={`btn-edit-session-trigger-${session.id}`}
          onClick={() => onEditSession(session)}
          className="p-2 bg-cream-base hover:bg-slate-100 border border-rose-border rounded-full text-choco-medium transition-all hover:text-choco-dark shadow-3xs"
          title="Edit Log"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          id={`btn-delete-session-trigger-${session.id}`}
          onClick={() => onDeleteSession(session.id)}
          className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-full transition-all"
          title="Delete Log"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          id={`btn-expand-session-trigger-${session.id}`}
          onClick={() => toggleSessionExpand(session.id)}
          className="p-1 text-choco-light hover:text-choco-medium"
        >
          <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  </>
}