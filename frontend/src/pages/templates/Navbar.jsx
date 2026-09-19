import React, { useState, useEffect, useRef } from "react";
import userIcon from "../../assets/user.png";
import { Menu } from "lucide-react";
import api, { API_URL_BASE } from "../api/api.js";
import { useNavigate } from "react-router-dom";

export default function Navbar({ isSidebarOpen, onToggleSidebar }) {
    const [isOpen, setIsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch user data untuk avatar
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/user");
                if (res.data?.peserta?.image) {
                    setAvatarUrl(`${API_URL_BASE}/storage/${res.data.peserta.image}`);
                }
            } catch (err) {
                console.error("Gagal memuat data user:", err);
            }
        };
        fetchUser();
    }, []);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔥 Fungsi Logout ke API Laravel
    const handleLogout = async () => {
        try {
            await api.post("/logout"); // panggil AuthController@logout

            // Hapus token dari localStorage
            localStorage.removeItem("token");

            // Redirect ke login
            navigate("/login", { replace: true });

        } catch (err) {
            console.error("Logout gagal: ", err);
        }
    };

    return (
        <div className="w-full bg-surface shadow px-4 py-3 flex items-center justify-between border-b border-border text-text font-poppins">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 transition"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold tracking-wide">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4 pr-4">
                {/* <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
                    🔔
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        3
                    </span>
                </button> */}

                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <img
                            src={avatarUrl || userIcon}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full border border-border object-cover"
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50 text-text">
                            <a
                                href="/profile"
                                className="block px-4 py-2 hover:bg-gray-100 transition"
                            >
                                Profil
                            </a>
                            <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 transition"
                            >
                                Setting
                            </a>

                            {/* 🔥 Tombol Logout yang berfungsi */}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
