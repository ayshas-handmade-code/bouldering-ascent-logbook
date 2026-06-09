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
            <input
                id={`input-grade-${route.id}`}
                type="text"
                list={`grade-list-${route.id}`}
                placeholder="e.g. V3 or 6a"
                value={route.grade}
                onChange={(e) => handleUpdateRouteField(route.id, 'grade', e.target.value)}
                className={`${styles.route_grade_selector} text-xs font-display font-semibold text-choco-dark bg-cream-base border border-rose-border/85 px-4 py-2.5 outline-none focus:border-accent`}
            />
            <datalist id={`grade-list-${route.id}`}>
                {(activeGradeSystem === 'v' ? BOULDERING_GRADES_V : BOULDERING_GRADES_FONT).map((gradeVal) => (
                    <option
                        key={gradeVal}
                        value={gradeVal}
                        selected={gradeVal === "V3"}
                    >
                        {gradeVal}
                    </option>
                ))}
            </datalist>
        </div>
    </div>
}