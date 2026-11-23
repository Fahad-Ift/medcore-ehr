import { useEffect, useState } from 'react';
import {
  Activity,
  FlaskConical,
  LogOut,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Info
} from 'lucide-react';
import API from '../api';

export default function LabDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hemoglobin, setHemoglobin] = useState('14.2');
  const [wbc, setWbc] = useState('7200');
  const [platelets, setPlatelets] = useState('245000');
  const [remarks, setRemarks] = useState('All parameters within normal clinical reference range.');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadOrders = async () => {
    try {
      const res = await API.get('/labs/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await API.post('/labs/results', {
        order_id: selectedOrder.order_id,
        metrics: {
          hemoglobin_g_dl: Number(hemoglobin),
          wbc_per_ul: Number(wbc),
          platelets_per_ul: Number(platelets)
        },
        remarks
      });
      setMsg({
        type: 'success',
        text: 'Lab report verified! Results have been published directly to the patient and physician portals.'
      });
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Submission failed'
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
              <h1 className="text-base font-bold text-[#122056]">MedCore Diagnostic Laboratory</h1>
              <p className="text-xs text-[#122056]/65">Technician: {user.name}</p>
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
        {/* Lab Banner with Portrait & How-To Guide */}
        <section className="bg-[#122056] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=300&q=80"
              alt="Diagnostic Lab Specialist"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#5B65DC] shrink-0"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#5B65DC] text-white text-xs font-bold mb-1">
                Pathology &amp; Diagnostics Desk
              </span>
              <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
              <p className="text-xs text-[#EEEFFD]/80 mt-0.5">
                Step 1: Click <strong>Enter Results</strong> on any pending test in the queue. Step 2: Input measured parameters and remarks to publish the verified report.
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-xs text-[#EEEFFD] shrink-0 max-w-xs">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#EEEFFD]" /> Privacy-Filtered RBAC
            </p>
            <p className="text-[#EEEFFD]/75 mt-0.5">
              Lab accounts only see requested test types and blood groups—private clinical diagnoses remain hidden.
            </p>
          </div>
        </section>

        {msg.text && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border ${
              msg.type === 'success'
                ? 'bg-[#EEEFFD] border-[#5B65DC] text-[#122056]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Diagnostic Test Queue (6 cols) */}
          <section className="lg:col-span-6 bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs h-fit">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#122056] flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#5B65DC]" /> Diagnostic Test Queue
              </h2>
              <p className="text-xs text-[#122056]/65 mt-0.5">
                Pending lab requests ordered by physicians appear at the top.
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const isSelected = selectedOrder?.order_id === order.order_id;
                return (
                  <div
                    key={order.order_id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#EEEFFD]/70 border-[#5B65DC]'
                        : 'bg-[#FAFAFD] border-[#EEEFFD]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            order.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-[#EEEFFD] text-[#5B65DC]'
                          }`}
                        >
                          {order.priority}
                        </span>
                        <span className="text-xs font-bold text-[#122056]/60">
                          Order #{order.order_id}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#122056]">{order.test_type}</h3>
                      <p className="text-xs text-[#122056]/70 mt-0.5">
                        Patient: <strong>{order.patient_name}</strong> ({order.blood_group}) • Ordered by {order.ordered_by_doctor}
                      </p>
                    </div>

                    {order.status === 'PENDING' ? (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#5B65DC] hover:bg-[#4953c7] text-white text-xs font-semibold shrink-0 transition cursor-pointer"
                      >
                        Enter Results
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                );
              })}

              {orders.length === 0 && (
                <p className="text-sm text-[#122056]/60 py-4 text-center">
                  No diagnostic lab orders in the queue yet.
                </p>
              )}
            </div>
          </section>

          {/* Right Column: Report Verification Form (6 cols) */}
          <section className="lg:col-span-6 bg-white border border-[#EEEFFD] rounded-2xl p-6 shadow-xs h-fit">
            <div className="border-b border-[#EEEFFD] pb-4 mb-5">
              <h2 className="text-base font-bold text-[#122056] flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#5B65DC]" />
                {selectedOrder
                  ? `Verify Report: ${selectedOrder.test_type}`
                  : 'Diagnostic Report Entry'}
              </h2>
              <p className="text-xs text-[#122056]/65 mt-0.5">
                {selectedOrder
                  ? `Patient: ${selectedOrder.patient_name} (${selectedOrder.blood_group})`
                  : 'Select any pending lab order from the left queue to enter test parameters.'}
              </p>
            </div>

            {selectedOrder ? (
              <form onSubmit={handleResultSubmit} className="space-y-4">
                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B65DC]">
                    1. Measured Biomarker Values
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Hemoglobin (g/dL)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={hemoglobin}
                        onChange={(e) => setHemoglobin(e.target.value)}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        WBC Count (/uL)
                      </label>
                      <input
                        type="number"
                        value={wbc}
                        onChange={(e) => setWbc(e.target.value)}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#122056] mb-1">
                        Platelets (/uL)
                      </label>
                      <input
                        type="number"
                        value={platelets}
                        onChange={(e) => setPlatelets(e.target.value)}
                        className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAFAFD] border border-[#EEEFFD] rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5B65DC]">
                    2. Pathologist / Technician Remarks
                  </p>
                  <input
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. All parameters within normal reference range."
                    className="w-full bg-white border border-[#5B65DC]/30 rounded-xl px-3 py-2 text-sm text-[#122056]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#5B65DC] hover:bg-[#4953c7] text-white rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer"
                >
                  Publish &amp; Verify Lab Report
                </button>
              </form>
            ) : (
              <div className="bg-[#EEEFFD]/50 border border-[#EEEFFD] rounded-2xl p-8 text-center space-y-2">
                <Info className="w-7 h-7 text-[#5B65DC] mx-auto" />
                <p className="text-sm font-bold text-[#122056]">No Lab Order Selected</p>
                <p className="text-xs text-[#122056]/70 max-w-md mx-auto leading-relaxed">
                  Click <strong>Enter Results</strong> next to any pending diagnostic order on the left to record test parameters and notify the patient.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}