import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { FaUser, FaSchool, FaHashtag, FaCalendar, FaInfoCircle, FaClock, FaMapMarkerAlt, FaCheckCircle, FaClipboardList, FaInfo } from "react-icons/fa";
import api, { API_URL_BASE } from "../api/api";

export default function DetailPeserta() {
    const [peserta, setPeserta] = useState(null);
    const [pesertaMirip, setPesertaMirip] = useState([]);
    const [dataKecurangan, setDataKecurangan] = useState(null);
    const [ujianDilaksanakan, setUjianDilaksanakan] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPeserta = async () => {
            try {
                const res = await api.get(`/peserta/${id}`);
                setPeserta(res.data.peserta);
                setPesertaMirip(res.data.peserta_mirip);
                setDataKecurangan(res.data.data_kecurangan);
                setUjianDilaksanakan(res.data.ujian_dilaksanakan);
            } catch (err) {
                console.error("Gagal mengambil data peserta:", err);
            } finally {
                setLoading(false);
            }
        };

        getPeserta();
    }, [id]);

    if (loading) return <AdminLayout><p className="p-10">Loading...</p></AdminLayout>;

    if (!peserta)
        return (
            <AdminLayout>
                <p className="p-10 text-red-500">Data peserta tidak ditemukan.</p>
            </AdminLayout>
        );

    return (
        <AdminLayout>
            <div className="flex justify-start items-center mb-6 mx-4 md:mx-10 lg:mx-20 mt-4">
                <h1 className="text-2xl font-bold">Detail Peserta</h1>
            </div>

            <div className="flex flex-col gap-6 mx-4 md:mx-10 lg:mx-20 mb-6">
                {/* Baris Pertama: Detail Peserta dan Peserta Mirip */}
                <div className="flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-10">
                    <div className="flex flex-col w-full lg:w-auto">
                        {/* Card Detail Peserta */}
                        <div className="bg-white rounded-2xl shadow-md min-w-[350px] transition-transform hover:shadow-lg">
                            <h2 className="text-xl font-bold flex items-center gap-2 p-6">
                                Profil Peserta
                            </h2>

                            <div className="flex flex-col items-center pt-4">
                                <img
                                    src={peserta.image ? `${API_URL_BASE}/storage/${peserta.image}` : "/noimg.png"}
                                    alt="Foto Peserta"
                                    className="w-32 h-32 rounded-full mb-4 object-cover"
                                />
                            </div>

                            <div className="p-6 md:p-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Nama Lengkap</p>
                                        <p className="font-semibold text-base">{peserta.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaHashtag className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">NISN</p>
                                        <p className="font-semibold text-base">{peserta.nisn}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaSchool className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Asal Sekolah</p>
                                        <p className="font-semibold text-base">{peserta.asal_sekolah}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Tanggal Lahir</p>
                                        <p className="font-semibold text-base">{peserta.tanggal_lahir}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Lokasi Ujian</p>
                                        <p className="font-semibold text-base">{peserta.lokasi_ujian}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Sesi Ujian</p>
                                        <p className="font-semibold text-base">{peserta?.sesi?.nama_sesi}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaInfo className="text-gray-400 mr-2 text-2xl" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Status</p>
                                        {peserta.user?.status?.toLowerCase() === 'aman' ? (
                                            <p className="font-semibold text-lg text-green-700">Aktif</p>
                                        ) : peserta.user?.status?.toLowerCase() === 'diblokir' ? (
                                            <p className="font-semibold text-lg text-red-700">Diblokir</p>
                                        ) : (
                                            <p className="font-semibold text-lg text-gray-700">{peserta.user?.status || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full lg:flex-1">
                        {/* Card List Peserta Mirip */}
                        <div className="bg-white rounded-2xl shadow-md w-full transition-transform hover:shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                Daftar Peserta Mirip
                            </h2>

                            {pesertaMirip && pesertaMirip.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="py-3 px-4 font-semibold text-gray-600">Peserta Mirip</th>
                                                <th className="py-3 px-4 font-semibold text-gray-600">Sesi</th>
                                                <th className="py-3 px-4 font-semibold text-gray-600 text-center">Skor Kemiripan</th>
                                                <th className="py-3 px-4 font-semibold text-gray-600 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pesertaMirip.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col md:flex-row items-center gap-3">
                                                            <img
                                                                src={item.peserta?.image ? `${API_URL_BASE}/storage/${item.peserta.image}` : "/noimg.png"}
                                                                alt="Foto"
                                                                className="w-10 h-10 rounded-full object-cover shadow-sm"
                                                            />
                                                            <span className="font-medium text-gray-800">{item.peserta?.name || 'Tidak diketahui'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{item.peserta?.sesi?.nama_sesi || '-'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.similarity_score >= 0.9 ? 'bg-red-100 text-red-700' : item.similarity_score >= 0.8 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {(item.similarity_score * 100).toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Link
                                                            to={`/admin/detail-kemiripan/${item.id_mirip}`}
                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-himmel-primary rounded-lg hover:bg-himmel-primary hover:text-white transition-colors text-sm font-semibold"
                                                        >
                                                            <FaInfoCircle /> Info
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="font-medium">Tidak ada data wajah yang mirip.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Peserta Mirip */}


                {/* Baris Kedua: List Ujian */}
                <div className="w-full">
                    {/* List Ujian */}
                    <div className="bg-white rounded-2xl shadow-md w-full transition-transform hover:shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FaClipboardList className="text-himmel-primary" /> Daftar Ujian yang Telah Dilaksanakan
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="py-3 px-4 font-semibold text-gray-600">Nama Ujian</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600">Kode Ujian</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 text-center">Jumlah Kecurangan</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 text-center">Nilai Ujian</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ujianDilaksanakan.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-800">{item.nama_ujian}</td>
                                            <td className="py-3 px-4 text-gray-500">{item.kode_ujian}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-gray-800">{item.jumlah_kecurangan}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-gray-800">{item.nilai_ujian}</span>
                                                <span className="text-gray-400">/{item.total_nilai}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Link
                                                    to={`/admin/detail-peserta/${id}/ujian/${item.ujian_id || item.id}`}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-himmel-primary rounded-lg hover:bg-himmel-primary hover:text-white transition-colors text-sm font-semibold"
                                                >
                                                    <FaInfoCircle /> Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
