import styles from "./Card.module.css";

export default function Card({ title, value, icon, description, className = "", style = {}, ...props }) {
    return (
        <div className={`${styles.card} ${className}`} style={style} {...props}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{title}</span>
                {icon && <span className={styles.cardIcon}>{icon}</span>}
            </div>
            <div className={styles.cardContent}>
                <h3 className={styles.cardValue}>{value}</h3>
                {description && <p className={styles.cardDesc}>{description}</p>}
            </div>
        </div>
    );
}
