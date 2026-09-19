import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/api";
import { FaUsers, FaExclamationTriangle, FaBook, FaArrowRight, FaExclamationCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [data, setData] = useState({
        total_peserta: 0,
        total_kecurangan: 0,
        total_ujian: 0,
        peserta_kecurangan: [],
        ujian_terbaru: []
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/admin");
                setData(response.data);
            } catch (error) {
                console.error("Gagal mengambil data dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        Dashboard Admin
                    </h2>
                    <p className="text-gray-600">
                        Ringkasan informasi dan aktivitas sistem ujian CBT.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-start gap-5 border border-gray-200 border-l-4 border-l-himmel-primary">
                                <div className="p-3 bg-himmel-primary/10 rounded-lg">
                                    <FaBook className="text-xl text-himmel-aura" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                                        Total Ujian
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {data.total_ujian}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-start gap-5 border border-gray-200 border-l-4 border-l-himmel-primary">
                                <div className="p-3 bg-himmel-primary/10 rounded-lg">
                                    <FaUsers className="text-xl text-himmel-aura" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                                        Total Peserta
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {data.total_peserta}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-white  rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-start gap-5 border border-gray-200 border-l-4 border-l-himmel-belt">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <FaExclamationCircle className="text-xl text-himmel-belt" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-1">
                                        Total Kemiripan Antar Peserta
                                    </h3>
                                    <p className="text-3xl font-bold">
                                        {data.total_kemiripan}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-white  rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-start gap-5 border border-gray-200 border-l-4 border-l-himmel-belt">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <FaExclamationTriangle className="text-xl text-himmel-belt" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-1">
                                        Total Kecurangan
                                    </h3>
                                    <p className="text-3xl font-bold">
                                        {data.total_kecurangan}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
                            {/* Table Ujian Terbaru */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ujian Terbaru</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3">Nama Ujian</th>
                                                <th className="px-6 py-3">Kode</th>
                                                <th className="px-6 py-3">Waktu Mulai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.ujian_terbaru && data.ujian_terbaru.length > 0 ? (
                                                data.ujian_terbaru.map((ujian, index) => (
                                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{ujian.nama_ujian}</td>
                                                        <td className="px-6 py-4">{ujian.kode_ujian}</td>
                                                        <td className="px-6 py-4">
                                                            {new Date(ujian.waktu_mulai).toLocaleString('id-ID', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Tidak ada data ujian terbaru.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <Link to="/admin/list-ujian" className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1 transition-colors">
                                        Lihat selengkapnya <FaArrowRight className="text-xs" />
                                    </Link>
                                </div>
                            </div>

                            {/* Table Peserta Kecurangan */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Peserta Kecurangan Terbanyak</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3">Nama</th>
                                                <th className="px-6 py-3">NISN</th>
                                                <th className="px-6 py-3 text-center">Jumlah Kecurangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.peserta_kecurangan && data.peserta_kecurangan.length > 0 ? (
                                                data.peserta_kecurangan.map((peserta, index) => (
                                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{peserta.name}</td>
                                                        <td className="px-6 py-4">{peserta.nisn}</td>
                                                        <td className="px-6 py-4 text-center text-red-600 font-bold">{peserta.kecurangan_pesertas_count}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Belum ada data kecurangan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <Link to="/admin/list-peserta" className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1 transition-colors">
                                        Lihat selengkapnya <FaArrowRight className="text-xs" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
