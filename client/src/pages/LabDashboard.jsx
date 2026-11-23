import { useEffect, useState } from 'react';
import { FlaskConical, LogOut, CheckCircle2 } from 'lucide-react';
import API from '../api';

export default function LabDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hemoglobin, setHemoglobin] = useState('14.2');
  const [wbc, setWbc] = useState('7200');
  const [platelets, setPlatelets] = useState('245000');
  const [remarks, setRemarks] = useState('All parameters within normal reference range.');
  const [msg, setMsg] = useState('');

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
    setMsg('');
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
      setMsg('Lab report verified! Order marked COMPLETED and logged via SQL trigger.');
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-amber-400">MedCore EHR • Laboratory Portal</h1>
          <p className="text-xs text-slate-400">Technician: {user.name} (Restricted RBAC View)</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-amber-300">
            <FlaskConical className="w-5 h-5" /> Diagnostic Test Queue
          </h2>

          {msg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm">
              {msg}
            </div>
          )}

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                    {order.priority}
                  </span>
                  <h3 className="font-semibold text-sm mt-1">{order.test_type}</h3>
                  <p className="text-xs text-slate-400">
                    Patient: {order.patient_name} ({order.blood_group}) • Ordered by {order.ordered_by_doctor}
                  </p>
                </div>

                {order.status === 'PENDING' ? (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold cursor-pointer"
                  >
                    Enter Results
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-4 text-teal-300">
            {selectedOrder ? `Verify Report: ${selectedOrder.test_type}` : 'Select a Pending Lab Order'}
          </h2>

          {selectedOrder ? (
            <form onSubmit={handleResultSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hemoglobin}
                    onChange={(e) => setHemoglobin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">WBC (/uL)</label>
                  <input
                    type="number"
                    value={wbc}
                    onChange={(e) => setWbc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Platelets (/uL)</label>
                  <input
                    type="number"
                    value={platelets}
                    onChange={(e) => setPlatelets(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Lab Technician Remarks</label>
                <input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-sm cursor-pointer"
              >
                Submit & Verify JSON Lab Report
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">
              Click <strong>Enter Results</strong> on any pending test order to submit structured JSON lab metrics.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}