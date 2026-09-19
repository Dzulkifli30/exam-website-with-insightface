import { useNavigate } from "react-router-dom";
import PesertaLayout from "../layouts/PesertaLayout";
import qrCode from "../../assets/qr-fpc.png";

export default function SelesaiUjian() {
    const navigate = useNavigate();

    return (
        <PesertaLayout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border border-gray-100">
                    {/* Icon Success */}
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                        <svg
                            className="h-12 w-12 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Ujian Selesai!
                    </h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        Terima kasih telah menyelesaikan Tes ini. Jawaban Anda
                        telah berhasil disimpan. silahkan scan qr berikut untuk mengisi data anda jika ingin mendapatkan hadiah.
                    </p>
                    <div className="flex justify-center mb-8">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>

                    {/* <button
                        onClick={() => navigate("/list-ujian")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                    >
                        Kembali ke Halaman List Ujian
                    </button> */}
                </div>
            </div>
        </PesertaLayout>
    );
}