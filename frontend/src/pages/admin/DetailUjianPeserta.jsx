import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import api from "../api/api";

export default function DetailUjianPeserta() {
    const { peserta_id, ujian_id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getDetailUjian = async () => {
            try {
                const res = await api.get(`/peserta/${peserta_id}/ujian/${ujian_id}`);
                setData(res.data.data);
            } catch (err) {
                console.error("Gagal mengambil data ujian peserta:", err);
            } finally {
                setLoading(false);
            }
        };

        getDetailUjian();
    }, [peserta_id, ujian_id]);

    if (loading) return <AdminLayout><p className="p-10 text-center text-gray-500 font-medium">Memuat detail ujian...</p></AdminLayout>;

    if (!data)
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-20">
                    <p className="text-red-500 mb-6 text-lg font-semibold">Data ujian peserta tidak ditemukan.</p>
                    <Link to={`/admin/detail-peserta/${peserta_id}`} className="px-6 py-2 bg-blue-50 text-himmel-primary hover:bg-himmel-primary hover:text-white rounded-lg transition-colors flex items-center gap-2 font-medium">
                        <FaArrowLeft /> Kembali ke Detail Peserta
                    </Link>
                </div>
            </AdminLayout>
        );

    const { peserta, ujian, ringkasan, detail_soal } = data;

    return (
        <AdminLayout>
            <div className="mx-4 md:mx-10 lg:mx-20 mb-10 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to={`/admin/detail-peserta/${peserta_id}`} className="p-3 bg-white shadow-sm rounded-full hover:bg-gray-50 border border-gray-100 transition-colors">
                            <FaArrowLeft className="text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Detail Hasil Ujian Peserta</h1>
                    </div>
                </div>

                {/* Ringkasan Header */}
                <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 border-t-4 border-himmel-primary">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{peserta.name}</h2>
                        <p className="text-gray-500 font-medium mb-4">NISN: {peserta.nisn}</p>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block">
                            <p className="text-sm text-gray-500 mb-1">Mata Ujian</p>
                            <p className="text-gray-800 font-bold">{ujian.nama_ujian} <span className="text-gray-400 font-normal">({ujian.kode_ujian})</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 lg:gap-6 w-full lg:w-auto justify-center lg:justify-end">
                        <div className="text-center p-4 lg:p-6 bg-blue-50 rounded-2xl border border-blue-100 flex-1 sm:flex-none min-w-[160px] shadow-sm flex flex-col justify-center items-center">
                            <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">Skor Akhir</p>
                            <p className="text-4xl font-extrabold text-blue-800">
                                {ringkasan.total_nilai_didapat} <span className="text-xl text-blue-400 font-medium">/ {ringkasan.total_nilai_keseluruhan}</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 justify-center flex-1 sm:flex-none">
                            <div className="flex items-center gap-4 bg-green-50 px-4 lg:px-6 py-3 lg:py-4 rounded-xl border border-green-100 shadow-sm">
                                <FaCheckCircle className="text-green-500 text-2xl" />
                                <div>
                                    <p className="text-xs text-green-600 font-bold uppercase mb-0.5">Jawaban Benar</p>
                                    <p className="text-green-800 font-extrabold text-xl">{ringkasan.jumlah_benar} Soal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-red-50 px-4 lg:px-6 py-3 lg:py-4 rounded-xl border border-red-100 shadow-sm">
                                <FaTimesCircle className="text-red-500 text-2xl" />
                                <div>
                                    <p className="text-xs text-red-600 font-bold uppercase mb-0.5">Jawaban Salah</p>
                                    <p className="text-red-800 font-extrabold text-xl">{ringkasan.jumlah_salah} Soal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Deteksi Kecurangan */}
                <div className={`bg-white rounded-2xl shadow-md p-6 mb-8 border-t-4 ${
                    ujian.jumlah_kecurangan === 0 ? 'border-green-400' :
                    ujian.status_kecurangan === 'aman' ? 'border-yellow-400' :
                    ujian.status_kecurangan === 'mencurigakan' ? 'border-orange-400' : 'border-red-500'
                }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                                ujian.jumlah_kecurangan === 0 ? 'bg-green-50' :
                                ujian.status_kecurangan === 'aman' ? 'bg-yellow-50' :
                                ujian.status_kecurangan === 'mencurigakan' ? 'bg-orange-50' : 'bg-red-50'
                            }`}>
                                {ujian.jumlah_kecurangan === 0 ? (
                                    <FaShieldAlt className="text-green-500 text-2xl" />
                                ) : (
                                    <FaExclamationTriangle className={`text-2xl ${
                                        ujian.status_kecurangan === 'aman' ? 'text-yellow-500' :
                                        ujian.status_kecurangan === 'mencurigakan' ? 'text-orange-500' : 'text-red-500'
                                    }`} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Deteksi Kecurangan</h3>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-2xl font-extrabold ${
                                        ujian.jumlah_kecurangan === 0 ? 'text-green-600' :
                                        ujian.status_kecurangan === 'aman' ? 'text-yellow-600' :
                                        ujian.status_kecurangan === 'mencurigakan' ? 'text-orange-600' : 'text-red-600'
                                    }`}>{ujian.jumlah_kecurangan}</span>
                                    <span className="text-gray-500 font-medium">kecurangan terdeteksi</span>
                                </div>
                                {ujian.jumlah_kecurangan > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                                            ujian.status_kecurangan === 'aman'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : ujian.status_kecurangan === 'mencurigakan'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-red-100 text-red-700'
                                        }`}>
                                            {ujian.status_kecurangan}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            — {ujian.status_kecurangan === 'aman'
                                                ? 'Wajah tidak tampak jelas'
                                                : ujian.status_kecurangan === 'mencurigakan'
                                                    ? 'Wajah terlihat tidak mirip'
                                                    : 'Bukti kecurangan sangat kuat'}
                                        </span>
                                    </div>
                                )}
                                {ujian.jumlah_kecurangan === 0 && (
                                    <p className="text-sm text-green-600 font-medium">Tidak ada kecurangan yang terdeteksi selama ujian berlangsung.</p>
                                )}
                            </div>
                        </div>

                        {ujian.jumlah_kecurangan > 0 && (
                            <Link
                                to={`/admin/detail-peserta/${peserta_id}/ujian/${ujian_id}/kecurangan`}
                                className="cursor-pointer flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-xl transition-all font-semibold shadow-sm whitespace-nowrap"
                            >
                                <FaExclamationTriangle /> Lihat Bukti Kecurangan
                            </Link>
                        )}
                    </div>
                </div>

                {/* List Soal */}
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 mt-8">
                    <span className="w-8 h-8 rounded-lg bg-himmel-primary text-white flex items-center justify-center text-sm shadow-sm">{detail_soal.length}</span>
                    Detail Jawaban Soal
                </h3>

                <div className="space-y-6">
                    {detail_soal.map((soal, index) => (
                        <div key={soal.soal_id} className={`bg-white rounded-2xl shadow-sm border-l-8 p-6 lg:p-8 transition-all hover:shadow-md ${soal.is_correct ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <h4 className="font-semibold text-lg text-gray-800 flex-1 leading-relaxed">
                                    <span className="text-gray-400 mr-2">{index + 1}.</span> {soal.pertanyaan}
                                </h4>
                                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                                    <span className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 border border-gray-200">
                                        Bobot: {soal.bobot_nilai} Poin
                                    </span>
                                    {soal.is_correct ? (
                                        <span className="flex items-center gap-1.5 text-green-700 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                            <FaCheckCircle /> Benar
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-red-700 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                            <FaTimesCircle /> Salah
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                    const optionKey = `pilihan_${opt.toLowerCase()}`;
                                    if (!soal[optionKey]) return null;

                                    let bgClass = "bg-gray-50 border-gray-200 text-gray-700";
                                    let borderClass = "border";
                                    let textClass = "";

                                    const isSelected = soal.jawaban_peserta === opt;
                                    const isCorrectAnswer = soal.jawaban_benar === opt || (soal.is_correct && isSelected);

                                    if (isSelected && soal.is_correct) {
                                        bgClass = "bg-green-50 text-green-800";
                                        borderClass = "border-2 border-green-400 shadow-sm";
                                    } else if (isSelected && !soal.is_correct) {
                                        bgClass = "bg-red-50 text-red-800";
                                        borderClass = "border-2 border-red-400 shadow-sm";
                                    } else if (isCorrectAnswer && !soal.is_correct) {
                                        bgClass = "bg-green-50/50 text-green-700";
                                        borderClass = "border-2 border-green-300 border-dashed";
                                    }

                                    return (
                                        <div key={opt} className={`p-4 rounded-xl flex items-start gap-4 transition-colors ${bgClass} ${borderClass}`}>
                                            <span className="font-extrabold min-w-6 w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm border text-sm shrink-0">{opt}</span>
                                            <span className={`flex-1 break-words ${textClass}`}>{soal[optionKey]}</span>

                                            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                                {isSelected && (
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${soal.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        Jawaban Peserta
                                                    </span>
                                                )}
                                                {isCorrectAnswer && !soal.is_correct && !isSelected && (
                                                    <span className="text-[10px] font-bold px-2.5 py-1 bg-green-100 rounded-md text-green-800 uppercase tracking-wider">
                                                        Kunci Jawaban
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
