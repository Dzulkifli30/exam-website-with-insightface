import React, { useEffect, useState } from "react";
import { FaInfo, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/api";

export default function ListPeserta() {
    const [pesertas, setPesertas] = useState([]);
    const [search, setSearch] = useState("");
    const [filterLokasi, setFilterLokasi] = useState("");
    const [filterSesi, setFilterSesi] = useState("");
    const [sortKecurangan, setSortKecurangan] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [deteksiTime, setDeteksiTime] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const uniqueSesi = [...new Set(pesertas.map(p => p.sesi?.nama_sesi).filter(Boolean))];

    // Ambil data peserta
    useEffect(() => {
        const getPeserta = async () => {
            try {
                const res = await api.get("/peserta");
                setPesertas(res.data);
            } catch (error) {
                console.error("Gagal mengambil data peserta:", error);
            }
        };
        getPeserta();
    }, []);

    // Filter + Search
    const filteredPesertas = pesertas.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.nisn.toString().includes(search) ||
            p.asal_sekolah.toLowerCase().includes(search.toLowerCase());

        const matchLokasi =
            filterLokasi === "" || p.lokasi_ujian === filterLokasi;

        const matchSesi =
            filterSesi === "" || p.sesi?.nama_sesi === filterSesi;

        const matchStatus =
            filterStatus === "" || p.user?.status?.toLowerCase() === filterStatus.toLowerCase();

        return matchSearch && matchLokasi && matchSesi && matchStatus;
    }).sort((a, b) => {
        if (sortKecurangan === "desc") {
            return (b.kecurangan_pesertas_count || 0) - (a.kecurangan_pesertas_count || 0);
        } else if (sortKecurangan === "asc") {
            return (a.kecurangan_pesertas_count || 0) - (b.kecurangan_pesertas_count || 0);
        } else if (sortKecurangan === "kemiripan_desc") {
            return (b.total_mirip || 0) - (a.total_mirip || 0);
        } else if (sortKecurangan === "kemiripan_asc") {
            return (a.total_mirip || 0) - (b.total_mirip || 0);
        }
        return 0;
    });

    // Handle Page Size Change
    const handlePageSizeChange = (e) => {
        const value = e.target.value;
        setPageSize(value === "all" ? "all" : parseInt(value, 10));
        setCurrentPage(1); // reset to page 1
    };

    const handleDeteksi = async () => {
        if (!confirm("Jalankan deteksi kemiripan antar semua sesi?")) return;

        try {
            setLoading(true);
            setDeteksiTime(null);

            const startTime = performance.now();

            const res = await api.post("/deteksi/embedding/sesi");

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;

            setDeteksiTime(duration);

            const resPeserta = await api.get("/peserta");
            setPesertas(resPeserta.data);

            console.log(res.data);
            alert("Deteksi selesai! Total hasil: " + res.data.deteksi.length);
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat melakukan deteksi.");
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const totalSeconds = Math.floor(seconds);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        let result = [];

        if (hours > 0) result.push(`${hours} jam`);
        if (minutes > 0) result.push(`${minutes} menit`);
        if (secs > 0 || result.length === 0) result.push(`${secs} detik`);

        return result.join(" ");
    };

    // Pagination calculations
    const paginatedPesertas = pageSize === "all"
        ? filteredPesertas
        : filteredPesertas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredPesertas.length / pageSize);

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight py-5">Daftar Peserta Ujian</h1>

                <button
                    onClick={handleDeteksi}
                    disabled={loading}
                    className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                    {loading ? "Memproses..." : "Deteksi Kemiripan Antar Peserta"}
                </button>
                {deteksiTime && (
                    <p className="text-sm text-gray-600">
                        Waktu deteksi: <span className="font-semibold">{formatDuration(deteksiTime)}</span>
                    </p>
                )}

                {/* 🔍 Pencarian */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cari Peserta</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Ketik nama, NISN, atau asal sekolah..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow transition-transform transform focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <FaSearch />
                        </span>
                    </div>
                </div>

                {/* Filter & Sort */}
                <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Sesi</label>
                        <select
                            value={filterSesi}
                            onChange={(e) => {
                                setFilterSesi(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full font-medium px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="">Semua Sesi</option>
                            {uniqueSesi.map((s, idx) => (
                                <option key={idx} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full font-medium px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="">Semua</option>
                            <option value="aman">Aktif</option>
                            <option value="diblokir">Diblokir</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
                        <select
                            value={sortKecurangan}
                            onChange={(e) => setSortKecurangan(e.target.value)}
                            className="w-full font-medium px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="">Default (Tidak Diurutkan)</option>
                            <option value="desc">Kecurangan (Terbanyak ke Terdikit)</option>
                            <option value="asc">Kecurangan (Terdikit ke Terbanyak)</option>
                            <option value="kemiripan_desc">Kemiripan (Terbanyak ke Terdikit)</option>
                            <option value="kemiripan_asc">Kemiripan (Terdikit ke Terbanyak)</option>
                        </select>
                    </div>
                </div>

                {/* Opsi Pagination */}
                <div className="pt-2 flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <label>Tampilkan:</label>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="all">Seluruh Data</option>
                        </select>
                    </div>
                    <div>
                        Total Data: <span className="font-semibold">{filteredPesertas.length}</span> peserta
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto bg-white shadow rounded-lg transition-shadow">
                <table className="w-full border-collapse">
                    <thead className="text-xs font-semibold text-gray-600 uppercase bg-gray-100 tracking-wider">
                        <tr className="text-left">
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">NISN</th>
                            <th className="px-6 py-3">Asal Sekolah</th>
                            <th className="px-6 py-3">Sesi</th>
                            <th className="px-6 py-3">Total Kemiripan</th>
                            <th className="px-6 py-3">Index Kecurangan</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm text-gray-700">
                        {paginatedPesertas.map((item, idx) => (
                            <tr
                                key={item.id}
                                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                            >
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4">{item.nisn}</td>
                                <td className="px-6 py-4">{item.asal_sekolah}</td>
                                <td className="px-6 py-4">{item.sesi?.nama_sesi || "-"}</td>
                                <td className="px-6 py-4">{item.total_mirip || 0}</td>
                                <td className="px-6 py-4">{item.kecurangan_pesertas_count}</td>
                                <td className="px-6 py-4">
                                    {item.user?.status?.toLowerCase() === 'aman' ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktif</span>
                                    ) : item.user?.status?.toLowerCase() === 'diblokir' ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Diblokir</span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{item.user?.status || '-'}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <Link
                                            to={`/admin/detail-peserta/${item.id}`}
                                            className="bg-himmel-primary hover:bg-himmel-cap hover:text-himmel-primary flex items-center gap-1 border p-2 text-himmel-cap rounded-lg"
                                        >
                                            <FaInfo /> Detail
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginatedPesertas?.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                    Tidak ada peserta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controls Pagination */}
            {pageSize !== "all" && totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FaChevronLeft className="text-sm" />
                    </button>

                    <div className="flex gap-1 items-center">
                        {(() => {
                            const pages = [];
                            if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                if (currentPage <= 3) {
                                    pages.push(1, 2, 3, 4, "...", totalPages);
                                } else if (currentPage >= totalPages - 2) {
                                    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                } else {
                                    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                                }
                            }

                            return pages.map((page, index) => {
                                if (page === "...") {
                                    return (
                                        <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                                            ...
                                        </span>
                                    );
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 min-w-[32px] text-sm border rounded transition-colors ${currentPage === page
                                            ? "bg-himmel-primary text-white border-himmel-primary font-semibold shadow-sm"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            });
                        })()}
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FaChevronRight className="text-sm" />
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
