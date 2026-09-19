import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/api";
import { FaArrowLeft } from "react-icons/fa";

export default function DetailUjian() {
    const { id } = useParams();
    const [ujian, setUjian] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/ujian/${id}`);
                setUjian(res.data.data || res.data);
            } catch (error) {
                console.error("Gagal mengambil detail ujian:", error);
            }
        };
        fetchDetail();
    }, [id]);

    if (!ujian) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-10 font-bold text-gray-500">Mencari Data...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4 py-5">
                    <Link to="/admin/list-ujian" className="text-gray-600 hover:text-gray-800">
                        <FaArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Detail Ujian</h1>
                </div>

                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="block text-sm text-gray-500">Nama Ujian</span>
                            <span className="font-semibold text-lg">{ujian.nama_ujian}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Kode Ujian</span>
                            <span className="font-semibold text-lg">{ujian.kode_ujian}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Durasi</span>
                            <span className="font-semibold text-lg">{ujian.durasi} Menit</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Deskripsi</span>
                            <span className="font-semibold text-lg">{ujian.deskripsi || "-"}</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold mt-8 mb-4">Daftar Soal</h2>
                
                {ujian.soal_ujians && ujian.soal_ujians.length > 0 ? (
                    <div className="space-y-6">
                        {ujian.soal_ujians.map((soal, index) => (
                            <div key={soal.id || index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-lg">Soal {index + 1}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        Bobot: {soal.bobot_nilai}
                                    </span>
                                </div>
                                <p className="mb-4 text-gray-800 font-medium">{soal.pertanyaan}</p>
                                
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D', 'E'].map((pilihan) => {
                                        const value = soal[`pilihan_${pilihan.toLowerCase()}`];
                                        if (!value) return null;
                                        
                                        const isCorrect = soal.jawaban_benar.toUpperCase() === pilihan;
                                        
                                        return (
                                            <div 
                                                key={pilihan} 
                                                className={`p-3 rounded border flex items-center ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <span className="font-bold mr-3 w-6">{pilihan}.</span>
                                                <span className="flex-1">{value}</span>
                                                {isCorrect && <span className="ml-2 text-green-600 font-bold text-sm bg-green-100 px-2 rounded">(Jawaban Benar)</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                        Tidak ada soal untuk ujian ini.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
