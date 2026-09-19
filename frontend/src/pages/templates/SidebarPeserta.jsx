import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaNetworkWired, FaBook, FaLaptopCode } from "react-icons/fa";

export default function Sidebar() {
    const location = useLocation();

    const menu = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Profil", path: "/profile" },
        { name: "Ujian", path: "/list-ujian" },
        // { name: "Hasil", path: "/hasil" },
    ];

    return (
        <div className="w-64 min-h-screen bg-himmel-aura text-surface flex flex-col border-r border-himmel-aura shadow-lg">
            <div className="p-4 text-2xl font-extrabold uppercase tracking-widest border-b border-white/20 flex items-center justify-center">
                <FaLaptopCode className="mr-3 text-3xl" />
                <span className="text-xl">Ujian CBT</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menu.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-4 py-2 rounded-md transition ${location.pathname === item.path
                            ? "bg-himmel-primary font-medium shadow-sm"
                            : "hover:bg-himmel-primary/30 text-gray-300 hover:text-white"
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
