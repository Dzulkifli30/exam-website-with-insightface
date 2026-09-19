import { useEffect, useRef, useState } from "react";
import PesertaLayout from "../layouts/PesertaLayout";
import { useNavigate, useLocation } from "react-router-dom";
import api, { API_URL_BASE } from "../api/api";

export default function MulaiUjian() {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id;
    const namaUjian = location.state?.namaUjian;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;
            } catch (error) {
                alert("Tidak dapat mengakses kamera!");
            }
        };

        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const handleVerifikasi = async () => {
        setLoading(true);

        try {
            // Capture frame
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

            const blob = await new Promise(resolve =>
                canvas.toBlob(resolve, "image/jpeg")
            );

            const formData = new FormData();
            formData.append("image", blob);

            const res = await api.post("/verifikasi-ujian", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(res.data);
            const data = res.data;

            if (data.status === "success") {
                navigate("/ujian", { state: { id } });
            } else {
                alert("Verifikasi gagal. Pastikan wajah menghadap ke depan.");
            }
        } catch (err) {
            console.error("Verify Error:", err);
            alert("Terjadi kesalahan.");
        }

        setLoading(false);
    };

    return (
        <PesertaLayout>
            <div className="flex flex-col items-center justify-center py-10">
                <h1 className="text-3xl font-semibold mb-6">
                    Halaman Mulai Ujian - {namaUjian}
                </h1>

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-72 h-56 rounded-lg shadow-md bg-black object-cover mb-6"
                />

                <button
                    onClick={handleVerifikasi}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                    {loading ? "Memverifikasi..." : "Mulai Ujian"}
                </button>
            </div>
        </PesertaLayout>
    );
}