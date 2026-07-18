import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  Laptop,
  Check
} from 'lucide-react';
import { UserSession } from '../types';

interface AuthViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

interface LocalUser {
  username: string;
  email: string;
  passwordHash: string; // Stored in plain text for this frontend simulator
  role: UserSession['role'];
}

// Preset demo accounts
const DEMO_ACCOUNTS = [
  {
    username: 'sre.master',
    email: 'sre.master@cloudobserve.corp',
    password: 'password123',
    role: 'super_admin' as const,
    roleTitle: 'Super Admin',
    desc: 'Unfettered full-stack enterprise root access'
  },
  {
    username: 'operator.john',
    email: 'operator.john@cloudobserve.corp',
    password: 'password123',
    role: 'operator' as const,
    roleTitle: 'SRE Operator',
    desc: 'Manage and resolve critical incidents & alarms'
  },
  {
    username: 'admin.sarah',
    email: 'admin.sarah@cloudobserve.corp',
    password: 'password123',
    role: 'cloud_admin' as const,
    roleTitle: 'Cloud Admin',
    desc: 'Configure multi-cloud provider tenants & credentials'
  },
  {
    username: 'viewer.lisa',
    email: 'viewer.lisa@cloudobserve.corp',
    password: 'password123',
    role: 'viewer' as const,
    roleTitle: 'Operator Viewer',
    desc: 'Read-only access to charts & compliance boards'
  }
];

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserSession['role']>('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize simulated database in localstorage if empty
  useEffect(() => {
    const existingUsers = localStorage.getItem('cloudobserve_users');
    if (!existingUsers) {
      const defaultUsers: LocalUser[] = DEMO_ACCOUNTS.map(acc => ({
        username: acc.username,
        email: acc.email,
        passwordHash: acc.password,
        role: acc.role
      }));
      localStorage.setItem('cloudobserve_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const getRegisteredUsers = (): LocalUser[] => {
    const stored = localStorage.getItem('cloudobserve_users');
    return stored ? JSON.parse(stored) : [];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please provide both email address and account password.');
      return;
    }

    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      setError('Invalid credentials. Check your email or try password "password123".');
      return;
    }

    setSuccess('Authentication approved. Launching console...');
    setTimeout(() => {
      onLoginSuccess({
        username: user.username,
        email: user.email,
        role: user.role
      });
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password) {
      setError('All fields are required to register a CloudObserve Identity context.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 alphanumeric characters.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('An identity record with this email already exists on the node.');
      return;
    }

    const newUser: LocalUser = {
      username: username.replace(/\s+/g, '.').toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: password,
      role: selectedRole
    };

    const updated = [...users, newUser];
    localStorage.setItem('cloudobserve_users', JSON.stringify(updated));

    setSuccess('Identity record synthesized successfully! Logging you in...');
    setTimeout(() => {
      onLoginSuccess({
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });
    }, 1000);
  };

  const triggerFastTrack = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setMode('login');
    setSuccess(`Auto-filled ${demo.roleTitle} credentials. Authenticating...`);
    
    setTimeout(() => {
      onLoginSuccess({
        username: demo.username,
        email: demo.email,
        role: demo.role
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none" id="auth-root">
      {/* Visual background grids & glowing accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left column: Value Proposition & Aesthetics */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block">
                CloudObserve <span className="text-blue-500">PRO</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase font-bold">
                Enterprise SRE Command Center
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display leading-tight">
              Observability & Compliance Across Your Cloud Fleet
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Synthesize live traces, configure policy posture scans, track multi-provider cost metrics, and invoke Gemini AI playbooks inside a consolidated multi-tenant workspace.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#2D333B]/50">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-[#151921] border border-[#2D333B] mt-0.5">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-200">Role-Based Gateways</h4>
                <p className="text-[11px] text-gray-400">Strict simulation of security permissions from SRE Operators to Root administrators.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-[#151921] border border-[#2D333B] mt-0.5">
                <LockKeyhole className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-200">Audited Actions context</h4>
                <p className="text-[11px] text-gray-400">Every connection, purge, and threshold switch generates cryptographic-ready trace logs.</p>
              </div>
            </div>
          </div>

          {/* Preset fast tracks */}
          <div className="bg-[#151921]/60 p-4 rounded-lg border border-[#2D333B] mt-4">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono block mb-2">
              Demo Fast-Track Profiles
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(demo => (
                <button
                  key={demo.role}
                  onClick={() => triggerFastTrack(demo)}
                  className="p-2 bg-[#0B0E14] hover:bg-[#1C212B] border border-[#2D333B] rounded text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                      {demo.roleTitle}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-[9px] text-gray-500 block truncate mt-0.5">
                    {demo.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: The interactive Auth Form Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-[#151921] rounded-xl border border-[#2D333B] p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="auth-card">
            {/* Form Mode Tabs */}
            <div className="flex border-b border-[#2D333B] mb-6">
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                  mode === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In to Platform
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                  mode === 'register' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Create Account Context
                {mode === 'register' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded flex items-start gap-2 text-xs text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Notification */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded flex items-start gap-2 text-xs text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Login form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Platform Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g., sre.master@cloudobserve.corp"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 rounded text-xs text-white placeholder-gray-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Authorization Password
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Demo: "password123"</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter credential lock key"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 rounded text-xs text-white placeholder-gray-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-6 shadow-lg shadow-blue-600/10"
                >
                  Authorize Console Session <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            {/* Registration/Creation Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Full Staff Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., Alex Carter"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 rounded text-xs text-white placeholder-gray-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Staff Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g., alex.carter@corp.org"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 rounded text-xs text-white placeholder-gray-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Synthetic Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters for cloud standards"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 rounded text-xs text-white placeholder-gray-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Role selection matrix */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Assign Security Role Context (RBAC)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'super_admin', title: 'Super Admin', limit: 'Root Control', border: 'border-rose-500/10' },
                      { id: 'cloud_admin', title: 'Cloud Admin', limit: 'Tenant Admin', border: 'border-blue-500/10' },
                      { id: 'operator', title: 'SRE Operator', limit: 'Write / Chaos', border: 'border-amber-500/10' },
                      { id: 'viewer', title: 'Viewer', limit: 'Read-only access', border: 'border-gray-500/10' }
                    ] as const).map(roleNode => (
                      <button
                        key={roleNode.id}
                        type="button"
                        onClick={() => setSelectedRole(roleNode.id)}
                        className={`p-2 rounded border text-left transition-all cursor-pointer relative ${
                          selectedRole === roleNode.id
                            ? 'bg-[#1C212B] border-blue-500 text-white font-bold'
                            : 'bg-[#0B0E14] border-[#2D333B] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold block">{roleNode.title}</span>
                          {selectedRole === roleNode.id && (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                          {roleNode.limit}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-6 shadow-lg shadow-blue-600/10"
                >
                  Synthesize Credentials & Sign In <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            {/* Card Footer notice */}
            <div className="mt-6 pt-4 border-t border-[#2D333B]/50 text-center">
              <span className="text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1">
                <Laptop className="h-3 w-3 text-blue-500" />
                Node ID: cloud-prod-node-03 &bull; Sec-Policy: TLS_v1.3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
