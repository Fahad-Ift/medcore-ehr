import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  UserPlus,
  LogIn,
  ShieldCheck,
  CalendarCheck,
  FileSpreadsheet,
  FlaskConical,
  Info
} from 'lucide-react';
import API from '../api';

export default function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
    setSuccessMsg('');
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
        setSuccessMsg('Account created! Enter your email and password below to sign in.');
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
    <div className="min-h-screen bg-[#FAFAFD] text-[#122056] flex flex-col lg:flex-row">
      {/* Left Column: Deep Navy (#122056) Hospital Panel & Step-by-Step Guide */}
      <div className="lg:w-1/2 bg-[#122056] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80"
          alt="Modern Medical Facility"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#5B65DC] rounded-xl text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">MedCore Health Portal</h1>
              <p className="text-xs text-[#EEEFFD]/80">Integrated Electronic Health Record System</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Seamless clinical care for patients, doctors, and diagnostic labs.
          </h2>
          <p className="text-[#EEEFFD]/85 text-sm max-w-lg leading-relaxed mb-8">
            Schedule specialist visits, issue verified digital prescriptions, and view structured lab reports in one unified platform.
          </p>

          {/* How to Use Guide */}
          <div className=" backdrop-blur-md border border-white/15 rounded-2xl p-6 space-y-4 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-[#EEEFFD]">
              How to Use MedCore — Step-by-Step Guide
            </p>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#5B65DC]/30 text-[#EEEFFD] shrink-0 mt-0.5">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed text-[#EEEFFD]/95">
                <strong>Step 1 — Create an Account or Try a Demo:</strong> Click <em>Create Account</em> on the right to register as a Patient, Doctor, or Lab Tech, or click any of the 3 instant demo buttons at the bottom.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#5B65DC]/30 text-[#EEEFFD] shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed text-[#EEEFFD]/95">
                <strong>Step 2 — Book a Doctor &amp; Consult:</strong> Patients choose a specialist card and time slot; Doctors record vitals, ICD-10 diagnosis, and prescriptions.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#5B65DC]/30 text-[#EEEFFD] shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed text-[#EEEFFD]/95">
                <strong>Step 3 — Process Lab Reports:</strong> Lab Technicians enter test results that immediately unlock inside the patient&apos;s medical wallet.
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#EEEFFD]/60 mt-8">
          MedCore Clinical Systems • Role-Based Access &amp; Automated Audit Logging
        </p>
      </div>

      {/* Right Column: Pure White (#FFFFFF) Authentication Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full bg-white border border-[#EEEFFD] rounded-2xl p-8 shadow-lg shadow-[#122056]/5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#122056]">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="text-sm text-[#122056]/70 mt-1">
              {isLogin
                ? 'Enter your credentials below or use a 1-click demo role.'
                : 'Follow the 3 simple fields below to register your hospital profile.'}
            </p>
          </div>

          {/* Toggle Tabs (#EEEFFD secondary pill) */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#EEEFFD] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                isLogin
                  ? 'bg-white text-[#122056] shadow-xs'
                  : 'text-[#122056]/70 hover:text-[#122056]'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#5B65DC]" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                !isLogin
                  ? 'bg-white text-[#122056] shadow-xs'
                  : 'text-[#122056]/70 hover:text-[#122056]'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#5B65DC]" /> Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#EEEFFD] border border-[#5B65DC]/30 text-[#122056] text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#122056] mb-1">
                    1. Choose Your Account Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-lg px-3 py-2 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
                  >
                    <option value="PATIENT">Patient — Book visits &amp; view prescriptions</option>
                    <option value="DOCTOR">Doctor — Consult patients &amp; issue records</option>
                    <option value="LAB_TECH">Lab Technician — Verify diagnostic lab tests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#122056] mb-1">
                    2. Enter Your Full Name
                  </label>
                  <input
                    name="full_name"
                    required
                    placeholder="e.g. Hamza Tariq"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-lg px-3 py-2 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#122056] mb-1">
                {!isLogin ? '3. Email & Password' : 'Email Address'}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@medcore.com"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-lg px-3 py-2 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
              />
            </div>

            <div>
              {isLogin && (
                <label className="block text-xs font-bold text-[#122056] mb-1">
                  Password
                </label>
              )}
              <input
                type="password"
                name="password"
                required
                placeholder="Password (min. 6 characters)"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-[#FAFAFD] border border-[#5B65DC]/30 rounded-lg px-3 py-2 text-sm text-[#122056] focus:outline-none focus:border-[#5B65DC]"
              />
            </div>

            {!isLogin && form.role === 'PATIENT' && (
              <div className="bg-[#EEEFFD]/70 border border-[#5B65DC]/20 rounded-xl p-3.5 space-y-3">
                <p className="text-xs font-bold text-[#122056] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5B65DC]" /> Patient Medical Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Blood Group</label>
                    <select name="blood_group" value={form.blood_group} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Phone Number</label>
                    <input name="phone" required placeholder="0300-1234567" value={form.phone} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                </div>
              </div>
            )}

            {!isLogin && form.role === 'DOCTOR' && (
              <div className="bg-[#EEEFFD]/70 border border-[#5B65DC]/20 rounded-xl p-3.5 space-y-3">
                <p className="text-xs font-bold text-[#122056] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5B65DC]" /> Physician Verification
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">License #</label>
                    <input name="license_number" required placeholder="PMC-99102" value={form.license_number} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Fee (PKR)</label>
                    <input type="number" name="consultation_fee" required value={form.consultation_fee} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#122056]/80 mb-1">Specialization</label>
                    <input name="specialization" required placeholder="e.g. Cardiologist" value={form.specialization} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                </div>
              </div>
            )}

            {!isLogin && form.role === 'LAB_TECH' && (
              <div className="bg-[#EEEFFD]/70 border border-[#5B65DC]/20 rounded-xl p-3.5 space-y-3">
                <p className="text-xs font-bold text-[#122056] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#5B65DC]" /> Laboratory Verification
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Certification ID</label>
                    <input name="certification_id" required placeholder="LAB-5521" value={form.certification_id} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#122056]/80 mb-1">Department</label>
                    <input name="lab_department" required value={form.lab_department} onChange={handleChange} className="w-full bg-white border border-[#5B65DC]/30 rounded-lg px-2.5 py-1.5 text-sm text-[#122056]" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#5B65DC] hover:bg-[#4953c7] text-white rounded-lg font-semibold text-sm transition shadow-sm cursor-pointer"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-[#EEEFFD]">
            <p className="text-xs font-bold text-[#122056] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5B65DC]" /> Instant 1-Click Demo Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('ali.patient@gmail.com')}
                className="py-2 px-2 bg-[#EEEFFD] hover:bg-[#5B65DC] hover:text-white rounded-lg text-xs font-semibold text-[#122056] transition cursor-pointer"
              >
                Patient (Ali)
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('dr.sara@medcore.com')}
                className="py-2 px-2 bg-[#EEEFFD] hover:bg-[#5B65DC] hover:text-white rounded-lg text-xs font-semibold text-[#122056] transition cursor-pointer"
              >
                Dr. Sara
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('bilal.lab@medcore.com')}
                className="py-2 px-2 bg-[#EEEFFD] hover:bg-[#5B65DC] hover:text-white rounded-lg text-xs font-semibold text-[#122056] transition cursor-pointer"
              >
                Lab (Bilal)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}