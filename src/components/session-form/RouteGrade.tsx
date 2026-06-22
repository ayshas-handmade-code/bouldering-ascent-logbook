import ButtonSelect from '../reusable/button-select/ButtonSelect';
import styles from './RouteGrade.module.css';

export default function RouteGrade({
    route,
    handleUpdateRouteField,
    activeGradeSystem,
}) {

    const BOULDERING_GRADES_V = [
        'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14'
    ];

    const BOULDERING_GRADES_FONT = [
        '4', '5A', '5B', '5C', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+'
    ];

    const grades = (activeGradeSystem === 'v' ? BOULDERING_GRADES_V : BOULDERING_GRADES_FONT).map((val, index) => { return { id: index, value: val } });
    const currentSelection = grades.find((grade) => grade.value === route.grade);


    return <div>
        <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-2">
            Grade *
        </label>
        <ButtonSelect
            currentSelection={currentSelection}
            onSelect={(obj) => handleUpdateRouteField(route.id, 'grade', obj.value)}
            data={grades}
        />
    </div>
}