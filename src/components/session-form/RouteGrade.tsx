import styles from './RouteGrade.module.css';

export default function RouteGrade({
    route,
    handleUpdateRouteField,
    activeGradeSystem,
    BOULDERING_GRADES_V,
    BOULDERING_GRADES_FONT
}) {
    return <div>
        <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
            Grade *
        </label>

        <div>
            <select
                id={`input-grade-${route.id}`}
                value={route.grade}
                onChange={(e) => handleUpdateRouteField(route.id, 'grade', e.target.value)}
                size="4"
                className={`${styles.route_grade_selector} text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 px-4 py-2.5 outline-none focus:border-accent`}
            >
                {(activeGradeSystem === 'v' ? BOULDERING_GRADES_V : BOULDERING_GRADES_FONT).map((gradeVal) => (
                    <option
                        key={gradeVal}
                        value={gradeVal}
                    >
                        {gradeVal}
                    </option>
                ))}
            </select>
        </div>
    </div>
}