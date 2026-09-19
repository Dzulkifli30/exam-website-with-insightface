import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

export default function ProtectedRoute({ children, roles = [] }) {
    const [auth, setAuth] = useState({
        loading: true,
        isLoggedIn: false,
        role: null,
        pesertaData: true,
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/user");
                setAuth({
                    loading: false,
                    isLoggedIn: true,
                    role: res.data.role,
                    pesertaData: res.data.peserta !== null,
                });
            } catch {
                setAuth({
                    loading: false,
                    isLoggedIn: false,
                    role: null,
                    pesertaData: false,
                });
            }
        };
        checkAuth();
    }, []);

    const { loading, isLoggedIn, role, pesertaData } = auth;

    if (loading) return <p>Loading...</p>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    // cek role
    if (roles.length > 0 && !roles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (role === "peserta" && !pesertaData) {
        const allowed = ["/profile"];
        const current = window.location.pathname;

        if (!allowed.includes(current)) {
            alert("Lengkapi biodata dahulu");
            return <Navigate to="/profile" replace />;
        }
    }

    return children;
}
