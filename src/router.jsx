import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppLayout from "./components/layouts/AppLayout";
import AdminHome from "./pages/admin/home";
import StaffHome from "./pages/staff/home";
import AdminBarang from "./pages/admin/barang";
import StaffBarang from "./pages/staff/barang";
import Kategori from "./pages/admin/kategori";
import Login from "./pages/login";
import NotFound from "./pages/not_found";
import { useAuth } from "./context/AuthContext";

// Komponen Protected Route
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Wrapper Dinamis untuk Halaman Home (Dashboard)
const DashboardRoute = () => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    return role === "administrator" ? <AdminHome /> : <StaffHome />;
};

// Wrapper Dinamis untuk Halaman Daftar Barang
const BarangRoute = () => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    return role === "administrator" ? <AdminBarang /> : <StaffBarang />;
};

// Guard khusus untuk halaman Kategori
const KategoriProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    
    if (role !== "administrator") {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* Route Login */}
            <Route path="/login" element={<Login />} />

            {/* Nested Route */}
            <Route
                // Protected Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                {/* Route Anak */}
                <Route index element={<DashboardRoute />} />

                {/* Route Redirect Dashboard */}
                <Route path="dashboard" element={<Navigate to="/" replace />} />

                {/* Route Dasar */}
                <Route path="barang" element={<BarangRoute />} />
                <Route
                    path="kategori"
                    element={
                        <KategoriProtectedRoute>
                            <Kategori />
                        </KategoriProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}