import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaNetworkWired, FaBook, FaLaptopCode } from "react-icons/fa";

export default function Sidebar() {
    const location = useLocation();

    const menu = [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
        { name: "Peserta", path: "/admin/list-peserta", icon: <FaUsers /> },
        // { name: "Kemiripan", path: "/admin/kemiripan" },
        // { name: "Kemiripan Peserta", path: "/admin/kemiripan-embedding", icon: <FaNetworkWired /> },
        { name: "Ujian", path: "/admin/list-ujian", icon: <FaBook /> },
    ];

    return (
        <div className="w-64 min-h-screen bg-himmel-aura text-surface flex flex-col border-r border-himmel-aura shadow-lg font-poppins">
            <div className="p-4 text-2xl font-extrabold uppercase tracking-widest border-b border-white/20 flex items-center justify-center">
                <FaLaptopCode className="mr-3 text-3xl" />
                <span className="text-xl">Ujian CBT</span>
            </div>

            <nav className="flex-1 p-4 space-y-5 pt-10">
                {menu.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${location.pathname === item.path
                            ? "bg-himmel-primary font-medium shadow-sm"
                            : "hover:bg-himmel-primary/30 text-gray-300 hover:text-white"
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
