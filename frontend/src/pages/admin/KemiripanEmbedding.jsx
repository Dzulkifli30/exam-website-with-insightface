import { useState, useEffect } from "react";
import { FaEye, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AdminLayout from "../layouts/AdminLayout";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function KemiripanEmbedding() {
    const [kemiripans, setKemiripans] = useState([]);
    const [search, setSearch] = useState("");
    const [sortPersentase, setSortPersentase] = useState("");
    const [loading, setLoading] = useState(false);
    const [deteksiTime, setDeteksiTime] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchKemiripan = async () => {
        try {
            const res = await api.get("/mirip");
            setKemiripans(res.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchKemiripan();
    }, []);

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

            await fetchKemiripan(); // Refresh data setelah deteksi
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

    const percentageColor = (percentage) => {
        if (percentage > 50 && percentage < 66)
            return { badge: "bg-yellow-500", text: "text-yellow-500" };
        if (percentage >= 66 && percentage < 80)
            return { badge: "bg-orange-500", text: "text-orange-600" };
        if (percentage >= 80)
            return { badge: "bg-red-600", text: "text-red-600" };

        return { badge: "bg-gray-400", text: "text-gray-600" };
    };

    const filteredKemiripan = kemiripans.filter((item) => {
        const keyword = search.toLowerCase();
        const matchSearch =
            item.peserta1.name.toLowerCase().includes(keyword) ||
            item.peserta2.name.toLowerCase().includes(keyword) ||
            item.peserta1.nisn.toString().includes(keyword) ||
            item.peserta2.nisn.toString().includes(keyword);

        return matchSearch;
    }).sort((a, b) => {
        if (sortPersentase === "desc") {
            return b.similarity_score - a.similarity_score;
        } else if (sortPersentase === "asc") {
            return a.similarity_score - b.similarity_score;
        }
        return 0; // Default order
    });

    // Handle Page Size Change
    const handlePageSizeChange = (e) => {
        const value = e.target.value;
        setPageSize(value === "all" ? "all" : parseInt(value, 10));
        setCurrentPage(1); // reset to page 1
    };

    // Pagination calculations
    const paginatedKemiripan = pageSize === "all"
        ? filteredKemiripan
        : filteredKemiripan.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredKemiripan.length / pageSize);

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Daftar Kemiripan Antar Peserta</h1>
                <button
                    onClick={handleDeteksi}
                    disabled={loading}
                    className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                    {loading ? "Memproses..." : "Deteksi Kemiripan Embedding"}
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
                            placeholder="Ketik nama / NISN dari peserta 1 atau 2..."
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
                        <select
                            value={sortPersentase}
                            onChange={(e) => setSortPersentase(e.target.value)}
                            className="w-full font-medium px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="">Default (Tidak Diurutkan)</option>
                            <option value="desc">Persentase (Tertinggi ke Terendah)</option>
                            <option value="asc">Persentase (Terendah ke Tertinggi)</option>
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
                        Total Data: <span className="font-semibold">{filteredKemiripan.length}</span> record
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {paginatedKemiripan.map((item) => (
                    <div
                        key={item.id}
                        className="flex justify-between items-center bg-white shadow rounded-lg p-4 border-l-4 border-red-500"
                    >
                        {/* Persentase */}
                        <div className="w-1/6 text-center">
                            {(() => {
                                const percentage = item.similarity_score * 100;
                                const color = percentageColor(percentage);

                                return (
                                    <>
                                        <p className={`text-3xl font-bold ${color.text}`}>
                                            {percentage.toFixed(0)}%
                                        </p>

                                        <span
                                            className={`text-white text-xs px-3 py-1 rounded-full ${color.badge}`}
                                        >
                                            {item.status}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Peserta 1 */}
                        <div className="w-1/3 flex justify-start items-center gap-4">
                            <div className="">
                                <h3 className="font-semibold">{item.peserta1.name}</h3>
                                <p className="text-sm text-gray-600">
                                    NISN: {item.peserta1.nisn}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {item.peserta1.asal_sekolah}
                                </p>
                            </div>
                            <p className="text-lg text-gray-600">
                                Status: {item.peserta1.user.status}
                            </p>
                        </div>

                        {/* Peserta 2 */}
                        <div className="w-1/3 flex justify-start items-center gap-4">
                            <div className="">
                                <h3 className="font-semibold">{item.peserta2.name}</h3>
                                <p className="text-sm text-gray-600">
                                    NISN: {item.peserta2.nisn}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {item.peserta2.asal_sekolah}
                                </p>
                            </div>
                            <p className="text-lg text-gray-600">
                                Status: {item.peserta2.user.status}
                            </p>
                        </div>

                        {/* Tombol Detail */}
                        <div className="w-1/6 flex justify-center">
                            <Link
                                to={`/admin/detail-kemiripan/${item.id}`}
                                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                            >
                                <FaEye /> Detail
                            </Link>
                        </div>
                    </div>
                ))}
                {paginatedKemiripan.length === 0 && (
                    <div className="text-center py-6 text-gray-500 bg-white rounded-lg shadow">
                        Tidak ada data kemiripan yang ditemukan.
                    </div>
                )}
            </div>

            {/* Controls Pagination */}
            {pageSize !== "all" && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2 pb-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
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
                                            ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-sm"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        <FaChevronRight className="text-sm" />
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
