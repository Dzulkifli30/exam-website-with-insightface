import { useState, useEffect } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import AdminLayout from "../layouts/AdminLayout";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { API_URL_BASE } from "../api/api";

export default function KecuranganUjian() {
    const location = useLocation();
    const { id } = useParams();
    const peserta_id = id || location.state?.peserta_id;
    const [kecurangan, setKecurangan] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchKecurangan = async () => {
        try {
            setLoading(true);
            const endpoint = peserta_id ? `/kecurangan/peserta/${peserta_id}` : "/kecurangan";
            const res = await api.get(endpoint);
            // Assuming the API returns an array, or res.data.data
            setKecurangan(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKecurangan();
    }, []);

    const filteredKecurangan = kecurangan.filter((item) => {
        const keyword = search.toLowerCase();
        const namaUjian = item.nama_ujian || item.ujian?.nama_ujian || item.ujian?.nama || "";
        const kodeUjian = item.kode_ujian || item.ujian?.kode_ujian || "";

        return (
            namaUjian.toLowerCase().includes(keyword) ||
            kodeUjian.toLowerCase().includes(keyword)
        );
    });

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150?text=No+Image";
        if (path.startsWith("http")) return path;

        // Coba memformat path storage dari backend environment
        const baseUrl = API_URL_BASE;
        // Menambahkan forward slash jika tidak ada
        const formattedPath = path.startsWith("/") ? path : `/${path}`;

        // Mencegah double /storage 
        if (formattedPath.includes("/storage/")) {
            return `${baseUrl}${formattedPath}`;
        }

        return `${baseUrl}/storage${formattedPath}`;
    };

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <h1 className="text-2xl font-bold mb-2">Data Kecurangan Ujian</h1>
                <p className="text-gray-600 mb-6 mt-0">Daftar peserta yang terdeteksi melakukan kecurangan seperti wajah tidak cocok atau dua orang dalam kamera.</p>

                <div className="relative w-full max-w-lg mt-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama / NISN / sesi..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow transition-transform transform focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <FaSearch />
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Memuat data kecurangan...</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg transition-shadow hover:shadow-lg mt-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                                <th className="px-6 py-3">Nama Ujian</th>
                                <th className="px-6 py-3">Kode Ujian</th>
                                <th className="px-6 py-3 text-center">Index Kecurangan</th>
                                <th className="px-6 py-3 text-center">Aksi / Detail</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm text-gray-700">
                            {filteredKecurangan.map((item, idx) => (
                                <tr
                                    key={item.id || idx}
                                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {item.nama_ujian || item.ujian?.nama_ujian || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.kode_ujian || item.ujian?.kode_ujian || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(item.index_kecurangan || item.jumlah_kecurangan || item.count || 0) > 0
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {item.index_kecurangan || item.jumlah_kecurangan || item.count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            to={`/admin/kecurangan/${item.ujian_id || item.ujian?.id || item.id}`}
                                            state={{ peserta_id }}
                                            className="text-red-600 hover:text-red-800 flex items-center justify-center gap-1 font-medium mx-auto bg-red-50 w-fit px-3 py-1.5 rounded"
                                        >
                                            <FaEye /> Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filteredKecurangan.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-6 text-center text-gray-500">
                                        Tidak ada data kecurangan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
