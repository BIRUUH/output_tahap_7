/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import * as api from "../services/api";
import { useAuth } from "./AuthContext";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [kategoriList, setKategoriList] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch ambil data saat aplikasi dimuat
    const refreshData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [kategoriData, barangData] = await Promise.all([
                api.fetchKategori(),
                api.fetchBarang()
            ]);
            setKategoriList(kategoriData);
            setBarangList(barangData);
        } catch (err) {
            setError(err.message || "Gagal memuat data dari server.");
        } finally {
            setLoading(false);
        }
    };

    // Panggil refreshData ketika status login berubah menjadi true
    useEffect(() => {
        if (isAuthenticated) {
            refreshData();
        } else {
            setKategoriList([]);
            setBarangList([]);
        }
    }, [isAuthenticated]);

    // CRUD KATEGORI
    const addKategori = async (newCat) => {
        setLoading(true);
        setError(null);
        try {
            const created = await api.createKategori(newCat);
            setKategoriList((prev) => [...prev, created]);
            return created;
        } catch (err) {
            setError(err.message || "Gagal menambah kategori.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateKategori = async (id, updatedFields) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await api.updateKategori(id, updatedFields);
            setKategoriList((prev) =>
                prev.map((cat) => (cat.id === id ? updated : cat))
            );
            return updated;
        } catch (err) {
            setError(err.message || "Gagal mengedit kategori.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteKategori = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await api.deleteKategori(id);
            setKategoriList((prev) => prev.filter((cat) => cat.id !== id));

            // Setelah menghapus kategori, kita update barang yang berelasi dengan kategori ini agar kategoriId menjadi kosong
            const affectedItems = barangList.filter((item) => item.kategoriId === id);
            await Promise.all(
                affectedItems.map((item) =>
                    api.updateBarang(item.id, { ...item, kategoriId: "" })
                )
            );

            // Perbarui local state barangList
            setBarangList((prev) =>
                prev.map((item) => (item.kategoriId === id ? { ...item, kategoriId: "" } : item))
            );
        } catch (err) {
            setError(err.message || "Gagal menghapus kategori.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // CRUD BARANG
    const addBarang = async (newBarang) => {
        setLoading(true);
        setError(null);
        try {
            // Generate kode barang unik otomatis
            const formatId = String(barangList.length + 1).padStart(3, "0");
            const kode = `BRG-${formatId}-${Math.floor(100 + Math.random() * 900)}`;
            const payload = { kode, ...newBarang };
            const created = await api.createBarang(payload);
            setBarangList((prev) => [...prev, created]);
            return created;
        } catch (err) {
            setError(err.message || "Gagal menambah barang.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateBarang = async (id, updatedFields) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await api.updateBarang(id, updatedFields);
            setBarangList((prev) =>
                prev.map((item) => (item.id === id ? updated : item))
            );
            return updated;
        } catch (err) {
            setError(err.message || "Gagal mengedit barang.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteBarang = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await api.deleteBarang(id);
            setBarangList((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err.message || "Gagal menghapus barang.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <InventoryContext.Provider
            value={{
                kategoriList,
                barangList,
                loading,
                error,
                refreshData,
                addKategori,
                updateKategori,
                deleteKategori,
                addBarang,
                updateBarang,
                deleteBarang
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventory harus digunakan di dalam InventoryProvider");
    }
    return context;
};
