import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./topbar.module.css";

const JudulHalaman = {
    dashboard: 'Dashboard',
    barang: 'Daftar Barang',
    kategori: 'Kategori Barang',
    laporan: 'Daftar Laporan'
};

function TopBar({ halamanAktif }) {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const username = user && typeof user.username === 'string' ? user.username : '';
    
    const roleMap = {
        administrator: "Administrator",
        staff: "Staff Gudang"
    };
    const role = user && typeof user.role === 'string' ? (roleMap[user.role.toLowerCase()] || user.role) : '';

    const sekarang = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Menutup dropdown jika user mengklik di luar area menu dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <h1 className={styles.titlePage}>{JudulHalaman[halamanAktif] || 'e-Gudang'}</h1>
                <p className={styles.date}>{sekarang}</p>
            </div>

            <div className={styles.right} ref={dropdownRef}>
                <div id="profile-toggle" className={styles.profileToggle} onClick={() => setIsOpen(!isOpen)}>
                    <div className={styles.avatar}>
                        {username ? username.charAt(0).toUpperCase() : 'H'}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{username || 'Pengguna'}</span>
                        <span className={styles.userRole}>{role || 'Staff'}</span>
                    </div>
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
                </div>

                {/* Elemen Dropdown Menu */}
                {isOpen && (
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <p className={styles.dropdownName}>{username || 'Pengguna'}</p>
                            <p className={styles.dropdownRole}>{role || 'Staff'}</p>
                        </div>
                        <div className={styles.divider}></div>

                        <button
                            className={styles.dropdownItem}
                            onClick={() => { setIsOpen(false); alert('Fitur Profil sedang dikembangkan!'); }}
                        >
                            👤 Info Profil
                        </button>

                        <button id="logout-button" className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                            🚪 Keluar (Logout)
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default TopBar;