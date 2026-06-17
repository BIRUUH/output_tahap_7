import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import styles from "./kategori.module.css";

export default function Kategori() {
    const {
        kategoriList,
        loading,
        error: contextError,
        addKategori,
        updateKategori,
        deleteKategori
    } = useInventory();

    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Form states
    const [selectedId, setSelectedId] = useState(null);
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [localError, setLocalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fungsi untuk handling reset form modal tambah dan edit
    const handleOpenAdd = () => {
        setNama("");
        setDeskripsi("");
        setLocalError("");
        setIsAddOpen(true);
    };

    const handleOpenEdit = (cat) => {
        setSelectedId(cat.id);
        setNama(cat.nama_kategori || "");
        setDeskripsi(cat.deskripsi || "");
        setLocalError("");
        setIsEditOpen(true);
    };

    // Fungsi untuk handling submit form tambah dan edit kategori
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!nama.trim()) {
            setLocalError("Nama kategori wajib diisi!");
            return;
        }
        setIsSubmitting(true);
        setLocalError("");
        try {
            await addKategori({
                nama_kategori: nama.trim(),
                deskripsi: deskripsi.trim()
            });
            setIsAddOpen(false);
        } catch (err) {
            setLocalError(err.message || "Gagal menyimpan kategori.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!nama.trim()) {
            setLocalError("Nama kategori wajib diisi!");
            return;
        }
        setIsSubmitting(true);
        setLocalError("");
        try {
            await updateKategori(selectedId, {
                nama_kategori: nama.trim(),
                deskripsi: deskripsi.trim()
            });
            setIsEditOpen(false);
        } catch (err) {
            setLocalError(err.message || "Gagal memperbarui kategori.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk handling delete kategori dengan konfirmasi
    const handleDelete = async (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"? Barang yang berada dalam kategori ini akan diset menjadi 'Tanpa Kategori'.`)) {
            try {
                await deleteKategori(id);
            } catch (err) {
                alert(err.message || "Gagal menghapus kategori.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Kategori Barang</h2>
                    <p className={styles.subtitle}>Manajemen pengelompokan jenis barang inventaris.</p>
                </div>
                <Button onClick={handleOpenAdd} variant="primary" disabled={loading}>
                    ➕ Tambah Kategori
                </Button>
            </div>

            {/* Menampilkan pesan error global dari context */}
            {contextError && (
                <Alert type="error" message={contextError} />
            )}

            {loading && kategoriList.length === 0 ? (
                <Loader text="Mengambil data kategori..." />
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <th>ID KATEGORI</th>
                            <th>NAMA KATEGORI</th>
                            <th>DESKRIPSI</th>
                            <th className={styles.actionHeader}>AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kategoriList.map((cat) => (
                            <tr key={cat.id}>
                                <td className={styles.idText}>{cat.id}</td>
                                <td className={styles.nameText}>{cat.nama_kategori}</td>
                                <td>{cat.deskripsi || "-"}</td>
                                <td className={styles.actionCell}>
                                    <Button
                                        onClick={() => handleOpenEdit(cat)}
                                        variant="secondary"
                                        className={styles.actionBtn}
                                        disabled={loading}
                                    >
                                        ✏️ Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(cat.id, cat.nama_kategori)}
                                        variant="danger"
                                        className={styles.actionBtn}
                                        disabled={loading}
                                    >
                                        🗑️ Hapus
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {kategoriList.length === 0 && (
                            <tr>
                                <td colSpan="4" className={styles.emptyText}><h3>Belum ada data kategori.</h3></td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal Tambah Kategori */}
            <Modal isOpen={isAddOpen} onClose={() => !isSubmitting && setIsAddOpen(false)} title="Tambah Kategori Baru">
                <form onSubmit={handleAdd} className={styles.form}>
                    {localError && (
                        <Alert type="error" message={localError} />
                    )}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Kategori</label>
                        <input
                            type="text"
                            placeholder="Contoh: Alat Tulis"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Deskripsi</label>
                        <textarea
                            placeholder="Tambahkan catatan singkat..."
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            rows="3"
                            disabled={isSubmitting}
                            className={styles.formTextarea}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="button" onClick={() => setIsAddOpen(false)} variant="secondary" disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Kategori */}
            <Modal isOpen={isEditOpen} onClose={() => !isSubmitting && setIsEditOpen(false)} title="Edit Kategori">
                <form onSubmit={handleEdit} className={styles.form}>
                    {localError && (
                        <Alert type="error" message={localError} />
                    )}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Kategori</label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            disabled={isSubmitting}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Deskripsi</label>
                        <textarea
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            rows="3"
                            disabled={isSubmitting}
                            className={styles.formTextarea}
                        />
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