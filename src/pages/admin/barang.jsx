/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useInventory } from "../../context/InventoryContext";
import { fetchBarang } from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import styles from "./barang.module.css";

export default function Barang() {
    const { 
        kategoriList, 
        loading: contextLoading, 
        error: contextError, 
        addBarang, 
        updateBarang, 
        deleteBarang 
    } = useInventory();

    const [searchParams, setSearchParams] = useSearchParams();

    // Ambil nilai dari parameters di URL
    const query = searchParams.get("q") || "";
    const kategoriIdParam = searchParams.get("kategori") || "";
    const statusParam = searchParams.get("status") || "";
    const sortParam = searchParams.get("sort") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    // State lokal untuk search input (debounce)
    const [searchInput, setSearchInput] = useState(query);

    // State lokal untuk data barang dari server (server-side logic)
    const [adminBarangList, setAdminBarangList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [localLoading, setLocalLoading] = useState(false);
    const [localFetchError, setLocalFetchError] = useState("");

    // State Modal
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // State Form
    const [selectedId, setSelectedId] = useState(null);
    const [namaBarang, setNamaBarang] = useState("");
    const [kategoriId, setKategoriId] = useState("");
    const [stok, setStok] = useState("");
    const [satuan, setSatuan] = useState("");
    const [harga, setHarga] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [status, setStatus] = useState("Tersedia");
    const [localError, setLocalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Constants Pagination
    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const activePage = Math.min(Math.max(1, pageParam), totalPages);

    // Menghubungkan input lokal dengan parameter pencarian di URL jika parameter URL diubah dari luar
    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    // Fungsi fetch data barang server-side
    const fetchAdminData = useCallback(async () => {
        setLocalLoading(true);
        setLocalFetchError("");
        try {
            // Parameter untuk data yang dipaginasi & diurutkan
            const paginatedParams = {
                page: activePage,
                limit: itemsPerPage,
            };
            if (query.trim()) paginatedParams.search = query.trim();
            if (kategoriIdParam) paginatedParams.kategoriId = kategoriIdParam;
            if (statusParam) paginatedParams.status = statusParam;
            if (sortParam) {
                const [field, direction] = sortParam.split("-");
                paginatedParams.sortBy = field;
                paginatedParams.order = direction;
            }

            // Parameter untuk menghitung total item yang cocok (tanpa limit & page)
            const countParams = {};
            if (query.trim()) countParams.search = query.trim();
            if (kategoriIdParam) countParams.kategoriId = kategoriIdParam;
            if (statusParam) countParams.status = statusParam;

            // Panggil API secara paralel
            const [paginatedData, totalData] = await Promise.all([
                fetchBarang(paginatedParams),
                fetchBarang(countParams)
            ]);

            setAdminBarangList(paginatedData || []);
            setTotalItems(totalData ? totalData.length : 0);
        } catch (err) {
            setLocalFetchError(err.message || "Gagal memuat data barang dari server.");
        } finally {
            setLocalLoading(false);
        }
    }, [query, kategoriIdParam, statusParam, sortParam, activePage]);

    // Jalankan fetch setiap kali query parameter URL berubah
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Mengamankan nomor halaman di URL agar selalu valid
    useEffect(() => {
        if (pageParam !== activePage) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(activePage));
                return next;
            }, { replace: true });
        }
    }, [pageParam, activePage, setSearchParams]);

    // Debounce search input dengan delay 2000ms
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchInput.trim() !== query) {
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (searchInput.trim()) {
                        next.set("q", searchInput.trim());
                    } else {
                        next.delete("q");
                    }
                    next.set("page", "1"); // Reset ke halaman pertama saat mencari
                    return next;
                });
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput, query, setSearchParams]);

    // Handler Filter Kategori
    const handleKategoriFilterChange = (val) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (val) {
                next.set("kategori", val);
            } else {
                next.delete("kategori");
            }
            next.set("page", "1");
            return next;
        });
    };

    // Handler Filter Status
    const handleStatusFilterChange = (val) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (val) {
                next.set("status", val);
            } else {
                next.delete("status");
            }
            next.set("page", "1");
            return next;
        });
    };

    // Handler Sorting
    const handleSortChange = (val) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (val) {
                next.set("sort", val);
            } else {
                next.delete("sort");
            }
            return next;
        });
    };

    // Handler Page Change
    const handlePageChange = (newPage) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(newPage));
            return next;
        });
    };

    // Handler Reset Filter
    const handleReset = () => {
        setSearchInput("");
        setSearchParams({});
    };

    // Kondisi tombol reset aktif
    const isFilterActive = !!(query || kategoriIdParam || statusParam || sortParam || pageParam > 1);

    // Fungsi untuk membuka modal tambah barang dengan reset form
    const handleOpenAdd = () => {
        setNamaBarang("");
        setKategoriId(kategoriList[0]?.id || "");
        setStok("");
        setSatuan("Pcs");
        setHarga("");
        setLokasi("");
        setStatus("Tersedia");
        setLocalError("");
        setIsAddOpen(true);
    };

    // Fungsi untuk membuka modal edit barang dengan data yang sudah terisi
    const handleOpenEdit = (item) => {
        setSelectedId(item.id);
        setNamaBarang(item.nama_barang || "");
        setKategoriId(item.kategoriId || "");
        setStok(item.stok !== undefined ? String(item.stok) : "");
        setSatuan(item.satuan || "");
        setHarga(item.harga !== undefined ? String(item.harga) : "");
        setLokasi(item.lokasi || "");
        setStatus(item.status || "Tersedia");
        setLocalError("");
        setIsEditOpen(true);
    };

    // Fungsi validasi form sebelum submit
    const validateForm = () => {
        if (!namaBarang.trim() || !stok || !satuan.trim() || !harga || !lokasi.trim()) {
            setLocalError("Semua field wajib diisi!");
            return false;
        }
        if (isNaN(stok) || Number(stok) < 0) {
            setLocalError("Stok harus berupa angka positif!");
            return false;
        }
        if (isNaN(harga) || Number(harga) < 0) {
            setLocalError("Harga harus berupa angka positif!");
            return false;
        }
        return true;
    };

    // Fungsi untuk handling submit tambah barang
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setLocalError("");
        try {
            await addBarang({
                nama_barang: namaBarang.trim(),
                kategoriId,
                stok: Number(stok),
                satuan: satuan.trim(),
                harga: Number(harga),
                lokasi: lokasi.trim(),
                status
            });
            setIsAddOpen(false);
            handleReset(); // Reset pencarian ke halaman pertama agar melihat data terbaru
            fetchAdminData();
        } catch (err) {
            setLocalError(err.message || "Gagal menyimpan barang.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk handling submit edit barang
    const handleEdit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setLocalError("");
        try {
            await updateBarang(selectedId, {
                nama_barang: namaBarang.trim(),
                kategoriId,
                stok: Number(stok),
                satuan: satuan.trim(),
                harga: Number(harga),
                lokasi: lokasi.trim(),
                status
            });
            setIsEditOpen(false);
            fetchAdminData();
        } catch (err) {
            setLocalError(err.message || "Gagal memperbarui barang.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk handling delete barang dengan konfirmasi
    const handleDelete = async (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus barang "${name}"?`)) {
            try {
                await deleteBarang(id);
                fetchAdminData();
            } catch (err) {
                alert(err.message || "Gagal menghapus barang.");
            }
        }
    };

    // Fungsi untuk format harga ke dalam format Rupiah
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Manajemen Data Barang</h2>
                    <p className={styles.subtitle}>Kelola data inventaris gudang secara lengkap (CRUD).</p>
                </div>
                <Button onClick={handleOpenAdd} variant="primary" disabled={localLoading || contextLoading}>
                    ➕ Tambah Barang Baru
                </Button>
            </div>

            {/* Menampilkan pesan error global dari context */}
            {contextError && (
                <Alert type="error" message={contextError} />
            )}

            {/* Menampilkan pesan error lokal dari fetch */}
            {localFetchError && (
                <Alert type="error" message={localFetchError} />
            )}

            <div className={styles.filterBar}>
                {/* Search Input (Debounced) */}
                <div className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau kode..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Filter & Sorting Group */}
                <div className={styles.filterGroup}>
                    {/* Filter Kategori */}
                    <select
                        value={kategoriIdParam}
                        onChange={(e) => handleKategoriFilterChange(e.target.value)}
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
                        value={statusParam}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Semua Status</option>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Habis">Habis</option>
                    </select>

                    {/* Sorting Dropdown */}
                    <select
                        value={sortParam}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Urutkan Data</option>
                        <option value="nama_barang-asc">Nama (A-Z)</option>
                        <option value="nama_barang-desc">Nama (Z-A)</option>
                        <option value="stok-asc">Stok (Terkecil)</option>
                        <option value="stok-desc">Stok (Terbesar)</option>
                        <option value="harga-asc">Harga (Termurah)</option>
                        <option value="harga-desc">Harga (Termahal)</option>
                    </select>

                    {/* Tombol Reset Filter */}
                    {isFilterActive && (
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            className={styles.resetBtn}
                        >
                            🔄 Reset
                        </Button>
                    )}
                </div>
            </div>

            {localLoading && adminBarangList.length === 0 ? (
                <Loader text="Mengambil data barang..." />
            ) : (
                <>
                    <Table>
                        <thead>
                            <tr>
                                <th>KODE</th>
                                <th>NAMA BARANG</th>
                                <th>KATEGORI</th>
                                <th>LOKASI</th>
                                <th>STOK</th>
                                <th>SATUAN</th>
                                <th>HARGA</th>
                                <th>STATUS</th>
                                <th className={styles.actionHeader}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminBarangList.map((item) => {
                                const categoryName = kategoriList.find((c) => c.id === item.kategoriId)?.nama_kategori || "Tanpa Kategori";
                                const isTersedia = item.status === "Tersedia";

                                return (
                                    <tr key={item.id}>
                                        <td className={styles.kodeText}>{item.kode || `BRG-${item.id}`}</td>
                                        <td className={styles.nameText}>{item.nama_barang}</td>
                                        <td>
                                            <span className={styles.categoryBadge}>
                                                {categoryName}
                                            </span>
                                        </td>
                                        <td>{item.lokasi}</td>
                                        <td className={item.stok < 10 ? styles.stokTextWarning : styles.stokTextNormal}>
                                            {item.stok} {item.stok < 10 && "⚠️"}
                                        </td>
                                        <td>{item.satuan}</td>
                                        <td className={styles.priceText}>{formatCurrency(item.harga)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${isTersedia ? styles.statusTersedia : styles.statusHabis}`}>
                                                {item.status || "Tersedia"}
                                            </span>
                                        </td>
                                        <td className={styles.actionCell}>
                                            <Button 
                                                onClick={() => handleOpenEdit(item)} 
                                                variant="secondary" 
                                                className={styles.actionBtn}
                                                disabled={localLoading || contextLoading}
                                            >
                                                ✏️ Edit
                                            </Button>
                                            <Button 
                                                onClick={() => handleDelete(item.id, item.nama_barang)} 
                                                variant="danger" 
                                                className={styles.actionBtn}
                                                disabled={localLoading || contextLoading}
                                            >
                                                🗑️ Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {adminBarangList.length === 0 && (
                                <tr>
                                    <td colSpan="9" className={styles.emptyText}><h3>Tidak ditemukan data barang.</h3></td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    <Pagination
                        currentPage={activePage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                </>
            )}

            {/* Modal Tambah Barang */}
            <Modal isOpen={isAddOpen} onClose={() => !isSubmitting && setIsAddOpen(false)} title="Tambah Barang Baru">
                <form onSubmit={handleAdd} className={styles.form}>
                    {localError && (
                        <Alert type="error" message={localError} />
                    )}
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Barang</label>
                        <input
                            type="text"
                            placeholder="Contoh: Monitor LG 24 Inch"
                            value={namaBarang}
                            onChange={(e) => setNamaBarang(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Kategori</label>
                        <select
                            value={kategoriId}
                            onChange={(e) => setKategoriId(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        >
                            <option value="">Pilih Kategori</option>
                            {kategoriList.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Jumlah Stok</label>
                            <input
                                type="number"
                                placeholder="Contoh: 10"
                                value={stok}
                                onChange={(e) => setStok(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Satuan</label>
                            <input
                                type="text"
                                placeholder="Contoh: Pcs / Unit"
                                value={satuan}
                                onChange={(e) => setSatuan(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Harga (IDR)</label>
                            <input
                                type="number"
                                placeholder="Contoh: 1500000"
                                value={harga}
                                onChange={(e) => setHarga(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Lokasi Rak / Penyimpanan</label>
                            <input
                                type="text"
                                placeholder="Contoh: Rak A1"
                                value={lokasi}
                                onChange={(e) => setLokasi(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status Ketersediaan</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        >
                            <option value="Tersedia">Tersedia</option>
                            <option value="Habis">Habis</option>
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" onClick={() => setIsAddOpen(false)} variant="secondary" disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Barang */}
            <Modal isOpen={isEditOpen} onClose={() => !isSubmitting && setIsEditOpen(false)} title="Edit Data Barang">
                <form onSubmit={handleEdit} className={styles.form}>
                    {localError && (
                        <Alert type="error" message={localError} />
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Barang</label>
                        <input
                            type="text"
                            value={namaBarang}
                            onChange={(e) => setNamaBarang(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Kategori</label>
                        <select
                            value={kategoriId}
                            onChange={(e) => setKategoriId(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        >
                            <option value="">Pilih Kategori</option>
                            {kategoriList.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Jumlah Stok</label>
                            <input
                                type="number"
                                value={stok}
                                onChange={(e) => setStok(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Satuan</label>
                            <input
                                type="text"
                                value={satuan}
                                onChange={(e) => setSatuan(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Harga (IDR)</label>
                            <input
                                type="number"
                                value={harga}
                                onChange={(e) => setHarga(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroupFlex}>
                            <label className={styles.formLabel}>Lokasi Rak / Penyimpanan</label>
                            <input
                                type="text"
                                value={lokasi}
                                onChange={(e) => setLokasi(e.target.value)}
                                disabled={isSubmitting}
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status Ketersediaan</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        >
                            <option value="Tersedia">Tersedia</option>
                            <option value="Habis">Habis</option>
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" onClick={() => setIsEditOpen(false)} variant="secondary" disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Memperbarui..." : "Perbarui"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
