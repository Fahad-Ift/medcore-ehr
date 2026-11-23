import { useEffect, useState } from 'react';
import { Stethoscope, LogOut, CheckCircle2 } from 'lucide-react';
import API from '../api';

export default function DoctorDashboard({ user, onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

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
    setStatusMsg('');
    try {
      const payload = {
        appointment_id: selectedAppt.appointment_id,
        diagnosis_code: form.diagnosis_code,
        diagnosis_title: form.diagnosis_title,
        doctor_notes: form.doctor_notes,
        vitals: { bp: form.bp, temp_f: Number(form.temp_f), pulse: Number(form.pulse) },
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
      setStatusMsg('Consultation saved! Appointment marked COMPLETED via SQL trigger.');
      setSelectedAppt(null);
      setForm({ ...form, diagnosis_title: '', doctor_notes: '', medicine_name: '', lab_test: '' });
      loadSchedule();
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Error saving consultation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-sky-400">MedCore EHR • Doctor Workspace</h1>
          <p className="text-xs text-slate-400">Logged in as {user.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Queue */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-sky-300">
            <Stethoscope className="w-5 h-5" /> Patient Appointments
          </h2>

          {statusMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm">
              {statusMsg}
            </div>
          )}

          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.appointment_id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-sm">
                    {appt.patient_name}{' '}
                    <span className="text-xs text-rose-400 ml-1">({appt.blood_group})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(appt.slot_date).toLocaleDateString()} at {appt.slot_time} • {appt.reason}
                  </p>
                </div>

                {appt.status === 'SCHEDULED' ? (
                  <button
                    onClick={() => setSelectedAppt(appt)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold cursor-pointer"
                  >
                    Consult
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Consultation Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 text-teal-300">
            {selectedAppt ? `Consulting: ${selectedAppt.patient_name}` : 'Select a Scheduled Patient'}
          </h2>

          {selectedAppt ? (
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ICD-10 Code</label>
                  <input
                    value={form.diagnosis_code}
                    onChange={(e) => setForm({ ...form, diagnosis_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Diagnosis Title</label>
                  <input
                    placeholder="e.g. Acute Upper Respiratory Infection"
                    value={form.diagnosis_title}
                    onChange={(e) => setForm({ ...form, diagnosis_title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">BP (JSON)</label>
                  <input
                    value={form.bp}
                    onChange={(e) => setForm({ ...form, bp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Temp °F (JSON)</label>
                  <input
                    value={form.temp_f}
                    onChange={(e) => setForm({ ...form, temp_f: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pulse (JSON)</label>
                  <input
                    value={form.pulse}
                    onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Clinical Notes</label>
                <textarea
                  rows="2"
                  placeholder="Observation & advice..."
                  value={form.doctor_notes}
                  onChange={(e) => setForm({ ...form, doctor_notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-xs font-semibold text-teal-400 mb-2">Prescribe Medicine (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Medicine Name (e.g. Augmentin)"
                    value={form.medicine_name}
                    onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Dosage (e.g. 625mg)"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-xs font-semibold text-amber-400 mb-2">Order Lab Test (Optional)</p>
                <input
                  placeholder="e.g. Lipid Profile or Complete Blood Count (CBC)"
                  value={form.lab_test}
                  onChange={(e) => setForm({ ...form, lab_test: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-sm cursor-pointer"
              >
                Save Medical Record & Prescription
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">
              Click <strong>Consult</strong> next to any scheduled patient on the left to record vitals, diagnosis, prescriptions, and lab orders.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}