import React, {useState, useEffect,} from "react";
import PesertaLayout from "../layouts/PesertaLayout";
import api from "../api/api";

export default function Dashboard() {
    const [userName, setUserName] = useState("Peserta");

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const res = await api.get("/user");
                if (res.data?.peserta?.name) {
                    setUserName(res.data.peserta.name);
                }
            } catch (error) {
                console.error("Error fetching user name:", error);
            }
        };

        fetchUserName();
    }, []);

    return (
        <PesertaLayout>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Selamat Datang, {userName} 👋
                </h2>
                <p className="text-gray-600 mb-6">
                    Ini adalah halaman dashboard peserta. Silakan pilih menu di
                    sidebar untuk melanjutkan.
                </p>

                {/* Contoh card informasi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Profil
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Lengkapi data pribadi Anda di menu Profil.
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Ujian
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Akses jadwal dan soal ujian di menu Ujian.
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Hasil
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Lihat hasil ujian Anda di menu Hasil.
                        </p>
                    </div>
                </div>
            </div>
        </PesertaLayout>
    );
}
