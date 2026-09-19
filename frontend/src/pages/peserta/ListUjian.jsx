import { useEffect, useState } from "react";
import PesertaLayout from "../layouts/PesertaLayout";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ListUjian() {
    const [ujianList, setUjianList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUjian = async () => {
            try {
                const res = await api.get("/ujian-fpc");
                // Menyesuaikan dengan format response laravel pagination atau data array
                const data = res.data.data ? res.data.data : res.data;
                setUjianList(data);
            } catch (error) {
                console.error("Gagal mengambil data ujian", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUjian();
    }, []);

    const navigate = useNavigate();

    const handleClick = (id, namaUjian) => {
        navigate(`/mulai-ujian`, { state: { id, namaUjian } });
    };

    return (
        <PesertaLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Daftar Ujian</h1>

                {loading ? (
                    <div className="text-center w-full py-10">Memuat data...</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {ujianList.map((ujian) => (
                            <button
                                key={ujian.id}
                                onClick={() => handleClick(ujian.id, ujian.nama_ujian)}
                                className="bg-white rounded-2xl shadow-sm text-left overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col h-full border border-gray-100 cursor-pointer"
                            >
                                {/* Bagian Atas */}
                                <div className="bg-himmel-primary w-full h-24 p-4 flex items-start justify-end relative overflow-hidden">
                                    {/* Dekorasi */}
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-md group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-md group-hover:scale-150 transition-transform duration-500"></div>

                                    <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full relative z-10 shadow-sm">
                                        {ujian.kode_ujian || "Ujian CBT"}
                                    </span>
                                </div>

                                {/* Bagian Bawah */}
                                <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-himmel-primary transition-colors">
                                            {ujian.nama_ujian}
                                        </h2>
                                    </div>

                                    <div className="mt-4 pt-4 border-gray-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Durasi</span>
                                            <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-himmel-belt" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                {ujian.durasi} Menit
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-himmel-primary flex items-center justify-center group-hover:bg-himmel-primary group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </PesertaLayout>
    );
}