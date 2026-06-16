import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserPlus, LogIn, Mail, Lock, Phone, User, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, registerUser, sendPasswordResetEmail } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path
  const from = location.state?.from?.pathname || '/';

  // Toggle modes
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const translateAuthError = (message) => {
    if (!message) return 'אירעה שגיאה בלתי צפויה. נא לנסות שנית.';
    
    const msg = message.toLowerCase();
    
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'כתובת האימייל או הסיסמה אינם נכונים.';
    }
    if (msg.includes('user already registered') || msg.includes('email already exists') || msg.includes('already exists')) {
      return 'כתובת אימייל זו כבר רשומה במערכת.';
    }
    if (msg.includes('password should be at least 6 characters') || msg.includes('password is too short')) {
      return 'הסיסמה חייבת להכיל לפחות 6 תווים.';
    }
    if (msg.includes('email address is invalid') || msg.includes('invalid email')) {
      return 'כתובת האימייל שהזנת אינה תקינה.';
    }
    if (msg.includes('too many requests') || msg.includes('too_many_requests') || msg.includes('rate limit')) {
      return 'בוצעו יותר מדי ניסיונות הרשמה בזמן קצר. אנא המתינו מספר דקות ונסו שוב.';
    }
    if (msg.includes('email not confirmed') || msg.includes('confirm your email')) {
      return 'יש לאשר את כתובת האימייל בתיבת הדואר שלך לפני ההתחברות.';
    }
    if (msg.includes('network error') || msg.includes('failed to fetch')) {
      return 'שגיאת חיבור לרשת. אנא בדקו את החיבור לאינטרנט.';
    }
    
    return `שגיאה: ${message}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        await loginUser(email, password);
        navigate(from, { replace: true });
      } else {
        if (!fullName || !phone || !password || !email) {
          setError('אנא מלאו את כל שדות החובה.');
          return;
        }
        const { session } = await registerUser({
          fullName,
          email,
          phone,
          password,
          avatarUrl
        });

        if (!session) {
          setEmailSentSuccess(true);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(translateAuthError(err.message));
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);

    if (!email) {
      setError('אנא הזינו את כתובת האימייל שלכם.');
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setResetSuccess(true);
    } catch (err) {
      setError(translateAuthError(err.message));
    }
  };

  if (emailSentSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-primary/10 shadow-premium overflow-hidden p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Mail size={32} className="text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="font-playfair text-2xl font-bold text-text-dark">הרשמה בוצעה בהצלחה!</h2>
            <p className="text-sm text-secondary leading-relaxed">
              שלחנו אימייל אישור לכתובת <strong>{email}</strong>.
            </p>
          </div>
          <div className="bg-bg-warm p-4 rounded-2xl border border-primary/5 text-right space-y-2 text-xs text-text-dark">
            <p className="font-semibold text-center text-accent">⚠️ שלב אחרון להתחברות:</p>
            <p className="leading-relaxed text-secondary text-center">
              יש להיכנס לתיבת המייל שלך, לפתוח את ההודעה מ-SecondWear וללחוץ על הקישור לאישור החשבון. לאחר מכן תוכלי להתחבר בהצלחה!
            </p>
          </div>
          <button
            onClick={() => { setEmailSentSuccess(false); setIsLoginMode(true); setError(''); }}
            className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer"
          >
            חזרה להתחברות
          </button>
        </div>
      </div>
    );
  }

  if (isResetMode) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-primary/10 shadow-premium overflow-hidden p-6 sm:p-8 space-y-6 text-right">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-2xl font-bold text-text-dark">איפוס סיסמה</h2>
            <p className="text-xs text-secondary">הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס</p>
          </div>

          {error && (
            <div className="bg-error-soft/10 border border-error-soft/20 text-error-soft p-3.5 rounded-xl text-xs flex items-center gap-2 justify-end">
              <span>{error}</span>
              <AlertCircle size={16} className="shrink-0" />
            </div>
          )}

          {resetSuccess ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-emerald-800 text-sm">הקישור נשלח בהצלחה!</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  שלחנו קישור לאיפוס הסיסמה לכתובת <strong>{email}</strong>.<br />
                  אנא בדקו את תיבת הדואר שלכם (וגם את תיקיית הספאם).
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setResetSuccess(false); setError(''); }}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl text-xs font-semibold transition-custom cursor-pointer mt-4"
              >
                חזרה להתחברות
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">כתובת אימייל *</label>
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

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer mt-2"
              >
                שלח קישור לאיפוס סיסמה
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsResetMode(false); setError(''); }}
                  className="text-xs text-secondary hover:text-text-dark font-medium transition-custom cursor-pointer"
                >
                  חזרה להתחברות
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-text-dark">סיסמה *</label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => { setIsResetMode(true); setError(''); }}
                    className="text-xs text-accent hover:text-accent-hover font-semibold transition-custom cursor-pointer"
                  >
                    שכחת סיסמה?
                  </button>
                )}
              </div>
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
