import { useAuth } from "../../context/AuthContext";
import styles from "./sidebar.module.css";

export default function Sidebar({ halamanAktif, onNavigasi }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "";

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "barang", label: "Daftar Barang" },
    ...(role === "administrator" ? [{ key: "kategori", label: "Kategori Barang" }] : []),
    { key: "laporan", label: "Daftar Laporan" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.merk}>
        <div className={styles.logo}>W</div>
        <div>
          <span className={styles.namaMerk}>E-Gudang</span>
        </div>
      </div>

      {/* Navigasi */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={[
              styles.navItem,
              halamanAktif === item.key ? styles.active : "",
            ].join(" ")}
            onClick={() => onNavigasi(item.key)}
            title={item.label}
          >
            <span className={styles.navLabel2}>{item.label}</span>
            {halamanAktif === item.key && (
              <span className={styles.navIndicator} />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
