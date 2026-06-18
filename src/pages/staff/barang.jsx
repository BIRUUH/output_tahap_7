import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import styles from "./barang.module.css";

export default function Barang() {
    const { barangList, kategoriList, loading, error } = useInventory();

    // State untuk Pencarian (Submit-based) & Filter
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [kategoriFilter, setKategoriFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("");

    // State untuk Paginasi
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Handle submit pencarian
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setCurrentPage(1); // Reset ke halaman pertama saat melakukan pencarian baru
    };

    // Reset semua filter & pencarian
    const handleResetFilters = () => {
        setSearchInput("");
        setSearchQuery("");
        setKategoriFilter("");
        setStatusFilter("");
        setSortBy("");
        setCurrentPage(1);
    };

    // 1. Client-Side Filtering
    let filteredBarang = barangList.filter((item) => {
        const keyword = searchQuery.toLowerCase().trim();
        const matchesSearch = keyword
            ? (item.nama_barang?.toLowerCase().includes(keyword) ||
               item.kode?.toLowerCase().includes(keyword))
            : true;

        const matchesKategori = kategoriFilter
            ? item.kategoriId === kategoriFilter
            : true;

        const matchesStatus = statusFilter
            ? item.status === statusFilter
            : true;

        return matchesSearch && matchesKategori && matchesStatus;
    });

    // 2. Client-Side Sorting
    if (sortBy) {
        const [field, order] = sortBy.split("-");
        filteredBarang = [...filteredBarang].sort((a, b) => {
            let valA = a[field];
            let valB = b[field];

            if (field === "nama_barang") {
                valA = valA || "";
                valB = valB || "";
                return order === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (field === "stok" || field === "harga") {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
                return order === "asc" ? valA - valB : valB - valA;
            }

            return 0;
        });
    }

    // 3. Client-Side Pagination
    const totalItems = filteredBarang.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Menghitung halaman aktif yang valid untuk menghindari halaman kosong jika filter berubah
    const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
    const startIndex = (activePage - 1) * itemsPerPage;
    const paginatedBarang = filteredBarang.slice(startIndex, startIndex + itemsPerPage);

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

            {/* Toolbar Pencarian & Filter */}
            <div className={styles.filterBar}>
                {/* Search Form (Submit Method) */}
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau kode..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={styles.searchInput}
                    />
                    <Button type="submit" variant="primary">
                        🔍 Cari
                    </Button>
                </form>

                {/* Filter & Sorting Group */}
                <div className={styles.filterGroup}>
                    {/* Filter Kategori */}
                    <select
                        value={kategoriFilter}
                        onChange={(e) => {
                            setKategoriFilter(e.target.value);
                            setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
                        }}
                        className={styles.filterSelect}
                    >
                        <option value="">Semua Kategori</option>
                        {kategoriList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nama_kategori}
                            </option>
                        ))}
                    </select>

                    {/* Filter Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
                        }}
                        className={styles.filterSelect}
                    >
                        <option value="">Semua Status</option>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Habis">Habis</option>
                    </select>

                    {/* Sorting */}
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1); // Reset ke halaman pertama saat sort berubah
                        }}
                        className={styles.filterSelect}
                    >
                        <option value="">Urutkan Data</option>
                        <option value="nama_barang-asc">Nama (A - Z)</option>
                        <option value="nama_barang-desc">Nama (Z - A)</option>
                        <option value="stok-asc">Stok (Terkecil)</option>
                        <option value="stok-desc">Stok (Terbesar)</option>
                        <option value="harga-asc">Harga (Termurah)</option>
                        <option value="harga-desc">Harga (Termahal)</option>
                    </select>

                    {/* Reset Button */}
                    {(searchQuery || kategoriFilter || statusFilter || sortBy || searchInput) && (
                        <Button 
                            onClick={handleResetFilters} 
                            variant="secondary"
                            className={styles.resetBtn}
                        >
                            🔄 Reset
                        </Button>
                    )}
                </div>
            </div>

            {loading && barangList.length === 0 ? (
                <Loader text="Mengambil data inventaris..." />
            ) : (
                <>
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
                            {paginatedBarang.map((item) => {
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
                            {paginatedBarang.length === 0 && (
                                <tr>
                                    <td colSpan="8" className={styles.emptyRow}>Tidak ditemukan data barang.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    <Pagination
                        currentPage={activePage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                </>
            )}
        </div>
    );
}