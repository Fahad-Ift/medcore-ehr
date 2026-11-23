import { useEffect, useState } from 'react';
import {
  Activity,
  Stethoscope,
  LogOut,
  CheckCircle2,
  ClipboardList,
  Pill,
  FlaskConical,
  Info
} from 'lucide-react';
import API from '../api';

export default function DoctorDashboard({ user, onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    diagnosis_code: 'J06.9',
    diagnosis_title: '',
    doctor_notes: '',
    bp: '120/80',
    temp_f: '98.6',
    pulse: '76',
    medicine_name: '',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration_days: 5,
    lab_test: ''
  });

  const loadSchedule = async () => {
    try {
      const res = await API.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = {
        appointment_id: selectedAppt.appointment_id,
        diagnosis_code: form.diagnosis_code,
        diagnosis_title: form.diagnosis_title,
        doctor_notes: form.doctor_notes,
        vitals: {
          bp: form.bp,
          temp_f: Number(form.temp_f),
          pulse: Number(form.pulse)
        },
        medicines: form.medicine_name
          ? [
              {
                medicine_name: form.medicine_name,
                dosage: form.dosage,
                frequency: form.frequency,
                duration_days: Number(form.duration_days)
              }
            ]
          : [],
        lab_tests: form.lab_test ? [{ test_type: form.lab_test, priority: 'URGENT' }] : []
      };

      await API.post('/records/consult', payload);
      setStatusMsg({
        type: 'success',
        text: 'Consultation saved! Medical record, prescription, and lab order have been synced to the patient portal.'
      });
      setSelectedAppt(null);
      setForm({
        ...form,
        diagnosis_title: '',
        doctor_notes: '',
        medicine_name: '',
        lab_test: ''
      });
      loadSchedule();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error saving consultation'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-[#122056]">
      {/* Pure White Top Navigation Bar */}
      <header className="bg-white border-b border-[#EEEFFD] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5B65DC] rounded-xl text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#122056]">MedCore Physician Workspace</h1>
              <p className="text-xs text-[#122056]/65">Logged in as {user.name}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEEFFD] hover:bg-[#5B65DC] text-[#122056] hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Physician Banner with Portrait & How-To Guide */}
        <section className="bg-[#122056] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&q=80"
              alt="Physician Profile"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#5B65DC] shrink-0"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#5B65DC] text-white text-xs font-bold mb-1">
                Clinical Consultation Desk
              </span>
              <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
              <p className="text-xs text-[#EEEFFD]/80 mt-0.5">
                Step 1: Click <strong>Start Consult</strong> on any scheduled patient below. Step 2: Enter vitals, diagnosis, prescription, or lab orders and click Save.
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-xs text-[#EEEFFD] shrink-0">
            <p className="font-bold">Atomic Record Sync</p>
            <p className="text-[#EEEFFD]/75 mt-0.5">
              Saving a consultation updates the patient&apos;s wallet and dispatches lab tests in one transaction.
            </p>
          </div>
        </section>

        {statusMsg.text && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border ${
              statusMsg.type === 'success'
                ? 'bg-[#EEEFFD] border-[#5B65DC] text-[#122056]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Patient Appointments Queue (5 cols) */}
          <section className="lg:col-span-5 bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs h-fit">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#122056] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#5B65DC]" /> Patient Queue
              </h2>
              <p className="text-xs text-[#122056]/65 mt-0.5">
                Select a scheduled patient to open their clinical chart.
              </p>
            </div>

            <div className="space-y-3">
              {appointments.map((appt) => {
                const isSelected = selectedAppt?.appointment_id === appt.appointment_id;
                return (
                  <div
                    key={appt.appointment_id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#EEEFFD]/70 border-[#5B65DC]'
                        : 'bg-[#FAFAFD] border-[#EEEFFD]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#122056] truncate">
                          {appt.patient_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                          {appt.blood_group}
                        </span>
                      </div>
                      <p className="text-xs text-[#122056]/70 mt-1">
                        {new Date(appt.slot_date).toLocaleDateString()} • {appt.slot_time}
                      </p>
                      <p className="text-xs text-[#5B65DC] font-medium mt-0.5 truncate">
                        Reason: {appt.reason}
                      </p>
                    </div>

                    {appt.status === 'SCHEDULED' ? (
                      <button
                        onClick={() => setSelectedAppt(appt)}
                        className="px-3.5 py-2 rounded-xl bg-[#5B65DC] hover:bg-[#4953c7] text-white text-xs font-semibold shrink-0 transition cursor-pointer"
                      >
                        Start Consult
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                );
              })}

              {appointments.length === 0 && (
                <p className="text-sm text-[#122056]/60 py-4 text-center">
                  No appointments assigned to your schedule yet.
                </p>
              )}
            </div>
          </section>

          {/* Right Column: Guided Consultation Form (7 cols) */}
          <section className="lg:col-span-7 bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs">
            <div className="border-b border-[#EEEFFD] pb-4 mb-5">
              <h2 className="text-base font-bold text-[#122056] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#5B65DC]" />
                {selectedAppt
                  ? `Clinical Consultation: ${selectedAppt.patient_name}`
                  : 'Clinical Consultation Chart'}
              </h2>
              <p className="text-xs text-[#122056]/65 mt-0.5">
                {selectedAppt
                  ? `Blood Group: ${selectedAppt.blood_group} • Visit Reason: ${selectedAppt.reason}`
                  : 'Click "Start Consult" on any scheduled patient on the left to begin.'}
              </p>
            </div>

            {selectedAppt ? (
              <form onSubmit={handleConsultSubmit} className="space-y-5">
                {/* Section 1: Diagnosis & Vitals */}
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B65DC]">
                    1. Diagnosis &amp; Patient Vitals
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        ICD-10 Code
                      </label>
                      <input
                        value={form.diagnosis_code}
                        onChange={(e) => setForm({ ...form, diagnosis_code: e.target.value })}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Diagnosis Title
                      </label>
                      <input
                        placeholder="e.g. Acute Viral Pharyngitis"
                        value={form.diagnosis_title}
                        onChange={(e) => setForm({ ...form, diagnosis_title: e.target.value })}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Blood Pressure
                      </label>
                      <input
                        value={form.bp}
                        onChange={(e) => setForm({ ...form, bp: e.target.value })}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Temp (°F)
                      </label>
                      <input
                        value={form.temp_f}
                        onChange={(e) => setForm({ ...form, temp_f: e.target.value })}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Pulse (bpm)
                      </label>
                      <input
                        value={form.pulse}
                        onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#122056] mb-1">
                      Doctor Observation &amp; Care Notes
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Write clinical findings and recovery instructions..."
                      value={form.doctor_notes}
                      onChange={(e) => setForm({ ...form, doctor_notes: e.target.value })}
                      className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Digital Prescription */}
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B65DC] flex items-center gap-1.5">
                    <Pill className="w-4 h-4" /> 2. Digital Prescription (Optional)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Medicine Name (e.g. Augmentin)"
                      value={form.medicine_name}
                      onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                      className="bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                    />
                    <input
                      placeholder="Dosage (e.g. 625mg)"
                      value={form.dosage}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      className="bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                    />
                    <input
                      placeholder="Frequency (e.g. Twice daily)"
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                    />
                    <input
                      type="number"
                      placeholder="Duration (Days)"
                      value={form.duration_days}
                      onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                      className="bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                    />
                  </div>
                </div>

                {/* Section 3: Order Diagnostic Lab Test */}
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B65DC] flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" /> 3. Order Diagnostic Lab Test (Optional)
                  </p>
                  <input
                    placeholder="e.g. Complete Blood Count (CBC) or Lipid Profile"
                    value={form.lab_test}
                    onChange={(e) => setForm({ ...form, lab_test: e.target.value })}
                    className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#5B65DC] hover:bg-[#4953c7] text-white rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer"
                >
                  Save Medical Record &amp; Complete Consultation
                </button>
              </form>
            ) : (
              <div className="bg-[#EEEFFD]/50 border border-[#EEEFFD] rounded-2xl p-8 text-center space-y-2">
                <Info className="w-7 h-7 text-[#5B65DC] mx-auto" />
                <p className="text-sm font-bold text-[#122056]">No Patient Selected Yet</p>
                <p className="text-xs text-[#122056]/70 max-w-md mx-auto leading-relaxed">
                  Click <strong>Start Consult</strong> next to any scheduled patient in the queue on the left to enter vitals, diagnosis, prescriptions, and lab requests.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}