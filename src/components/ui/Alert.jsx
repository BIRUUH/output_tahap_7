import styles from "./Alert.module.css";

export default function Alert({ type = "error", message, onClose }) {
    if (!message) return null;

    const icon = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    }[type] || "ℹ️";

    return (
        <div className={`${styles.alert} ${styles[type]}`}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.content}>{message}</div>
            {onClose && (
                <button type="button" className={styles.closeBtn} onClick={onClose}>
                    &times;
                </button>
            )}
        </div>
    );
}
