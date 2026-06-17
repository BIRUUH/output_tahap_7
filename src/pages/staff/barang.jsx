import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import styles from "./barang.module.css";

export default function Barang() {
    const { barangList, kategoriList, loading, error } = useInventory();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter barang berdasarkan query pencarian
    const filteredBarang = barangList.filter((item) => {
        const keyword = searchQuery.toLowerCase().trim();
        const matchesName = item.nama_barang?.toLowerCase().includes(keyword);
        const matchesKode = item.kode?.toLowerCase().includes(keyword);
        return matchesName || matchesKode;
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className={styles.container}>
            <div>
                <h2 className={styles.title}>Monitoring Stok & Barang</h2>
                <p className={styles.subtitle}>Daftar seluruh barang inventaris gudang dan lokasinya (View-Only).</p>
            </div>

            {/* Error state */}
            {error && <Alert type="error" message={error} />}

            {/* Filter pencarian */}
            <div className={styles.searchWrapper}>
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {loading && barangList.length === 0 ? (
                <Loader text="Mengambil data inventaris..." />
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <th>KODE</th>
                            <th>NAMA BARANG</th>
                            <th>KATEGORI</th>
                            <th>LOKASI</th>
                            <th>STOK TERSEDIA</th>
                            <th>SATUAN</th>
                            <th>HARGA</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBarang.map((item) => {
                            const categoryName = kategoriList.find((c) => c.id === item.kategoriId)?.nama_kategori || "Tanpa Kategori";
                            const isTersedia = item.status === "Tersedia";

                            return (
                                <tr key={item.id}>
                                    <td className={styles.codeCol}>{item.kode || `BRG-${item.id}`}</td>
                                    <td className={styles.nameCol}>{item.nama_barang}</td>
                                    <td>
                                        <span className={styles.categoryBadge}>
                                            {categoryName}
                                        </span>
                                    </td>
                                    <td>{item.lokasi}</td>
                                    <td className={`${styles.stockCol} ${item.stok < 10 ? styles.stockWarning : ""}`}>
                                        {item.stok} {item.stok < 10 && "⚠️"}
                                    </td>
                                    <td>{item.satuan}</td>
                                    <td className={styles.priceCol}>{formatCurrency(item.harga)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${isTersedia ? styles.statusTersedia : styles.statusHabis}`}>
                                            {item.status || "Tersedia"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredBarang.length === 0 && (
                            <tr>
                                <td colSpan="8" className={styles.emptyRow}>Tidak ditemukan data barang.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
