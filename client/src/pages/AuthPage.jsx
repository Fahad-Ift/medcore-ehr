import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import API from '../api';

export default function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'PATIENT',
    full_name: '',
    date_of_birth: '2002-01-01',
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    license_number: '',
    specialization: 'General Physician',
    consultation_fee: '1500',
    lab_department: 'Hematology & Pathology',
    certification_id: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const redirectByRole = (role) => {
    if (role === 'PATIENT') navigate('/patient');
    else if (role === 'DOCTOR') navigate('/doctor');
    else if (role === 'LAB_TECH') navigate('/lab');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await API.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        redirectByRole(res.data.user.role);
      } else {
        await API.post('/auth/register', form);
        alert('Account created! Please sign in now.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (email) => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password: 'password123' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      redirectByRole(res.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MedCore EHR</h1>
            <p className="text-xs text-slate-400">Clinical Records & Telemedicine Portal</p>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              isLogin ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              !isLogin ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Account Role (ISA Specialization)</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="LAB_TECH">Lab Technician</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  name="full_name"
                  required
                  placeholder="e.g. Hamza Tariq"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@medcore.com"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {!isLogin && form.role === 'PATIENT' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Blood Group</label>
                <select name="blood_group" value={form.blood_group} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input name="phone" required placeholder="0300-0000000" value={form.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {!isLogin && form.role === 'DOCTOR' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">PMC License #</label>
                <input name="license_number" required placeholder="PMC-99102" value={form.license_number} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fee (PKR)</label>
                <input type="number" name="consultation_fee" required value={form.consultation_fee} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Specialization</label>
                <input name="specialization" required value={form.specialization} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {!isLogin && form.role === 'LAB_TECH' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Certification ID</label>
                <input name="certification_id" required placeholder="LAB-5521" value={form.certification_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Department</label>
                <input name="lab_department" required value={form.lab_department} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold text-sm transition cursor-pointer"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Demo Logins for Viva & Testing */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> Quick Demo Access (Seeded Accounts)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('ali.patient@gmail.com')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-teal-300 cursor-pointer"
            >
              Patient (Ali)
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('dr.sara@medcore.com')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-sky-300 cursor-pointer"
            >
              Dr. Sara
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('bilal.lab@medcore.com')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-amber-300 cursor-pointer"
            >
              Lab (Bilal)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}