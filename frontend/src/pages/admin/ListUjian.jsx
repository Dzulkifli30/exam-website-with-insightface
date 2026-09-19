import React, { useEffect, useState } from "react";
import { FaInfo, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/api";

export default function ListUjian() {
    const [ujians, setUjians] = useState([]);

    useEffect(() => {
        const fetchUjian = async () => {
            try {
                const res = await api.get("/ujian");
                setUjians(res.data.data);
            } catch (error) {
                console.error("Gagal mengambil data ujian:", error);
            }
        };
        fetchUjian();
    }, []);

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center py-5">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">List Ujian</h1>
                    <Link
                        to="/admin/tambah-ujian"
                        className="bg-primary hover:bg-primary/90 transition-colors text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
                    >
                        <FaPlus /> Tambah Ujian
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow rounded-lg transition-shadow hover:shadow-lg">
                <table className="w-full border-collapse">
                    <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 tracking-wider">
                        <tr className="text-left">
                            <th className="px-6 py-3">Nama Ujian</th>
                            <th className="px-6 py-3">Kode Ujian</th>
                            <th className="px-6 py-3">Deskripsi</th>
                            <th className="px-6 py-3">Durasi (Menit)</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {ujians.map((item, idx) => (
                            <tr
                                key={item.id}
                                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                            >
                                <td className="px-6 py-4 font-medium">{item.nama_ujian}</td>
                                <td className="px-6 py-4">{item.kode_ujian}</td>
                                <td className="px-6 py-4">{item.deskripsi || "-"}</td>
                                <td className="px-6 py-4">{item.durasi}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <Link
                                            to={`/admin/detail-ujian/${item.id}`}
                                            className="bg-himmel-primary hover:bg-himmel-cap hover:text-himmel-primary flex items-center gap-1 border p-2 text-himmel-cap rounded-lg"
                                        >
                                            <FaInfo /> Detail
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!ujians || ujians.length === 0) && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    Tidak ada data ujian.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
