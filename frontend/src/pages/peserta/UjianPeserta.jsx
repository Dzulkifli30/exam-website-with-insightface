import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PesertaLayout from "../layouts/PesertaLayout";
import api from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

export default function UjianPeserta() {
    const videoRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const ujianId = location.state?.id;
    const isSelesaiRef = useRef(false);

    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const answersRef = useRef({});
    const [similarity, setSimilarity] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ujianDetail, setUjianDetail] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (!ujianId) {
            alert("Tidak ada ujian yang dipilih!");
            navigate("/list-ujian");
            return;
        }

        const fetchUjian = async () => {
            try {
                const res = await api.get(`/ujian/${ujianId}`);
                const data = res.data.data ? res.data.data : res.data;

                setUjianDetail(data);

                const fetchedSoal = data.soal_ujians;
                setQuestions(fetchedSoal);

                const durasi = data.durasi;
                setTimeLeft(durasi * 60);

            } catch (err) {
                console.error("Gagal memuat ujian:", err);
                alert("Gagal memuat data ujian.");
                navigate("/list-ujian");
            } finally {
                setLoading(false);
            }
        };

        fetchUjian();
    }, [ujianId, navigate]);

    // Countdown Timer
    useEffect(() => {
        if (loading || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // auto submit saat waktu habis
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading]);

    // Setup Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Kamera tidak didukung. Pastikan menggunakan HTTPS atau localhost.");
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error akses kamera:", error);
                let pesanError = "Tidak dapat mengakses kamera!";
                
                if (error.name === "NotAllowedError") {
                    pesanError = "Izin akses kamera ditolak oleh pengguna/browser.";
                } else if (error.name === "NotFoundError") {
                    pesanError = "Tidak ada kamera yang ditemukan pada perangkat ini.";
                } else if (error.message) {
                    pesanError = error.message;
                }
                
                toast.error(pesanError, {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "colored"
                });
            }
        };

        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    // Proteksi Browser (Anti-Refresh, Anti-Back, Anti-F5)
    useEffect(() => {
        // 1. Jebakan Tombol Back (Kembali)
        window.history.pushState(null, null, window.location.href);
        const handlePopState = () => {
            // Jika user pencet back, paksa maju lagi ke halaman ini
            window.history.pushState(null, null, window.location.href);
            toast.warning("Anda tidak bisa kembali ke halaman sebelumnya selama ujian berlangsung!", {
                position: "top-center",
                autoClose: 500,
            });
        };

        // 2. Mencegat Tutup Tab atau Refresh (F5/Tombol Refresh Browser)
        const handleBeforeUnload = (e) => {
            if (!isSelesaiRef.current) {
                e.preventDefault();
                e.returnValue = ""; // Harus di-set begini agar pop-up bawaan browser muncul
            }
        };

        // 3. Blokir Shortcut Keyboard (F5 dan Ctrl+R)
        const handleKeyDown = (e) => {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.ctrlKey && e.key === "R")) {
                e.preventDefault(); // Matikan fungsi default
                toast.error("Tombol Refresh dinonaktifkan!", {
                    position: "top-center",
                    autoClose: 500,
                });
            }
        };

        // Pasang semua event listener
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("keydown", handleKeyDown);

        // Bersihkan event listener jika komponen dilepas
        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Auto verifikasi
    useEffect(() => {
        let isMounted = true;
        let timeoutId;
        
        // Catat waktu pertama kali komponen di-render
        const startTime = Date.now();
        const WINDOW_SIZE = 10000; // 1 blok = 10 detik (10.000 ms)

        const captureAndVerify = async () => {
            if (!videoRef.current || !videoRef.current.srcObject) return;

            try {
                const canvas = document.createElement("canvas");
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

                const blob = await new Promise((resolve) =>
                    canvas.toBlob(resolve, "image/jpeg")
                );

                if (!blob) return;

                const formData = new FormData();
                formData.append("ujian_id", ujianId);
                formData.append("foto_peserta", blob, "foto_peserta.jpg");

                const res = await api.post("/verifikasi-realtime", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const data = res.data;
                if (data.similarity !== undefined) {
                    setSimilarity(data.similarity);
                }

                if (data.status === "warning" || data.status === "error") {
                    const toastType = data.status === "warning" ? toast.warning : toast.error;
                    toastType(data.message || "Wajah tidak terdeteksi atau ada pelanggaran!", {
                        position: "top-center",
                        autoClose: 1000,
                        theme: "colored"
                    });
                }

                if (data.status === "ok") {
                    console.log(`${data.message}`, data);
                }
            } catch (err) {
                console.error("Auto Verify Error:", err);
            }
        };

        // Fungsi penjadwalan rekursif
        const scheduleNextCapture = (windowIndex) => {
            if (!isMounted) return;

            // 1. Tentukan kapan blok 30 detik ini dimulai secara absolut
            const windowStart = startTime + (windowIndex * WINDOW_SIZE);
            
            // 2. Pilih detik acak (0 sampai 29.999 ms) di dalam blok tersebut
            const randomOffset = Math.floor(Math.random() * WINDOW_SIZE);
            
            // 3. Tentukan target waktu eksekusi yang fix
            const targetTime = windowStart + randomOffset;
            
            // 4. Hitung berapa lama lagi kita harus menunggu dari detik ini
            const delay = targetTime - Date.now();

            // Jika delay negatif (misal proses API sebelumnya lambat atau user ganti tab),
            // abaikan blok ini dan langsung jadwalkan untuk blok 30 detik berikutnya.
            if (delay <= 0) {
                scheduleNextCapture(windowIndex + 1);
            } else {
                
                timeoutId = setTimeout(async () => {
                    if (!isMounted) return;
                    
                    await captureAndVerify();
                    
                    // Setelah selesai kirim API, panggil lagi fungsi ini untuk blok waktu selanjutnya
                    scheduleNextCapture(windowIndex + 1);
                }, delay);
            }
        };

        // Mulai penjadwalan dari blok waktu ke-0
        scheduleNextCapture(0);

        // Cleanup function kalau user pindah halaman / ujian selesai
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [ujianId]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleChange = (questionId, option) => {
        const newAnswers = {
            ...answers,
            [questionId]: option,
        };
        setAnswers(newAnswers);
        answersRef.current = newAnswers;
    };

    const handleSubmit = async (autoSubmit = false) => {
        // 1. Tampilkan konfirmasi atau peringatan berdasarkan pemicunya
        if (autoSubmit !== true) {
            // Jika user klik tombol "Selesai Ujian" secara manual
            const result = await Swal.fire({
                title: "Apakah Anda yakin?",
                text: "Pastikan semua soal telah terjawab sebelum menyelesaikan ujian.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Selesai Ujian",
                cancelButtonText: "Batal",
                reverseButtons: true,
            });

            if (!result.isConfirmed) {
                return;
            }
        } else {
            // Jika sistem yang memicu karena waktu habis (autoSubmit === true)
            await Swal.fire({
                title: "Waktu Habis!",
                text: "Waktu ujian Anda telah berakhir. Sistem akan mengumpulkan jawaban secara otomatis.",
                icon: "info",
                showConfirmButton: false,
                timer: 3000, // Tunggu 3 detik
                timerProgressBar: true, // Munculkan bar animasi hitung mundur di popup
                allowOutsideClick: false, // Cegah user menutup popup dengan klik di luar
                allowEscapeKey: false, // Cegah ditutup pakai tombol ESC
            });
        }

        // 2. Format jawaban untuk dikirim ke API
        const formattedAnswers = Object.entries(answersRef.current).map(([soal_id, jawaban]) => ({
            soal_ujian_id: isNaN(Number(soal_id)) ? soal_id : Number(soal_id),
            jawaban: jawaban
        }));

        console.log("Mengirim jawaban peserta:", formattedAnswers);

        // 3. Proses pengiriman ke Backend
        try {
            await api.post(`/ujian/${ujianId}/submit`, { jawaban: formattedAnswers });
            
            // Tampilkan notif "Berhasil" HANYA jika dikirim manual. 
            // Jika auto-submit, kita lewati notif ini supaya user tidak melihat 2 popup berturut-turut.
            if (!autoSubmit) {
                await Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Ujian selesai! Jawaban Anda telah disimpan.",
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        } catch (error) {
            console.error("Gagal mengirim jawaban:", error);
            await Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat mengirim jawaban.",
                showConfirmButton: false,
                timer: 3000,
            });
        }

        // 4. Matikan akses kamera
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
        
        // 5. Pindahkan ke halaman selesai
        isSelesaiRef.current = true;
        navigate("/selesai-ujian");
        // window.location.href = "/selesai-ujian";
    };

    const getPertanyaan = (q) => q.pertanyaan;
    const getOptions = (q) => {
        if (q.pilihan_a) {
            return {
                a: q.pilihan_a,
                b: q.pilihan_b,
                c: q.pilihan_c,
                d: q.pilihan_d,
                e: q.pilihan_e,
            };
        }
        return {};
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ToastContainer style={{ marginTop: "70px" }} />
            {/* Navbar */}
            <div className="w-full bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="text-xl font-bold w-1/3">
                    Waktu Tersisa:{" "}
                    <span className="text-red-600">{formatTime(timeLeft)}</span>
                </div>

                <div className="w-1/3 flex flex-col items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                        style={{ transform: "scaleX(-1)" }}
                    />
                    {/* {similarity !== null && (
                        <div className="text-xs font-semibold mt-1 text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                            Kemiripan: {similarity}
                        </div>
                    )} */}
                </div>

                <div className="w-1/3 flex justify-end">
                    {/* Tombol selesai ujian dihapus untuk menjaga kamera tetap di tengah */}
                </div>
            </div>

            {/* Soal */}
            <div className="mt-6 flex flex-col md:flex-row gap-6 p-6 min-h-[calc(100vh-100px)]">
                {/* Sidebar Navigasi Soal */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow-md sticky top-28">
                        <h3 className="font-semibold text-lg mb-4 text-center border-b pb-2">Navigasi Soal</h3>
                        <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
                            {questions.map((q, index) => {
                                const isAnswered = !!answers[q.id || index];
                                const isActive = currentQuestionIndex === index;

                                let btnClass = "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 ";
                                if (isActive) {
                                    btnClass += "bg-himmel-aura text-white shadow-md ring-2 ring-himmel-aura ring-offset-1";
                                } else if (isAnswered) {
                                    btnClass += "bg-himmel-primary text-white hover:bg-opacity-90";
                                } else {
                                    btnClass += "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
                                }

                                return (
                                    <button
                                        key={q.id || index}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={btnClass}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Area Soal (Main Content) */}
                <div className="w-full md:w-3/4">
                    {loading ? (
                        <div className="text-center py-10 bg-white shadow-md rounded-lg">Memuat soal ujian...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-white shadow-md rounded-lg">Tidak ada soal untuk ujian ini.</div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg p-6 min-h-[450px] flex flex-col justify-between">
                            <div>
                                <h2 className="font-semibold mb-6 text-xl leading-relaxed text-gray-800">
                                    <span className="mr-2">{currentQuestionIndex + 1}.</span>
                                    {getPertanyaan(questions[currentQuestionIndex])}
                                </h2>

                                <div className="space-y-3">
                                    {Object.entries(getOptions(questions[currentQuestionIndex]))
                                        .filter(([_, value]) => value)
                                        .map(([key, value]) => {
                                            const questionId = questions[currentQuestionIndex].id || currentQuestionIndex;
                                            const isSelected = answers[questionId] === key;

                                            return (
                                                <label
                                                    key={key}
                                                    className={`flex items-center space-x-3 cursor-pointer p-4 rounded-lg border transition-all duration-200 ${isSelected
                                                        ? 'bg-blue-50 border-himmel-primary text-himmel-primary shadow-sm'
                                                        : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${questionId}`}
                                                        value={key}
                                                        checked={isSelected}
                                                        onChange={() => handleChange(questionId, key)}
                                                        className="w-4 h-4 text-himmel-primary border-gray-300 focus:ring-himmel-primary"
                                                    />
                                                    <span className="flex-1">
                                                        <span className="font-bold mr-3 text-lg uppercase">{key}.</span>
                                                        <span className="text-base">{value}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center ${currentQuestionIndex === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Sebelumnya
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm shadow-red-200"
                                    >
                                        Selesai Ujian
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        className="px-5 py-2.5 rounded-lg font-medium bg-himmel-primary text-white hover:opacity-90 transition-all shadow-sm flex items-center"
                                    >
                                        Selanjutnya
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}