import { useEffect, useState } from 'react';
import { Calendar, FileText, FlaskConical, ShieldAlert, LogOut, PlusCircle } from 'lucide-react';
import API from '../api';

export default function PatientDashboard({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [booking, setBooking] = useState({
    doctor_id: '',
    slot_date: new Date().toISOString().split('T')[0],
    slot_time: '10:00:00',
    reason: ''
  });

  const loadData = async () => {
    try {
      const [docRes, apptRes, recRes] = await Promise.all([
        API.get('/appointments/doctors'),
        API.get('/appointments/my'),
        API.get('/records/patient')
      ]);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
      setRecords(recRes.data.records);
      setAuditLogs(recRes.data.auditLogs);
      if (docRes.data.length > 0 && !booking.doctor_id) {
        setBooking((prev) => ({ ...prev, doctor_id: docRes.data[0].doctor_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const res = await API.post('/appointments', booking);
      setMessage({ type: 'success', text: res.data.message });
      setBooking({ ...booking, reason: '' });
      loadData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Booking failed'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-teal-400">MedCore EHR • Patient Portal</h1>
          <p className="text-xs text-slate-400">Welcome back, {user.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Book Appointment Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-teal-300">
            <PlusCircle className="w-5 h-5" /> Book New Appointment
          </h2>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/40 text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={booking.doctor_id}
              onChange={(e) => setBooking({ ...booking, doctor_id: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              required
            >
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.full_name} ({d.specialization})
                </option>
              ))}
            </select>

            <input
              type="date"
              value={booking.slot_date}
              onChange={(e) => setBooking({ ...booking, slot_date: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              required
            />

            <select
              value={booking.slot_time}
              onChange={(e) => setBooking({ ...booking, slot_time: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            >
              <option value="09:00:00">09:00 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="11:30:00">11:30 AM</option>
              <option value="14:00:00">02:00 PM</option>
              <option value="16:00:00">04:00 PM</option>
            </select>

            <input
              type="text"
              placeholder="Symptoms / Reason"
              value={booking.reason}
              onChange={(e) => setBooking({ ...booking, reason: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              required
            />

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-sm py-2 transition cursor-pointer"
            >
              Confirm Slot
            </button>
          </form>
        </section>

        {/* Appointments List */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-sky-300">
            <Calendar className="w-5 h-5" /> My Appointments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Doctor</th>
                  <th className="pb-2">Specialization</th>
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((a) => (
                  <tr key={a.appointment_id}>
                    <td className="py-3 font-medium">{a.doctor_name}</td>
                    <td className="py-3 text-slate-400">{a.specialization}</td>
                    <td className="py-3">
                      {new Date(a.slot_date).toLocaleDateString()} • {a.slot_time}
                    </td>
                    <td className="py-3 text-slate-300">{a.reason}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Prescriptions & Lab Reports */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-purple-300">
            <FileText className="w-5 h-5" /> Medical Records, Prescriptions & Lab Reports
          </h2>
          {records.length === 0 && (
            <p className="text-sm text-slate-400">No medical consultations recorded yet.</p>
          )}
          {records.map((rec) => (
            <div key={rec.record_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-teal-400 font-mono">{rec.diagnosis_code}</span>
                  <h3 className="text-base font-bold">{rec.diagnosis_title}</h3>
                  <p className="text-xs text-slate-400">
                    Consulted {rec.doctor_name} ({rec.specialization})
                  </p>
                </div>
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  Vitals: BP {rec.vitals?.bp || 'N/A'} | Temp {rec.vitals?.temp_f || 'N/A'}°F | Pulse {rec.vitals?.pulse || 'N/A'}
                </div>
              </div>

              <p className="text-sm text-slate-300">{rec.doctor_notes}</p>

              {rec.prescription && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
                    Digital Prescription (Valid until {new Date(rec.prescription.valid_until).toLocaleDateString()})
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {rec.prescription.items.map((item) => (
                      <li key={item.item_number} className="flex justify-between text-slate-200">
                        <span>
                          <strong>{item.medicine_name}</strong> ({item.dosage})
                        </span>
                        <span className="text-slate-400">
                          {item.frequency} • {item.duration_days} days
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rec.labs && rec.labs.length > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" /> Diagnostic Lab Tests
                  </h4>
                  {rec.labs.map((lab) => (
                    <div key={lab.order_id} className="text-sm border-t border-slate-800/70 pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{lab.test_type}</span>
                        <span className={lab.status === 'COMPLETED' ? 'text-emerald-400 text-xs' : 'text-amber-400 text-xs'}>
                          {lab.status}
                        </span>
                      </div>
                      {lab.metrics && (
                        <pre className="mt-1.5 text-xs bg-slate-900 p-2 rounded text-emerald-300 overflow-x-auto">
                          {JSON.stringify(lab.metrics, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Live Trigger-Powered Audit Log */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-rose-300">
            <ShieldAlert className="w-5 h-5" /> Database Audit Trail (SQL Trigger Logs)
          </h2>
          <div className="space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.log_id} className="flex justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-200">
                  <strong className="text-teal-400">[{log.table_name}]</strong> {log.details}
                </span>
                <span className="text-slate-500">{new Date(log.logged_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}