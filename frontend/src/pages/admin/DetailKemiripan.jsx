import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { FaUser, FaSchool, FaHashtag, FaCalendar, FaEye, FaUserLock, FaInfo, FaSearchPlus } from "react-icons/fa";
import api, { API_URL_BASE } from "../api/api"; // axios instance kamu
import Swal from "sweetalert2";

export default function DetailKemiripan() {
    const [detailMirip, setDetailMirip] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/mirip/${id}`);
            setDetailMirip(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!detailMirip) {
        return (
            <AdminLayout>
                <p className="text-center mt-10">Memuat data...</p>
            </AdminLayout>
        );
    }

    const peserta1 = detailMirip.peserta1;
    const peserta2 = detailMirip.peserta2;

    const handleBlockPeserta = async (peserta1, peserta2) => {
        const result = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Anda akan memblokir kedua peserta ini. Tindakan ini tidak bisa dibatalkan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Blokir Keduanya!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            // Panggil API blokir peserta1
            await api.post(`/pengguna/blokir/${peserta1.user_id}`);

            // Panggil API blokir peserta2
            await api.post(`/pengguna/blokir/${peserta2.user_id}`);

            await Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Kedua peserta telah diblokir.",
                showConfirmButton: false,
                timer: 2000,
            });

            await fetchDetail(); // Refresh data setelah blokir

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
            <div className="flex justify-start items-center mb-6 pt-5">
                <h1 className="text-2xl font-bold">Detail Kemiripan</h1>
            </div>

            <div className="mb-6 pt-5 space-y-3 w-11/12 mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-2 justify-center gap-6 lg:gap-10">
                    {/* === CARD PESERTA 1 === */}
                    <CardDetail peserta={peserta1} onImageClick={setLightboxImage} />

                    {/* === CARD PESERTA 2 === */}
                    <CardDetail peserta={peserta2} onImageClick={setLightboxImage} />
                </div>

                <div
                    className="flex flex-col md:flex-row justify-between items-center bg-white shadow rounded-lg p-4 border-l-4 border-red-500 mx-auto gap-4 md:gap-0"
                >
                    {/* Persentase */}
                    <div className="w-full md:w-2/6 text-center flex justify-center md:justify-start gap-2 items-center">
                        <p className="text-xl">
                            Persentase Kemiripan:
                        </p>
                        <p className="text-3xl font-bold text-red-600">
                            {(detailMirip.similarity_score * 100).toFixed(0)}%
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 w-full">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Aksi</p>
                        {peserta1.user.status === "diblokir" && peserta2.user.status === "diblokir" ? (
                            <button
                                disabled
                                className="flex items-center gap-2 px-6 py-2 border border-gray-400 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed font-semibold"
                            >
                                <FaUserLock /> Peserta Diblokir
                            </button>
                        ) : (
                            <button
                                onClick={() => handleBlockPeserta(peserta1, peserta2)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer shadow-sm font-semibold"
                            >
                                <FaUserLock /> Blokir Kedua Peserta
                            </button>
                        )}
                    </div>
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
                            alt="Foto Peserta"
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

function CardDetail({ peserta, onImageClick }) {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full transition-transform hover:shadow-lg border-t-4 border-himmel-primary">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2 p-6 text-center">
                Profil Peserta ({peserta.sesi?.nama_sesi})
            </h2>

            <hr className="border-gray-500 mx-auto" />

            <div className="flex flex-col items-center pt-4">
                <div 
                    className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group border-4 border-gray-200 overflow-hidden shadow-sm"
                    onClick={() => onImageClick(`${API_URL_BASE}/storage/${peserta.image}`)}
                >
                    <img
                        src={`${API_URL_BASE}/storage/${peserta.image}`}
                        alt="Foto Peserta"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <FaSearchPlus className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-4">
                <DetailRow icon={FaUser} label="Nama Lengkap" value={peserta.name} />
                <DetailRow icon={FaHashtag} label="NISN" value={peserta.nisn} />
                <DetailRow icon={FaSchool} label="Asal Sekolah" value={peserta.asal_sekolah} />
                <DetailRow icon={FaCalendar} label="Tanggal Lahir" value={peserta.tanggal_lahir} />
                <DetailRow icon={FaInfo} label="Status" value={
                    peserta.user.status === 'aman' ? <span className="text-green-600 font-bold uppercase text-sm">Aktif</span> :
                    peserta.user.status === 'diblokir' ? <span className="text-red-600 font-bold uppercase text-sm">Diblokir</span> :
                    <span className="text-gray-600 font-bold uppercase text-sm">{peserta.user.status}</span>
                } />
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="text-gray-400 mr-2 text-2xl" />
            <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="font-semibold text-lg">{value}</p>
            </div>
        </div>
    );
}
