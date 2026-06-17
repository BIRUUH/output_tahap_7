import axios from "axios";

// Membuat instance Axios dengan konfigurasi dasar agar tidak perlu menulis baseURL berulang kali
const inventoryApi = axios.create({
    baseURL: import.meta.env.VITE_API_INVENTORY_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
});

// Response Interceptor untuk penanganan error global
const handleResponseError = (error) => {
    console.error("API Error Response:", error.response || error.message);
    const message = error.response?.data?.message || error.message || "Terjadi kesalahan pada server.";
    return Promise.reject(new Error(message));
};

inventoryApi.interceptors.response.use((response) => response, handleResponseError);

// ENDPOINT API UNTUK USER

export const fetchUsers = () => {
    return axios.get(import.meta.env.VITE_API_USER_URL + '/user')
        .then(response => {
            console.log();
            return response.data;
        }).catch(error => {
            return handleResponseError(error);
        });
}

// Melakukan verifikasi identitas pengguna (Username & Password)

export const loginUser = async (username, password) => {
    try {
        // Memfilter data berdasarkan username langsung di sisi server untuk mencegah kebocoran data ke client-side.
        const response = await axios.get(
            `${import.meta.env.VITE_API_USER_URL}/user?username=${encodeURIComponent(username.trim())}`
        );
        const users = response.data;

        const matchedUser = users.find(
            (u) =>
                u.username.toLowerCase() === username.toLowerCase().trim() &&
                u.password === password
        );
        return matchedUser || null;
    } catch (error) {
        console.error("Login API Error:", error);
        return null;
    }
};

// Endpoint API untuk kategori (CRUD)

export const fetchKategori = async () => {
    const response = await inventoryApi.get("/kategori");
    return response.data;
};

export const createKategori = async (data) => {
    const response = await inventoryApi.post("/kategori", data);
    return response.data;
};

export const updateKategori = async (id, data) => {
    const response = await inventoryApi.put(`/kategori/${id}`, data);
    return response.data;
};

export const deleteKategori = async (id) => {
    const response = await inventoryApi.delete(`/kategori/${id}`);
    return response.data;
};

// Endpoint API untuk barang (CRUD)

export const fetchBarang = async () => {
    const response = await inventoryApi.get("/barang");
    return response.data;
};

export const createBarang = async (data) => {
    const response = await inventoryApi.post("/barang", data);
    return response.data;
};

export const updateBarang = async (id, data) => {
    const response = await inventoryApi.put(`/barang/${id}`, data);
    return response.data;
};

export const deleteBarang = async (id) => {
    const response = await inventoryApi.delete(`/barang/${id}`);
    return response.data;
};