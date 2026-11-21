import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AppointmentModal } from './components/AppointmentModal';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { Dashboard7DayView } from './components/Dashboard7DayView';
import { DoctorsView } from './components/DoctorsView';
import {
  DoctorModal,
  PatientModal,
  ServiceModal,
} from './components/EntityModals';
import { PatientsView } from './components/PatientsView';
import { ServicesView } from './components/ServicesView';
import {
  Appointment,
  AppointmentStatus,
  ClinicData,
  DOCTOR_COLORS,
  Doctor,
  Patient,
  ServiceType,
  TabKey,
} from './types';
import { ymd } from './utils/date';
import { loadClinicData, saveClinicData } from './utils/storage';

const NAV_TABS: { key: TabKey; label: string }[] = [
  { key: 'cal', label: 'ตารางนัดหมาย' },
  { key: 'dash', label: 'แดชบอร์ด 7 วัน' },
  { key: 'pat', label: 'ผู้ป่วย' },
  { key: 'ther', label: 'หมอแพทย์แผนไทย' },
  { key: 'svc', label: 'ประเภทบริการ' },
];

export default function App() {
  const [data, setData] = useState<ClinicData>(() => loadClinicData());
  const [activeTab, setActiveTab] = useState<TabKey>('cal');
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => ymd(new Date()));

  // Appointment Modal state
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [apptDefaultDate, setApptDefaultDate] = useState<string>(() =>
    ymd(new Date())
  );
  const [apptDefaultPid, setApptDefaultPid] = useState<string | undefined>(
    undefined
  );

  // Patient Modal state
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Doctor Modal state
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(
    null
  );

  useEffect(() => {
    saveClinicData(data);
  }, [data]);

  const openNewAppt = (dateStr?: string, pid?: string) => {
    setEditingAppt(null);
    setApptDefaultDate(dateStr || selectedDate);
    setApptDefaultPid(pid);
    setApptModalOpen(true);
  };

  const openEditAppt = (appt: Appointment) => {
    setEditingAppt(appt);
    setApptDefaultDate(appt.date);
    setApptDefaultPid(undefined);
    setApptModalOpen(true);
  };

  const handleSaveAppt = (appt: Appointment, newPatient?: Patient) => {
    setData((prev) => {
      const patients = newPatient
        ? [...prev.patients, newPatient]
        : prev.patients;
      const exists = prev.appts.some((a) => a.id === appt.id);
      const appts = exists
        ? prev.appts.map((a) => (a.id === appt.id ? appt : a))
        : [...prev.appts, appt];
      return { ...prev, patients, appts };
    });

    setSelectedDate(appt.date);
    const d = new Date(`${appt.date}T00:00:00`);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setApptModalOpen(false);
  };

  const handleDeleteAppt = (apptId: string) => {
    setData((prev) => ({
      ...prev,
      appts: prev.appts.filter((a) => a.id !== apptId),
    }));
    setApptModalOpen(false);
  };

  const handleQuickStatusChange = (
    apptId: string,
    status: AppointmentStatus
  ) => {
    setData((prev) => ({
      ...prev,
      appts: prev.appts.map((a) => (a.id === apptId ? { ...a, status } : a)),
    }));
  };

  const handleSavePatient = (patient: Patient) => {
    setData((prev) => {
      const exists = prev.patients.some((p) => p.id === patient.id);
      const patients = exists
        ? prev.patients.map((p) => (p.id === patient.id ? patient : p))
        : [...prev.patients, patient];
      return { ...prev, patients };
    });
    setPatientModalOpen(false);
  };

  const handleDeletePatient = (id: string) => {
    setData((prev) => ({
      ...prev,
      patients: prev.patients.filter((p) => p.id !== id),
    }));
    setPatientModalOpen(false);
  };

  const handleSaveDoctor = (doctor: Doctor) => {
    setData((prev) => {
      const exists = prev.therapists.some((t) => t.id === doctor.id);
      const therapists = exists
        ? prev.therapists.map((t) => (t.id === doctor.id ? doctor : t))
        : [...prev.therapists, doctor];
      return { ...prev, therapists };
    });
    setDoctorModalOpen(false);
  };

  const handleDeleteDoctor = (id: string) => {
    setData((prev) => ({
      ...prev,
      therapists: prev.therapists.filter((t) => t.id !== id),
    }));
    setDoctorModalOpen(false);
  };

  const handleSaveService = (svc: ServiceType) => {
    setData((prev) => {
      const exists = prev.services.some((s) => s.id === svc.id);
      const services = exists
        ? prev.services.map((s) => (s.id === svc.id ? svc : s))
        : [...prev.services, svc];
      return { ...prev, services };
    });
    setServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    setServiceModalOpen(false);
  };

  const handleJumpToDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const d = new Date(`${dateStr}T00:00:00`);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setActiveTab('cal');
  };

  const nextDefaultDoctorColor =
    DOCTOR_COLORS[data.therapists.length % DOCTOR_COLORS.length].hex;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      {/* Clean 3-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('cal')}
            className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            คลินิกแพทย์แผนไทย
          </button>

          <nav
            aria-label="เมนูหลัก"
            className="hidden lg:flex items-center gap-6 overflow-x-auto"
          >
            {NAV_TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 text-base font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'text-blue-700 border-blue-700'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => openNewAppt(selectedDate)}
              className="inline-flex items-center gap-1.5 h-11 px-4 sm:px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold whitespace-nowrap shrink-0"
            >
              <Plus className="w-5 h-5" />
              เพิ่มนัดหมาย
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Nav Row */}
        <nav
          aria-label="เมนูหลักมือถือ"
          className="lg:hidden border-t border-slate-100 px-4 flex items-center gap-4 overflow-x-auto"
        >
          {NAV_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 text-base font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  active
                    ? 'text-blue-700 border-blue-700'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6 pb-16">
        {activeTab === 'cal' && (
          <CalendarScheduleView
            data={data}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onChangeMonth={setCurrentMonth}
            onSelectDate={setSelectedDate}
            onAddAppt={(d) => openNewAppt(d)}
            onEditAppt={openEditAppt}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {activeTab === 'dash' && (
          <Dashboard7DayView data={data} onJumpToDate={handleJumpToDate} />
        )}

        {activeTab === 'pat' && (
          <PatientsView
            data={data}
            onAddPatient={() => {
              setEditingPatient(null);
              setPatientModalOpen(true);
            }}
            onEditPatient={(p) => {
              setEditingPatient(p);
              setPatientModalOpen(true);
            }}
            onBookPatient={(p) => openNewAppt(selectedDate, p.id)}
          />
        )}

        {activeTab === 'ther' && (
          <DoctorsView
            data={data}
            currentMonth={currentMonth}
            onAddDoctor={() => {
              setEditingDoctor(null);
              setDoctorModalOpen(true);
            }}
            onEditDoctor={(doc) => {
              setEditingDoctor(doc);
              setDoctorModalOpen(true);
            }}
          />
        )}

        {activeTab === 'svc' && (
          <ServicesView
            data={data}
            onAddService={() => {
              setEditingService(null);
              setServiceModalOpen(true);
            }}
            onEditService={(svc) => {
              setEditingService(svc);
              setServiceModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AppointmentModal
        open={apptModalOpen}
        data={data}
        editingAppt={editingAppt}
        defaultDate={apptDefaultDate}
        defaultPatientId={apptDefaultPid}
        onClose={() => setApptModalOpen(false)}
        onSave={handleSaveAppt}
        onDelete={handleDeleteAppt}
      />

      <PatientModal
        open={patientModalOpen}
        editingPatient={editingPatient}
        onClose={() => setPatientModalOpen(false)}
        onSave={handleSavePatient}
        onDelete={handleDeletePatient}
      />

      <DoctorModal
        open={doctorModalOpen}
        editingDoctor={editingDoctor}
        defaultColor={nextDefaultDoctorColor}
        onClose={() => setDoctorModalOpen(false)}
        onSave={handleSaveDoctor}
        onDelete={handleDeleteDoctor}
      />

      <ServiceModal
        open={serviceModalOpen}
        editingService={editingService}
        onClose={() => setServiceModalOpen(false)}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
      />
    </div>
  );
}
