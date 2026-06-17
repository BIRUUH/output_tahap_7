/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/api";

const AuthContext = createContext(null);

const getStoredUser = () => {
    const storedUser = localStorage.getItem("pengguna");
    if (!storedUser) return null;
    try {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object' && typeof parsed.username === 'string') {
            return parsed;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());

    // Cek token dan pengguna yang valid saat inisialisasi state isAuthenticated
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem("token");
        const hasValidUser = !!getStoredUser();
        if (token && !hasValidUser) {
            localStorage.removeItem("token");
            localStorage.removeItem("pengguna");
            return false;
        }
        return !!token && hasValidUser;
    });

    // Function untuk login, menerima username dan password
    const login = async (username, password) => {
        // Simulasi delay tambahan agar transition/loading state terlihat
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
            const matchedUser = await loginUser(username, password);

            if (matchedUser) {
                // Simpan dummy token di localStorage
                const dummyToken = `mock-jwt-token-${matchedUser.role}-${matchedUser.id}`;
                localStorage.setItem("token", dummyToken);

                const userData = {
                    id: matchedUser.id,
                    username: matchedUser.username,
                    role: matchedUser.role
                };
                localStorage.setItem("pengguna", JSON.stringify(userData));

                // Update state
                setIsAuthenticated(true);
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    // Function untuk logout, menghapus token dan pengguna dari localStorage
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("pengguna");

        setIsAuthenticated(false);
        setUser(null);
    };

    // Menyediakan nilai context untuk komponen anak
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk mengakses context Auth
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth harus digunakan di dalam AuthProvider");
    }
    return context;
};