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

    // Filter barang dengan stok menipis untuk daftar pantauan
    const daftarPantau = barangList.filter(item => item.stok < 15).slice(0, 3);

    if (loading && barangList.length === 0) {
        return <Loader text="Memuat dashboard..." />;
    }

    return (
        <div className={styles.container}>
            <div>
                <h2 className={styles.title}>Selamat Datang, Staff Gudang</h2>
                <p className={styles.subtitle}>Pantau ketersediaan barang dan lakukan pengecekan stok fisik secara rutin.</p>
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Statistik Cards */}
            <div className={styles.statsGrid}>
                <Card 
                    title="Total Barang Pantau" 
                    value={totalBarang} 
                    icon="📦" 
                    description="Barang aktif di gudang" 
                />
                <Card 
                    title="Jumlah Kategori" 
                    value={totalKategori} 
                    icon="🗂️" 
                    description="Kategori penyimpanan" 
                />
                <Card 
                    title="Krisis Stok" 
                    value={totalStokMenipis} 
                    icon="⚠️" 
                    description="Segera laporkan ke Admin" 
                    className={totalStokMenipis > 0 ? styles.krisisCard : ""}
                />
            </div>

            {/* Tugas Staff Gudang Info Card */}
            <div className={styles.instructionCard}>
                <h4 className={styles.instructionTitle}>📋 Instruksi Harian Kerja</h4>
                <ul className={styles.instructionList}>
                    <li>Periksa fisik barang pada rak penyimpanan secara berkala.</li>
                    <li>Laporkan kepada <strong>Administrator</strong> jika ada ketidaksesuaian stok.</li>
                    <li>Pastikan penataan barang sesuai dengan letak Rak / Lokasi (A1, B3, C2, dsb).</li>
                </ul>
            </div>

            {/* Pantauan Stok Rendah */}
            <div className={styles.tableSection}>
                <h3 className={styles.tableTitle}>Daftar Pantauan Stok Menipis</h3>
                {daftarPantau.length === 0 ? (
                    <p className={styles.emptyMessage}>Semua stok barang dalam kondisi aman.</p>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>KODE</th>
                                <th>NAMA BARANG</th>
                                <th>LOKASI</th>
                                <th>STOK SAAT INI</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarPantau.map((item) => (
                                <tr key={item.id}>
                                    <td className={styles.codeCol}>{item.kode || `BRG-${item.id}`}</td>
                                    <td className={styles.nameCol}>{item.nama_barang}</td>
                                    <td>{item.lokasi}</td>
                                    <td className={`${styles.stockCol} ${item.stok < 10 ? styles.stockKritis : styles.stockAman}`}>{item.stok} {item.satuan}</td>
                                    <td>
                                        <span className={`${styles.badge} ${item.stok < 10 ? styles.badgeKritis : styles.badgeAman}`}>
                                            {item.stok < 10 ? "Kritis" : "Aman"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
}