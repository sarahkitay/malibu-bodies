import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type LoginMode = 'client' | 'staff';

export function LoginScreen() {
  const { loginAsTrainer, loginAsClient } = useAuth();
  const [mode, setMode] = useState<LoginMode>('client');

  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [clientError, setClientError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    if (!loginAsTrainer(staffUsername, staffPassword)) {
      setStaffError('Invalid username or password');
    }
    setIsSubmitting(false);
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    if (!loginAsClient(clientName, clientCode)) {
      setClientError('Invalid name or access code. Please check and try again.');
    }
    setIsSubmitting(false);
  };

  const handleClientCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, var(--login-grad-top) 0%, var(--login-grad-mid) 55%, var(--login-grad-bottom) 100%)',
        }}
      />

      {/* Grain texture */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm min-h-screen flex flex-col items-center justify-center">
        {/* Brand */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-4xl text-[#212529] font-light tracking-tight mb-2">Malibu Bodies</h1>
          <p className="text-xs text-[#5a6b73] tracking-[0.4em] uppercase font-light">Private Fitness Studio</p>
        </motion.div>

        {/* Portal selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-10"
        >
          <div className="glass-elegant rounded-full p-1 flex relative">
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm"
              animate={{ left: mode === 'client' ? 4 : 'calc(50% + 0px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setMode('client')}
              className={`relative z-10 flex-1 py-3.5 text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                mode === 'client' ? 'text-[#212529]' : 'text-[#5a6b73]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              Client
            </button>
            <button
              type="button"
              onClick={() => setMode('staff')}
              className={`relative z-10 flex-1 py-3.5 text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                mode === 'staff' ? 'text-[#212529]' : 'text-[#5a6b73]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
              Staff
            </button>
          </div>
        </motion.div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === 'client' && (
            <motion.div
              key="client"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="w-full glass-elegant rounded-2xl p-10"
            >
              <div className="text-center mb-10">
                <h2 className="font-serif text-2xl text-[#212529] font-light mb-1">Client Access</h2>
                <p className="text-xs text-[#5a6b73] font-light">Enter your private code</p>
              </div>

              <form onSubmit={handleClientLogin} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-medium text-[#5a6b73] uppercase tracking-wider mb-2 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Your name"
                      className="input-elegant w-full py-3.5 px-5 rounded-xl text-[#212529] placeholder-[#c5d5dc]/60 font-light"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-medium text-[#5a6b73] uppercase tracking-wider mb-2 ml-1">
                      Access Code
                    </label>
                    <input
                      type="text"
                      value={clientCode}
                      onChange={handleClientCodeInput}
                      placeholder="••••••"
                      maxLength={6}
                      className="input-elegant w-full py-4 px-6 rounded-xl text-center text-xl tracking-[0.4em] font-light text-[#212529] placeholder-[#c5d5dc]/60"
                      autoComplete="off"
                      required
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-[#c5d5dc]/50" />
                  </div>
                </div>

                {clientError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {clientError}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-elegant w-full bg-[#212529] text-white py-4 rounded-xl font-light tracking-wide hover:bg-[#1a1d20] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="opacity-70">Please wait...</span>
                  ) : (
                    <>Enter Studio</>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#c5d5dc]/30 text-center">
                <p className="text-xs text-[#5a6b73] mb-3 font-light">New client?</p>
                <button type="button" className="text-sm text-[#343a40] hover:text-[#212529] underline-grow font-light">
                  Request access
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="w-full glass-elegant rounded-2xl p-10"
            >
              <div className="text-center mb-10">
                <h2 className="font-serif text-2xl text-[#212529] font-light mb-1">Staff Sign In</h2>
                <p className="text-xs text-[#5a6b73] font-light">Authorized personnel only</p>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-medium text-[#5a6b73] uppercase tracking-wider mb-2 ml-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="name@malibubodies.com"
                    className="input-elegant w-full py-3.5 px-5 rounded-xl text-[#212529] placeholder-[#c5d5dc]/50 font-light"
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#5a6b73] uppercase tracking-wider mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-elegant w-full py-3.5 px-5 rounded-xl text-[#212529] placeholder-[#c5d5dc]/50 font-light pr-12"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c5d5dc] hover:text-[#5a6b73] transition-colors"
                      aria-label={showStaffPassword ? 'Hide password' : 'Show password'}
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <label className="flex items-center gap-2 text-[#5a6b73] cursor-pointer hover:text-[#343a40] transition-colors font-light">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#c5d5dc]/50 text-[#212529] focus:ring-[#8fa8b2]" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="text-[#5a6b73] hover:text-[#343a40] transition-colors underline-grow font-light">
                    Forgot password
                  </button>
                </div>

                {staffError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {staffError}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-elegant w-full bg-[#212529] text-white py-4 rounded-xl font-light tracking-wide hover:bg-[#1a1d20] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="opacity-70">Please wait...</span>
                  ) : (
                    <>Sign In</>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-8 text-[10px] text-[#5a6b73]/80 mb-2 font-light tracking-wider uppercase">
            <button type="button" className="hover:text-[#343a40] transition-colors">Privacy</button>
            <button type="button" className="hover:text-[#343a40] transition-colors">Terms</button>
            <button type="button" className="hover:text-[#343a40] transition-colors">Contact</button>
          </div>
          <p className="text-[10px] text-[#c5d5dc] font-light">© 2026 Malibu Bodies</p>
        </motion.div>
      </div>

      {/* Login page styles */}
      <style>{`
        .glass-elegant {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 24px -4px rgba(90, 107, 115, 0.1),
                      0 1px 0 rgba(255, 255, 255, 0.6) inset;
        }
        .input-elegant {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(143, 168, 178, 0.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }
        .input-elegant:hover {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(143, 168, 178, 0.4);
        }
        .input-elegant:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          border-color: #8fa8b2;
          box-shadow: 0 0 0 3px rgba(143, 168, 178, 0.1);
        }
        .underline-grow {
          position: relative;
        }
        .underline-grow::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 1px;
          background: #5a6b73;
          transition: all 0.4s ease;
          transform: translateX(-50%);
        }
        .underline-grow:hover::after {
          width: 100%;
        }
        .btn-elegant {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-elegant::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s ease;
        }
        .btn-elegant:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
}
