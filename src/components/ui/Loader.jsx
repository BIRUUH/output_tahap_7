import styles from "./Loader.module.css";

export default function Loader({ size = "medium", text = "Memuat data..." }) {
    return (
        <div className={styles.container}>
            <div className={`${styles.spinner} ${styles[size]}`} />
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
}
