import { useState, useEffect } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import AdminLayout from "../layouts/AdminLayout";
import { Link } from "react-router-dom";
import api from "../api/api"; // pastikan axios instance kamu ada di sini

export default function TabelKemiripan() {
    const [kemiripans, setKemiripans] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [deteksiTime, setDeteksiTime] = useState(null);

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
        if (!confirm("Jalankan deteksi kemiripan antar semua kelas?")) return;

        try {
            setLoading(true);
            setDeteksiTime(null);

            const startTime = performance.now(); // ⏱ mulai hitung

            const res = await api.post("/deteksi/semua/sesi");

            const endTime = performance.now(); // ⏱ selesai
            const duration = (endTime - startTime) / 1000;

            setDeteksiTime(duration);

            await fetchKemiripan(); // Refresh data setelah deteksi

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

    const filteredKemiripan = kemiripans.filter((item) => {
        const keyword = search.toLowerCase();
        return (
            item.peserta1.name.toLowerCase().includes(keyword) ||
            item.peserta2.name.toLowerCase().includes(keyword) ||
            item.peserta1.nisn.toString().includes(keyword) ||
            item.peserta2.nisn.toString().includes(keyword)
        );
    });

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <h1 className="text-2xl font-bold">Tabel Kemiripan</h1>
                <button
                    onClick={handleDeteksi}
                    disabled={loading}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                    {loading ? "Memproses..." : "Deteksi Kemiripan"}
                </button>
                {deteksiTime && (
                    <p className="text-sm text-gray-600">
                        Waktu deteksi: <span className="font-semibold">{formatDuration(deteksiTime)}</span>
                    </p>
                )}
                <div className="relative w-full max-w-lg">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama / NISN / sekolah..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow transition-transform transform hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <FaSearch />
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {filteredKemiripan.map((item) => (
                    <div
                        key={item.id}
                        className="flex justify-between items-center bg-white shadow rounded-lg p-4 border-l-4 border-red-500"
                    >
                        {/* Persentase */}
                        <div className="w-1/6 text-center">
                            <p className="text-3xl font-bold text-red-600">
                                {(item.similarity_score * 100).toFixed(0)}%
                            </p>
                            <span
                                className={`text-white text-xs px-3 py-1 rounded-full bg-red-500`}
                            >
                                {item.status}
                            </span>
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
                {filteredKemiripan.length === 0 && (
                    <p className="text-gray-500">Tidak ada data kemiripan yang ditemukan.</p>
                )}
            </div>
        </AdminLayout>
    );
}
