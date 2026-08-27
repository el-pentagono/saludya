import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireRole } from './components/RequireRole';
import { AuthProvider } from './context/AuthContext';
import { AmbientAiPage as AdminAmbientAiPage } from './pages/admin/AmbientAiPage';
import { BovedaPage as AdminBovedaPage } from './pages/admin/BovedaPage';
import { DocumentosPage as AdminDocumentosPage } from './pages/admin/DocumentosPage';
import { HistoriaClinicaPage as AdminHistoriaClinicaPage } from './pages/admin/HistoriaClinicaPage';
import { ResumenPage } from './pages/admin/ResumenPage';
import { TratamientosPage as AdminTratamientosPage } from './pages/admin/TratamientosPage';
import { TriagePage as AdminTriagePage } from './pages/admin/TriagePage';
import { TurnosPage as AdminTurnosPage } from './pages/admin/TurnosPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { BovedaSaludMentalPage } from './pages/BovedaSaludMentalPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { TreatmentFollowUpDetailPage } from './pages/enfermero/TreatmentFollowUpDetailPage';
import { TreatmentFollowUpsPage } from './pages/enfermero/TreatmentFollowUpsPage';
import { TriagePage } from './pages/enfermero/TriagePage';
import { DispensingPage } from './pages/farmaceutico/DispensingPage';
import { LoginPage } from './pages/LoginPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { AgendaPage } from './pages/medico/AgendaPage';
import { AmbientAiPage } from './pages/medico/AmbientAiPage';
import { BovedaCreatePage } from './pages/medico/BovedaCreatePage';
import { BovedaListPage } from './pages/medico/BovedaListPage';
import { MedicoTriagePage } from './pages/medico/MedicoTriagePage';
import { PatientRecordPage } from './pages/medico/PatientRecordPage';
import { PrescribePage } from './pages/medico/PrescribePage';
import { StudyOrdersPage } from './pages/medico/StudyOrdersPage';
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
                <Route path="/recetas" element={<PrescriptionsPage />} />
                <Route path="/historia-clinica" element={<MedicalRecordsPage />} />
                <Route path="/documentos" element={<DocumentsPage />} />
                <Route path="/boveda-salud-mental" element={<BovedaSaludMentalPage />} />
              </Route>

              <Route element={<RequireRole roles={['medico']} />}>
                <Route path="/medico/agenda" element={<AgendaPage />} />
                <Route path="/medico/estudios" element={<StudyOrdersPage />} />
                <Route path="/medico/triaje" element={<MedicoTriagePage />} />
                <Route path="/medico/tratamientos" element={<TreatmentsPage />} />
                <Route path="/medico/boveda-salud-mental" element={<BovedaListPage />} />
                <Route
                  path="/medico/pacientes/:pacienteId/historia-clinica"
                  element={<PatientRecordPage />}
                />
                <Route
                  path="/medico/pacientes/:pacienteId/prescribir"
                  element={<PrescribePage />}
                />
                <Route
                  path="/medico/pacientes/:pacienteId/boveda-salud-mental"
                  element={<BovedaCreatePage />}
                />
                <Route
                  path="/medico/turnos/:appointmentId/transcripcion"
                  element={<AmbientAiPage />}
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

              <Route element={<RequireRole roles={['farmaceutico']} />}>
                <Route path="/farmaceutico/dispensacion" element={<DispensingPage />} />
              </Route>

              <Route element={<RequireRole roles={['director', 'auditor']} />}>
                <Route path="/admin/resumen" element={<ResumenPage />} />
                <Route path="/admin/usuarios" element={<UsersPage />} />
                <Route path="/admin/turnos" element={<AdminTurnosPage />} />
                <Route path="/admin/tratamientos" element={<AdminTratamientosPage />} />
                <Route path="/admin/documentos" element={<AdminDocumentosPage />} />
                <Route path="/admin/triaje" element={<AdminTriagePage />} />
                <Route path="/admin/historia-clinica" element={<AdminHistoriaClinicaPage />} />
                <Route path="/admin/boveda-salud-mental" element={<AdminBovedaPage />} />
                <Route path="/admin/ambient-ai" element={<AdminAmbientAiPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
