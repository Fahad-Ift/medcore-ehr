import { useEffect, useState } from 'react';
import { LogOut, CheckCircle2, Clock } from 'lucide-react';
import API from '../api';

const DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
];

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

  const selectedDoctor = doctors.find((d) => String(d.doctor_id) === String(booking.doctor_id));

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-[#122056]">
      <header className="bg-white border-b border-[#EEEFFD] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg text-[#122056]">MedCore Patient Portal</h1>
            <p className="text-xs text-[#122056]/65">Signed in as {user.name}</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEEFFD] hover:bg-[#5B65DC] text-[#122056] hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#EEEFFD] text-[#5B65DC] text-xs font-semibold mb-2">
              Patient Health Hub
            </span>
            <h2 className="text-xl text-[#122056]">
              Book a specialist or review your clinical records
            </h2>
            <p className="text-sm text-[#122056]/70 mt-1">
              Follow the 3 steps below to schedule an appointment. Once your doctor completes the visit, your prescription and lab reports appear automatically below.
            </p>
          </div>
          <div className="bg-[#EEEFFD] rounded-xl p-3.5 text-xs text-[#122056] max-w-xs shrink-0">
            <p className="font-semibold mb-1">Smart Slot Protection</p>
            <p className="text-[#122056]/80 leading-relaxed">
              Each doctor&apos;s time slot is locked once booked so two patients can never accidentally book the exact same time.
            </p>
          </div>
        </section>

        <section className="bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg text-[#122056]">Schedule a New Appointment</h2>
            <p className="text-xs text-[#122056]/65 mt-0.5">
              Complete all 3 steps below to reserve your consultation slot.
            </p>
          </div>

          {message.text && (
            <div
              className={`p-3.5 rounded-xl text-sm font-medium border ${
                message.type === 'success'
                  ? 'bg-[#EEEFFD] border-[#5B65DC] text-[#122056]'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B65DC] mb-3">
              Step 1 — Click a Doctor Card to Select Your Specialist
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc, idx) => {
                const isSelected = String(doc.doctor_id) === String(booking.doctor_id);
                return (
                  <button
                    key={doc.doctor_id}
                    type="button"
                    onClick={() => setBooking({ ...booking, doctor_id: doc.doctor_id })}
                    className={`text-left p-4 rounded-2xl border-2 transition flex items-center gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEEFFD]/60 border-[#5B65DC] shadow-sm'
                        : 'bg-[#FAFAFD] border-[#EEEFFD] hover:border-[#5B65DC]/50'
                    }`}
                  >
                    <img
                      src={DOCTOR_AVATARS[idx % DOCTOR_AVATARS.length]}
                      alt={doc.full_name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-[#122056] truncate">
                          {doc.full_name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#5B65DC] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#5B65DC]">{doc.specialization}</p>
                      <p className="text-xs text-[#122056]/60 mt-1">
                        Fee: <strong>PKR {doc.consultation_fee}</strong> • {doc.license_number}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-[#EEEFFD]">
            <div>
              <label className="block text-xs font-semibold text-[#122056] mb-1.5">
                Step 2a — Choose Date
              </label>
              <input
                type="date"
                value={booking.slot_date}
                onChange={(e) => setBooking({ ...booking, slot_date: e.target.value })}
                className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-xl px-3 py-2.5 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#122056] mb-1.5">
                Step 2b — Choose Time Slot
              </label>
              <select
                value={booking.slot_time}
                onChange={(e) => setBooking({ ...booking, slot_time: e.target.value })}
                className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-xl px-3 py-2.5 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
              >
                <option value="09:00:00">09:00 AM (Morning)</option>
                <option value="10:00:00">10:00 AM (Morning)</option>
                <option value="11:30:00">11:30 AM (Late Morning)</option>
                <option value="14:00:00">02:00 PM (Afternoon)</option>
                <option value="16:00:00">04:00 PM (Evening)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#122056] mb-1.5">
                Step 3 — Reason for Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Fever, routine checkup, chest pain"
                value={booking.reason}
                onChange={(e) => setBooking({ ...booking, reason: e.target.value })}
                className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-xl px-3 py-2.5 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
                required
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full bg-[#5B65DC] hover:bg-[#4953c7] text-white rounded-xl font-semibold text-sm py-2.5 px-4 transition shadow-xs cursor-pointer"
              >
                {selectedDoctor ? `Book with ${selectedDoctor.full_name.split(' ')[0]}` : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg text-[#122056]">My Scheduled &amp; Past Appointments</h2>
            <p className="text-xs text-[#122056]/65 mt-0.5">
              Track upcoming visits and completed consultations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EEEFFD] text-xs font-semibold text-[#122056]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Specialist</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Visit Reason</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEFFD]">
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-[#FAFAFD]">
                    <td className="py-3.5 px-4 font-semibold text-[#122056]">{a.doctor_name}</td>
                    <td className="py-3.5 px-4 text-[#122056]/75">{a.specialization}</td>
                    <td className="py-3.5 px-4 text-[#122056]">
                      {new Date(a.slot_date).toLocaleDateString()} • {a.slot_time}
                    </td>
                    <td className="py-3.5 px-4 text-[#122056]/80">{a.reason}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          a.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#EEEFFD] text-[#5B65DC]'
                        }`}
                      >
                        {a.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-sm text-[#122056]/60">
                      No appointments yet. Use the form above to book your first visit!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg text-[#122056]">Clinical Records, Prescriptions &amp; Lab Results</h2>
            <p className="text-xs text-[#122056]/65 mt-0.5">
              Verified diagnoses, prescribed medications, and diagnostic lab reports from your doctors.
            </p>
          </div>

          {records.length === 0 && (
            <div className="bg-white border border-[#EEEFFD] rounded-2xl p-6 text-sm text-[#122056]/70">
              No completed medical consultations recorded yet.
            </div>
          )}

          {records.map((rec) => (
            <div key={rec.record_id} className="bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-3 border-b border-[#EEEFFD] pb-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EEEFFD] text-[#5B65DC] text-xs font-semibold font-mono mb-1">
                    ICD-10: {rec.diagnosis_code}
                  </span>
                  <h3 className="text-base font-semibold text-[#122056]">{rec.diagnosis_title}</h3>
                  <p className="text-xs text-[#122056]/70 mt-0.5">
                    Consulted {rec.doctor_name} ({rec.specialization})
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAFAFD] border border-[#EEEFFD] font-semibold">
                    BP: {rec.vitals?.bp || 'N/A'}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAFAFD] border border-[#EEEFFD] font-semibold">
                    Temp: {rec.vitals?.temp_f || 'N/A'}°F
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAFAFD] border border-[#EEEFFD] font-semibold">
                    Pulse: {rec.vitals?.pulse || 'N/A'} bpm
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#122056]/85 leading-relaxed">{rec.doctor_notes}</p>

              {rec.prescription && (
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-xl p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B65DC] mb-2.5">
                    Digital Prescription (Valid until {new Date(rec.prescription.valid_until).toLocaleDateString()})
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {rec.prescription.items.map((item) => (
                      <li
                        key={item.item_number}
                        className="flex flex-wrap justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-[#EEEFFD]"
                      >
                        <span className="text-[#122056]">
                          <strong>{item.medicine_name}</strong> ({item.dosage})
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEEFFD] text-[#122056]">
                          {item.frequency} • {item.duration_days} days
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rec.labs && rec.labs.length > 0 && (
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B65DC]">
                    Diagnostic Lab Reports
                  </h4>
                  {rec.labs.map((lab) => (
                    <div key={lab.order_id} className="bg-white p-3.5 rounded-xl border border-[#EEEFFD] text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#122056]">{lab.test_type}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lab.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#EEEFFD] text-[#5B65DC]'
                          }`}
                        >
                          {lab.status}
                        </span>
                      </div>
                      {lab.metrics && (
                        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(lab.metrics).map(([key, val]) => (
                            <div key={key} className="bg-[#EEEFFD]/60 px-3 py-1.5 rounded-lg text-xs">
                              <span className="text-[#122056]/65 block">{key.replace(/_/g, ' ')}</span>
                              <strong className="text-[#122056] text-sm">{String(val)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                      {lab.remarks && (
                        <p className="text-xs text-[#122056]/70 mt-2">
                          <strong>Lab Remarks:</strong> {lab.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {auditLogs.length > 0 && (
          <section className="bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base text-[#122056] mb-3">
              Security &amp; Database Audit Activity
            </h2>
            <div className="space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.log_id}
                  className="flex flex-wrap justify-between items-center bg-[#FAFAFD] px-4 py-2.5 rounded-xl border border-[#EEEFFD]"
                >
                  <span className="text-[#122056]">
                    <strong className="text-[#5B65DC]">[{log.table_name}]</strong> {log.details}
                  </span>
                  <span className="text-[#122056]/55">{new Date(log.logged_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}