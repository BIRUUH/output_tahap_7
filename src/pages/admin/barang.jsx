import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import styles from "./barang.module.css";

export default function Barang() {
    const { 
        barangList, 
        kategoriList, 
        loading, 
        error: contextError, 
        addBarang, 
        updateBarang, 
        deleteBarang 
    } = useInventory();

    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Form states
    const [selectedId, setSelectedId] = useState(null);
    const [namaBarang, setNamaBarang] = useState("");
    const [kategoriId, setKategoriId] = useState("");
    const [stok, setStok] = useState("");
    const [satuan, setSatuan] = useState("");
    const [harga, setHarga] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [status, setStatus] = useState("Tersedia");
    const [searchQuery, setSearchQuery] = useState("");
    const [localError, setLocalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        // cek input kosong dan trim untuk namaBarang, satuan, lokasi
        if (!namaBarang.trim() || !stok || !satuan.trim() || !harga || !lokasi.trim()) {
            setLocalError("Semua field wajib diisi!");
            return false;
        }
        // cek angka negatif
        if (isNaN(stok) || Number(stok) < 0) {
            setLocalError("Stok harus berupa angka positif!");
            return false;
        }
        // cek angka negatif
        if (isNaN(harga) || Number(harga) < 0) {
            setLocalError("Harga harus berupa angka positif!");
            return false;
        }
        return true;
    };

    // Fungsi untuk handling submit tambah dan edit barang
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
        } catch (err) {
            setLocalError(err.message || "Gagal menyimpan barang.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
            } catch (err) {
                alert(err.message || "Gagal menghapus barang.");
            }
        }
    };

    // Filter barang berdasarkan query pencarian
    const filteredBarang = barangList.filter((item) => {
        const keyword = searchQuery.toLowerCase().trim();
        const matchesName = item.nama_barang?.toLowerCase().includes(keyword);
        const matchesKode = item.kode?.toLowerCase().includes(keyword);
        return matchesName || matchesKode;
    });

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
                <Button onClick={handleOpenAdd} variant="primary" disabled={loading}>
                    ➕ Tambah Barang Baru
                </Button>
            </div>

            {/* Menampilkan pesan error global dari context */}
            {contextError && (
                <Alert type="error" message={contextError} />
            )}

            {/* Filter pencarian */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Cari barang berdasarkan nama atau kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {loading && barangList.length === 0 ? (
                <Loader text="Mengambil data barang..." />
            ) : (
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
                        {filteredBarang.map((item) => {
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
                                            disabled={loading}
                                        >
                                            ✏️ Edit
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(item.id, item.nama_barang)} 
                                            variant="danger" 
                                            className={styles.actionBtn}
                                            disabled={loading}
                                        >
                                            🗑️ Hapus
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredBarang.length === 0 && (
                            <tr>
                                <td colSpan="9" className={styles.emptyText}><h3>Tidak ditemukan data barang.</h3></td>
                            </tr>
                        )}
                    </tbody>
                </Table>
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
