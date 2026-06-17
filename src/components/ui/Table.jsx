import styles from "./Table.module.css";

export default function Table({ children, className = "", ...props }) {
    return (
        <div className={styles.tableWrapper}>
            <table className={`${styles.table} ${className}`} {...props}>
                {children}
            </table>
        </div>
    );
}
