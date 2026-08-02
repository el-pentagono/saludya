import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireRole } from './components/RequireRole';
import { AuthProvider } from './context/AuthContext';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { TreatmentFollowUpDetailPage } from './pages/enfermero/TreatmentFollowUpDetailPage';
import { TreatmentFollowUpsPage } from './pages/enfermero/TreatmentFollowUpsPage';
import { TriagePage } from './pages/enfermero/TriagePage';
import { LoginPage } from './pages/LoginPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { AgendaPage } from './pages/medico/AgendaPage';
import { PatientRecordPage } from './pages/medico/PatientRecordPage';
import { PrescribePage } from './pages/medico/PrescribePage';
import { TreatmentsPage } from './pages/medico/TreatmentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/perfil" element={<ProfilePage />} />

              <Route element={<RequireRole roles={['paciente']} />}>
                <Route path="/turnos" element={<AppointmentsPage />} />
                <Route path="/historia-clinica" element={<MedicalRecordsPage />} />
                <Route path="/documentos" element={<DocumentsPage />} />
              </Route>

              <Route element={<RequireRole roles={['medico']} />}>
                <Route path="/medico/agenda" element={<AgendaPage />} />
                <Route path="/medico/tratamientos" element={<TreatmentsPage />} />
                <Route
                  path="/medico/pacientes/:pacienteId/historia-clinica"
                  element={<PatientRecordPage />}
                />
                <Route
                  path="/medico/pacientes/:pacienteId/prescribir"
                  element={<PrescribePage />}
                />
              </Route>

              <Route element={<RequireRole roles={['enfermero']} />}>
                <Route path="/enfermero/triaje" element={<TriagePage />} />
                <Route path="/enfermero/tratamientos" element={<TreatmentFollowUpsPage />} />
                <Route
                  path="/enfermero/tratamientos/:treatmentId"
                  element={<TreatmentFollowUpDetailPage />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
