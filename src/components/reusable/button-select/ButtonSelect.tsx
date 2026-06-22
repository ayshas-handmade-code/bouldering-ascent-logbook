import { useState, useEffect } from 'react';
import styles from './ButtonSelect.module.css';

export default function ButtonSelect({
    currentSelection,
    onSelect,
    data
}) {
    const [selected, setCurrentSelection] = useState(currentSelection)
    const onClick = (obj) => {
        setCurrentSelection(obj.value)
        onSelect(obj);
    }

    useEffect(() => {
        console.log(currentSelection);
    }, [selected])

    return <div className={styles.container}>
        <div className={`${styles.route_selector} bg-cream-base p-2 rounded-2xl border border-rose-border/60 shadow-3xs`}>
            {data.map((obj) => {
                const selected = currentSelection.id === obj.id;

                return (
                    <button
                        id={`btn-color-opt-${currentSelection.id}`}
                        key={obj.value}
                        type="button"
                        onClick={() => onClick(obj)}
                        title={obj.value}
                        className={`${styles.options} 
                            relative w-full aspect-square rounded-full border border-rose-border/30 flex items-center justify-center transition-transform transform active:scale-90 cursor-pointer 
                            ${selected ? styles.selected : styles.unselected}`
                        }
                    >
                        {obj.value}
                    </button>
                );
            })}
        </div>
    </div>
}
