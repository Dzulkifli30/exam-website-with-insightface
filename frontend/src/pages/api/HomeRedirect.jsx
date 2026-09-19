import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

export default function HomeRedirect() {
    const [auth, setAuth] = useState({
        loading: true,
        isLoggedIn: false,
        role: null,
    });

    useEffect(() => {
        const check = async () => {
            try {
                const res = await api.get("/user");
                setAuth({
                    loading: false,
                    isLoggedIn: true,
                    role: res.data.role,
                });
            } catch {
                setAuth({
                    loading: false,
                    isLoggedIn: false,
                    role: null,
                });
            }
        };
        check();
    }, []);

    if (auth.loading) return <p>Loading...</p>;

    if (!auth.isLoggedIn) return <Navigate to="/login" replace />;

    if (auth.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (auth.role === "peserta") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/login" replace />;
}
