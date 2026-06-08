import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserPlus, LogIn, Mail, Lock, Phone, User, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, registerUser, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path
  const from = location.state?.from?.pathname || '/';

  // Toggle mode
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        if (!fullName || !phone || !password || !email) {
          setError('אנא מלאו את כל שדות החובה.');
          return;
        }
        await registerUser({
          fullName,
          email,
          phone,
          password,
          avatarUrl
        });
      }
      // Redirect back
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'אירעה שגיאה. נא לנסות שנית.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'ההתחברות עם Google נכשלה. נא לנסות שנית.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-primary/10 shadow-premium overflow-hidden transition-custom">
        {/* Toggle tabs */}
        <div className="flex border-b border-primary/5">
          <button
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold transition-custom cursor-pointer ${
              isLoginMode 
                ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                : 'text-secondary hover:text-text-dark'
            }`}
          >
            התחברות
          </button>
          <button
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold transition-custom cursor-pointer ${
              !isLoginMode 
                ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                : 'text-secondary hover:text-text-dark'
            }`}
          >
            הרשמה לקהילה
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-2xl font-bold text-text-dark">
              {isLoginMode ? 'ברוכים השבים!' : 'הצטרפו ל-SecondWear'}
            </h2>
            <p className="text-xs text-secondary">
              {isLoginMode ? 'היכנסו כדי לקנות, למכור ולנהל את הפריטים שלכם' : 'פתחו חשבון בחינם והתחילו לפרסם בגדים למכירה'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-error-soft/10 border border-error-soft/20 text-error-soft p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-bg-warm text-text-dark border border-primary/20 py-3 rounded-xl font-semibold transition-custom shadow-sm hover:scale-[1.01] active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.483 0-6.316-2.833-6.316-6.316s2.833-6.316 6.316-6.316c1.554 0 2.977.564 4.08 1.49l2.977-2.977C18.983 2.145 15.82 1 12.24 1c-6.076 0-11 4.924-11 11s4.924 11 11 11c6.076 0 10.598-4.148 10.598-11 0-.693-.056-1.348-.158-1.715H12.24z"
              />
            </svg>
            <span>{isLoginMode ? 'התחברות באמצעות Google' : 'הרשמה מהירה באמצעות Google'}</span>
          </button>

          {/* Or Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-primary/10"></div>
            <span className="px-3 text-xs text-secondary font-medium shrink-0">או באמצעות אימייל</span>
            <div className="flex-1 border-t border-primary/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLoginMode && (
              <>
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">שם מלא *</label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">מספר טלפון * (עבור תשלומים ישירים)</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="050-1234567"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">אימייל *</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">סיסמה *</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                  required
                />
              </div>
            </div>

            {!isLoginMode && (
              /* Avatar URL optional */
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">קישור לתמונת פרופיל (אופציונלי)</label>
                <div className="relative">
                  <LinkIcon className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer mt-2"
            >
              {isLoginMode ? 'להתחברות' : 'להרשמה וסיום'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
