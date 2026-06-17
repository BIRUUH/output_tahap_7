import styles from "./Button.module.css";

export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary", // primary, secondary, danger
    disabled = false,
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${styles.btn} ${styles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
