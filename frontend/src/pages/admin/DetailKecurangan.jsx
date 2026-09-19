import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaUser, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaInfo, FaUserLock, FaSearchPlus } from "react-icons/fa";
import AdminLayout from "../layouts/AdminLayout";
import api, { API_URL_BASE } from "../api/api";
import Swal from "sweetalert2";

export default function DetailKecurangan() {
    const { peserta_id, ujian_id } = useParams();

    const [peserta, setPeserta] = useState(null);
    const [ujian, setUjian] = useState(null);
    const [kecuranganList, setKecuranganList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await api.get(`/kecurangan/peserta/${peserta_id}/ujian/${ujian_id}`);
                const data = res.data;

                setKecuranganList(data.kecurangan || []);
                setPeserta(data.peserta || null);
                setUjian(data.ujian || null);

            } catch (err) {
                console.error("Error fetching detail:", err);
                setError("Gagal memuat data detail kecurangan.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [peserta_id, ujian_id]);

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/300?text=No+Image";
        if (path.startsWith("http")) return path;

        const baseUrl = API_URL_BASE;
        const formattedPath = path.startsWith("/") ? path : `/${path}`;

        if (formattedPath.includes("/storage/")) {
            return `${baseUrl}${formattedPath}`;
        }

        return `${baseUrl}/storage${formattedPath}`;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl font-semibold text-gray-600">Memuat detail data...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error && kecuranganList.length === 0) {
        return (
            <AdminLayout>
                <div className="mb-4">
                    <Link to={`/admin/detail-peserta/${peserta_id}/ujian/${ujian_id}`} className="text-himmel-primary hover:text-himmel-primary/80 flex items-center gap-2 font-medium w-fit">
                        <FaArrowLeft /> Kembali
                    </Link>
                </div>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
                    <p>{error || "Data tidak ditemukan."}</p>
                </div>
            </AdminLayout>
        );
    }

    const activeKecurangan = kecuranganList[currentIndex] || {};

    const handleBlockPeserta = async () => {
        const userIdToBlock = peserta?.user_id || peserta?.user?.id;

        if (!userIdToBlock) {
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "ID Pengguna tidak ditemukan",
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }

        const result = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: `Anda akan memblokir peserta ${peserta?.name || "ini"}. Tindakan ini tidak bisa dibatalkan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Blokir!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await api.post(`/pengguna/blokir/${userIdToBlock}`);
            await Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: `Peserta ${peserta?.name || userIdToBlock} telah diblokir.`,
                showConfirmButton: false,
                timer: 2000,
            });

            if (peserta?.id) {
                const resPeserta = await api.get(`/peserta/${peserta.id}`);
                setPeserta(resPeserta.data.peserta || resPeserta.data.data || resPeserta.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memblokir peserta.",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6">
                <div>
                    <Link to={`/admin/detail-peserta/${peserta_id}/ujian/${ujian_id}`} className="text-himmel-primary hover:text-himmel-primary/80 hover:underline flex items-center gap-2 font-medium w-fit mb-4 transition-colors">
                        <FaArrowLeft /> Kembali ke Detail Ujian Peserta
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Detail Indikasi Kecurangan</h1>
                    {ujian && <p className="text-gray-600 mt-1">Ujian: {ujian.nama_ujian} ({ujian.kode_ujian})</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-10">
                {/* Panel Info Peserta */}
                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-himmel-primary md:col-span-1 h-fit">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6">Informasi Peserta</h2>

                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
                            {peserta?.image || peserta?.foto_profil ? (
                                <img
                                    src={getImageUrl(peserta.image || peserta.foto_profil)}
                                    alt="Profil Peserta"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-gray-300 text-5xl" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaUser />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Nama Lengkap</p>
                                <p className="font-medium text-gray-800">{peserta?.name || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaIdCard />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">NISN</p>
                                <p className="font-medium text-gray-800">{peserta?.nisn || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaMapMarkerAlt />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi Ujian</p>
                                <p className="font-medium text-gray-800">{peserta?.lokasi_ujian || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaClock />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Sesi Ujian</p>
                                <p className="font-medium text-gray-800">{peserta?.sesi?.nama_sesi || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaCalendarAlt />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Tanggal Sesi</p>
                                <p className="font-medium text-gray-800">{peserta?.sesi?.tanggal_sesi || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <FaInfo />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                                {peserta?.user?.status?.toLowerCase() === 'aman' ? (
                                    <p className="font-semibold text-green-700">Aktif</p>
                                ) : peserta?.user?.status?.toLowerCase() === 'diblokir' ? (
                                    <p className="font-semibold text-red-700">Diblokir</p>
                                ) : (
                                    <p className="font-semibold text-gray-700">{peserta?.user?.status || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Perbandingan Foto */}
                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-himmel-primary md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Bukti Visual Kecurangan</h2>

                    {kecuranganList.length > 0 ? (
                        <div className="flex flex-col items-center">

                            {/* Similarity Score */}
                            <div className="w-full mb-6">
                                <p className="text-sm font-semibold text-gray-600 mb-1">
                                    Bukti Kecurangan Ke ({currentIndex + 1} dari {kecuranganList.length})
                                </p>
                            </div>

                            {/* Foto Ujian Slider */}
                            <div
                                className="w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-red-300 shadow-md relative group bg-gray-50 flex justify-center items-center cursor-pointer"
                                onClick={() => activeKecurangan.foto_ujian && setLightboxImage(getImageUrl(activeKecurangan.foto_ujian))}
                            >
                                {activeKecurangan.foto_ujian ? (
                                    <>
                                        <img
                                            src={getImageUrl(activeKecurangan.foto_ujian)}
                                            alt={`Bukti Ujian ${currentIndex + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <FaSearchPlus className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-sm">Tidak ada foto bukti</p>
                                )}
                            </div>

                            <div className="flex justify-between w-full max-w-md mt-4">
                                <button
                                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                                    disabled={currentIndex === 0}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 disabled:opacity-50 rounded font-medium hover:bg-gray-300 transition"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setCurrentIndex((p) => Math.min(kecuranganList.length - 1, p + 1))}
                                    disabled={currentIndex === kecuranganList.length - 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 disabled:opacity-50 rounded font-medium hover:bg-gray-300 transition"
                                >
                                    Selanjutnya
                                </button>
                            </div>

                            {/* Status & Keterangan */}
                            <div className="mt-8 bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-600 w-full">
                                <p className="font-semibold text-gray-800 mb-2 border-b pb-1">Detail Kejadian:</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Data terekam pada: <span className="font-medium">{activeKecurangan.created_at ? new Date(activeKecurangan.created_at).toLocaleString('id-ID') : '-'}</span></li>
                                    <li>Status: <span className={`font-bold uppercase ${activeKecurangan.status === 'aman' ? 'text-green-600' : 'text-red-600'}`}>{activeKecurangan.status || "Terindikasi Curang"}</span></li>
                                    <li>Keterangan: {activeKecurangan.keterangan || "Tidak ada keterangan catatan."}</li>
                                </ul>
                            </div>

                            {/* Tombol Blokir */}
                            <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Aksi</p>
                                {peserta?.user?.status?.toLowerCase() === "diblokir" ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-2 border border-gray-400 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed"
                                    >
                                        <FaUserLock /> Peserta Diblokir
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBlockPeserta}
                                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer shadow-sm font-semibold"
                                    >
                                        <FaUserLock /> Blokir Peserta
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                            <p className="text-gray-500 font-medium">Tidak ada foto bukti kecurangan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
                        <img
                            src={lightboxImage}
                            alt="Bukti Kecurangan"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg transition cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
