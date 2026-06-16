import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { updateUserPassword } = useApp();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'אירעה שגיאה בעדכון הסיסמה. אנא נסו שנית.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-primary/10 shadow-premium overflow-hidden p-6 sm:p-8 space-y-6 text-right">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="font-playfair text-2xl font-bold text-text-dark">
            בחירת סיסמה חדשה
          </h2>
          <p className="text-xs text-secondary">
            הזינו את הסיסמה החדשה שלכם עבור החשבון
          </p>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-emerald-800 text-sm">הסיסמה עודכנה בהצלחה!</h3>
              <p className="text-xs text-secondary">מיד תועברו לעמוד הבית...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-error-soft/10 border border-error-soft/20 text-error-soft p-3.5 rounded-xl text-xs flex items-center gap-2 justify-end">
                <span>{error}</span>
                <AlertCircle size={16} className="shrink-0" />
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-dark">סיסמה חדשה *</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-dark">אימות סיסמה חדשה *</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 text-secondary" size={16} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'מעדכן סיסמה...' : 'עדכון סיסמה וכניסה'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
