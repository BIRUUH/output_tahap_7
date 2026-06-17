import { useInventory } from "../../context/InventoryContext";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import styles from "./home.module.css";

export default function Home() {
    const { barangList, kategoriList, loading, error } = useInventory();

    // Hitung statistik
    const totalBarang = barangList.length;
    const totalKategori = kategoriList.length;
    
    // Barang dengan stok sedikit (stok < 10)
    const stokMenipisList = barangList.filter((item) => item.stok < 10);
    const totalStokMenipis = stokMenipisList.length;

    // Ambil 3 barang terbaru
    const barangTerbaru = barangList.slice(-3).reverse();

    if (loading && barangList.length === 0) {
        return <Loader text="Memuat dashboard..." />;
    }

    return (
        <div className={styles.home}>
            <div>
                <h2 className={styles.title}>Selamat Datang, Administrator</h2>
                <p className={styles.subtitle}>Kelola stok barang dan kategori inventaris gudang Anda secara efisien.</p>
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Statistik Cards */}
            <div className={styles.cards}>
                <Card 
                    title="Total Barang" 
                    value={totalBarang} 
                    icon="📦" 
                    description="Jenis barang terdaftar" 
                />
                <Card 
                    title="Total Kategori" 
                    value={totalKategori} 
                    icon="🗂️" 
                    description="Kategori penyimpanan" 
                />
                <Card 
                    title="Stok Menipis" 
                    value={totalStokMenipis} 
                    icon="⚠️" 
                    description="Barang dengan stok < 10 unit" 
                    style={{ border: totalStokMenipis > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255,255,255,0.08)" }}
                />
            </div>

            {/* Warning Section */}
            {totalStokMenipis > 0 && (
                <div className={styles.alert}>
                    <h4 className={styles.titleAlert}>
                        ⚠️ Peringatan Stok Menipis!
                    </h4>
                    <p className={styles.descAlert}>
                        Beberapa barang berikut memiliki jumlah stok kritis dan perlu segera dipesan ulang:
                    </p>
                    <ul className={styles.listAlerts}>
                        {stokMenipisList.map((item) => (
                            <li key={item.id}>
                                <strong>{item.nama_barang}</strong> ({item.kode || `BRG-${item.id}`}) - Sisa Stok: {item.stok} {item.satuan || "unit"} (Lokasi: {item.lokasi || "Tidak diketahui"})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Data Terbaru */}
            <div className={styles.newData}>
                <h3 className={styles.titleNewData}>Barang Terbaru dimasukkan</h3>
                {barangTerbaru.length === 0 ? (
                    <p className={styles.emptyData}>Belum ada data barang.</p>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>KODE</th>
                                <th>NAMA BARANG</th>
                                <th>LOKASI</th>
                                <th>STOK</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barangTerbaru.map((item) => {
                                const isTersedia = item.status === "Tersedia";
                                return (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: "600", color: "#38bdf8" }}>{item.kode || `BRG-${item.id}`}</td>
                                        <td style={{ color: "#f8fafc" }}>{item.nama_barang}</td>
                                        <td>{item.lokasi}</td>
                                        <td>{item.stok} {item.satuan}</td>
                                        <td>
                                            <span style={{
                                                background: isTersedia ? "#34d3991a" : "#f871711a",
                                                color: isTersedia ? "#34d399" : "#f87171",
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                                {item.status || "Tersedia"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
}