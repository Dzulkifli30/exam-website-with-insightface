import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css';

import ProtectedRoute from "./pages/api/ProtectedRoute.jsx";
import AuthRedirect from "./pages/api/AuthRedirect.jsx";
import HomeRedirect from "./pages/api/HomeRedirect.jsx";

// Public pages
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';

// Peserta pages
import BiodataForm from './pages/BiodataForm.jsx';
import DashboardPeserta from './pages/peserta/Dashboard.jsx';
import Profil from './pages/peserta/Profil.jsx';
import UjianPeserta from './pages/peserta/UjianPeserta.jsx';
import AmbilGambar from './pages/peserta/AmbilGambar.jsx';
import MulaiUjian from './pages/peserta/MulaiUjian.jsx';
import ListUjian from './pages/peserta/ListUjian.jsx';
import SelesaiUjian from './pages/peserta/SelesaiUjian.jsx';

// Admin pages
import DashboardAdmin from './pages/admin/Dashboard.jsx';
import ListPeserta from './pages/admin/ListPeserta.jsx';
import DetailPeserta from './pages/admin/DetailPeserta.jsx';
import TableKemiripan from './pages/admin/TableKemiripan.jsx';
import DetailKemiripan from './pages/admin/DetailKemiripan.jsx';
import KemiripanEmbedding from './pages/admin/KemiripanEmbedding.jsx';
import KecuranganUjian from './pages/admin/KecuranganUjian.jsx';
import DetailKecurangan from './pages/admin/DetailKecurangan.jsx';
import ListUjianAdmin from './pages/admin/ListUjian.jsx';
import DetailUjianAdmin from './pages/admin/DetailUjian.jsx';
import TambahUjianAdmin from './pages/admin/TambahUjian.jsx';
import DetailUjianPeserta from './pages/admin/DetailUjianPeserta.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* --- Home Redirect berdasarkan role --- */}
        <Route path="/" element={<HomeRedirect />} />

        {/* --- Public (blokir jika sudah login) --- */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          }
        />

        {/* ------------------ PESERTA ROUTES ------------------ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['peserta']}>
              <DashboardPeserta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/biodata-form"
          element={
            <ProtectedRoute roles={['peserta']}>
              <BiodataForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['peserta']}>
              <Profil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ambil-gambar"
          element={
            <ProtectedRoute roles={['peserta']}>
              <AmbilGambar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ujian"
          element={
            <ProtectedRoute roles={['peserta']}>
              <UjianPeserta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mulai-ujian"
          element={
            <ProtectedRoute roles={['peserta']}>
              <MulaiUjian />
            </ProtectedRoute>
          }
        />

        <Route
          path="/list-ujian"
          element={
            <ProtectedRoute roles={['peserta']}>
              <ListUjian />
            </ProtectedRoute>
          }
        />

        <Route
          path="/selesai-ujian"
          element={
            <ProtectedRoute roles={['peserta']}>
              <SelesaiUjian />
            </ProtectedRoute>
          }
        />

        {/* ------------------ ADMIN ROUTES ------------------ */}

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/list-peserta"
          element={
            <ProtectedRoute roles={['admin']}>
              <ListPeserta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/detail-peserta/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <DetailPeserta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/detail-peserta/:peserta_id/ujian/:ujian_id"
          element={
            <ProtectedRoute roles={['admin']}>
              <DetailUjianPeserta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kemiripan"
          element={
            <ProtectedRoute roles={['admin']}>
              <TableKemiripan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/detail-kemiripan/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <DetailKemiripan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kemiripan-embedding"
          element={
            <ProtectedRoute roles={['admin']}>
              <KemiripanEmbedding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kecurangan/peserta/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <KecuranganUjian />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/detail-peserta/:peserta_id/ujian/:ujian_id/kecurangan"
          element={
            <ProtectedRoute roles={['admin']}>
              <DetailKecurangan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/list-ujian"
          element={
            <ProtectedRoute roles={['admin']}>
              <ListUjianAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/detail-ujian/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <DetailUjianAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tambah-ujian"
          element={
            <ProtectedRoute roles={['admin']}>
              <TambahUjianAdmin />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
