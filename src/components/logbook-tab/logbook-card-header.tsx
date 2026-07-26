import { Building2, Trees, Star, Calendar, Edit, Trash2, ChevronDown } from "lucide-react";
import { ClimbingSession } from "../../types";
import styles from "./logbook-card-header.module.css"

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
    <div
      id={`session-trigger-${session.id}`}
      onClick={() => toggleSessionExpand(session.id)}
      className={styles.main}
    >
      <div className={styles.topContainer}>
        <div className={styles.locationContainer}>
          {session.locationType == "gym" ? (
            <Building2 className="w-3.5 h-3.5 text-accent" />
          ) : (
            <Trees className="w-3.5 h-3.5 text-accent" />
          )}
          <h3 className={styles.locationName}>
            {session.locationName}
          </h3>
          {session.routes.some(r => r.isFavorite) && (
            <Star className="w-3.5 h-3.5 text-accent fill-accent animate-pulse" />
          )}
        </div>

        <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.infoContainer}>
          <span className="flex items-center gap-1 text-choco-medium bg-cream-base px-2.5 py-1 rounded-full border border-rose-border/40">
            <Calendar className="w-3 h-3 text-accent" /> {session.date}
          </span>
          <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
            {session.routes.length} Routes
          </span>
          <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
            {session.routes.reduce((sum, r) => sum + r.attempts, 0)} Climbs
          </span>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
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
        </div>
      </div>
    </div>
  </>
}