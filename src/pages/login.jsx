/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./login.module.css";

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Jika pengguna sudah login, redirect ke halaman asal atau ke dashboard
    const targetRedirect = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (isAuthenticated) {
            navigate(targetRedirect, { replace: true });
        }
    }, [isAuthenticated, navigate, targetRedirect]);

    // Fungsi untuk handling submit form login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Form Validasi
        if (!username.trim() || !password.trim()) {
            setError("Username dan Password wajib diisi!");
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter!');
            return;
        }

        // Error Handling
        try {
            setIsLoading(true);
            const success = await login(username, password);
            if (success) {
                // Jika sukses, navigasi ke url asal dengan opsi { replace: true } 
                navigate(targetRedirect, { replace: true });
            } else {
                setError("Username atau password salah! Silakan coba lagi.");
            }
        } catch (err) {
            setError("Terjadi masalah jaringan. Silakan coba beberapa saat lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>G</div>
                    <h2 className={styles.title}>E-Gudang</h2>
                    <p className={styles.subtitle}>Sistem Informasi Inventaris</p>
                </div>

                {/* Form handling */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Error Alert dari error handling */}
                    {error && (
                        <div className={styles.errorAlert}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.inputLabel}>Username</label>
                        <input
                            type="text"
                            id="username"
                            className={styles.input}
                            placeholder="Masukkan username Anda"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.inputLabel}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="Masukkan password Anda"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? "Memproses..." : "Masuk"}
                    </button>
                </form>
            </div>
        </div>
    );
}
