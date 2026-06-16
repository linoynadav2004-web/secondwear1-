import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UploadZone from '../components/UploadZone';
import { Clock, CheckCircle, Smartphone, User, FileText, ChevronLeft, ShieldCheck, Mail, Lock, KeyRound, Check, AlertCircle } from 'lucide-react';

export default function MyListingsPage() {
  const { products, currentUser, getUserById, approvePayment, updateUserProfile, updateUserEmail, updateUserPassword, deleteProduct } = useApp();
  const [activeTab, setActiveTab] = useState('selling'); // 'selling', 'bought', or 'settings'
  const [selectedReceipt, setSelectedReceipt] = useState(null); // zoom receipt modal state

  // Settings form states
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    avatarUrl: currentUser?.avatar_url || ''
  });
  const [useAvatarUrl, setUseAvatarUrl] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: currentUser?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Sync state if currentUser changes (e.g. after refresh/login)
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.full_name || '',
        phone: currentUser.phone || '',
        avatarUrl: currentUser.avatar_url || ''
      });
      setEmailForm({
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    if (!profileForm.fullName.trim() || !profileForm.phone.trim()) {
      setProfileMsg({ type: 'error', text: 'נא למלא שם מלא ומספר טלפון.' });
      return;
    }
    setIsProfileSaving(true);
    try {
      await updateUserProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'הפרטים האישיים עודכנו בהצלחה!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: `שגיאה בעדכון הפרטים: ${err.message}` });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ type: '', text: '' });
    if (!emailForm.email.trim()) {
      setEmailMsg({ type: 'error', text: 'נא להזין כתובת דוא"ל תקינה.' });
      return;
    }
    setIsEmailSaving(true);
    try {
      await updateUserEmail(emailForm.email.trim());
      setEmailMsg({ type: 'success', text: 'כתובת הדוא"ל עודכנה בהצלחה!' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: `שגיאה בעדכון הדוא"ל: ${err.message}` });
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (passwordForm.password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'הסיסמה החדשה חייבת להיות באורך של לפחות 6 תווים.' });
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'הסיסמאות שהזנת אינן תואמות.' });
      return;
    }
    setIsPasswordSaving(true);
    try {
      await updateUserPassword(passwordForm.password);
      setPasswordMsg({ type: 'success', text: 'הסיסמה עודכנה בהצלחה!' });
      setPasswordForm({ password: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: `שגיאה בעדכון הסיסמה: ${err.message}` });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Filter listings where user is the seller
  const mySellListings = products.filter((p) => p.user_id === currentUser.id);

  // Filter items bought by current user
  const myBuyListings = products.filter((p) => p.buyer_id === currentUser.id);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_fee_approval':
        return { text: 'ממתין לעמלת פרסום', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'active':
        return { text: 'פעיל למכירה', color: 'bg-success-soft/10 text-success-soft border-success-soft/20' };
      case 'pending_payment_approval':
        return { text: 'ממתין לאישור תשלום', color: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' };
      case 'sold':
        return { text: 'נמכר בהצלחה', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { text: 'סטטוס לא ידוע', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header and User profile card */}
      <div className="bg-white rounded-3xl p-6 border border-primary/5 shadow-premium flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-right">
          {currentUser.avatar_url ? (
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.full_name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-accent"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent border-2 border-accent flex items-center justify-center font-bold text-xl">
              {currentUser.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h1 className="font-playfair text-2xl font-bold text-text-dark">{currentUser.full_name}</h1>
            <p className="text-secondary text-sm">{currentUser.email} | {currentUser.phone}</p>
          </div>
        </div>
        
        <div className="bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/10 text-xs text-text-dark text-center sm:text-right max-w-xs leading-relaxed">
          <strong>אזור שלי:</strong> עמוד זה מציג את הפריטים שפרסמת או רכשת. כשאדם רוכש פריט שלך, תראי כאן את הוכחת התשלום שלו ותוכלי לאשר אותה.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/10">
        <button
          onClick={() => setActiveTab('selling')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-custom cursor-pointer ${
            activeTab === 'selling' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-secondary hover:text-text-dark'
          }`}
        >
          הפריטים שלי למכירה ({mySellListings.length})
        </button>
        <button
          onClick={() => setActiveTab('bought')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-custom cursor-pointer ${
            activeTab === 'bought' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-secondary hover:text-text-dark'
          }`}
        >
          רכישות שלי ({myBuyListings.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-custom cursor-pointer ${
            activeTab === 'settings' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-secondary hover:text-text-dark'
          }`}
        >
          הגדרות פרופיל
        </button>
      </div>

      {/* Main Area */}
      {activeTab === 'selling' && (
        <div className="space-y-6">
          {mySellListings.length === 0 ? (
            <div className="bg-white rounded-2xl py-12 px-4 text-center border max-w-md mx-auto">
              <p className="text-secondary text-sm">לא העלית פריטים למכירה עדיין.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {mySellListings.map((product) => {
                const badge = getStatusLabel(product.status);
                const buyer = product.buyer_id ? getUserById(product.buyer_id) : null;
                
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-2xl border border-primary/10 shadow-premium p-5 flex flex-col md:flex-row gap-6 justify-between items-stretch transition-custom hover:border-primary/20"
                  >
                    {/* Left side: Product Info */}
                    <div className="flex gap-4">
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-20 h-24 object-cover rounded-xl border bg-bg-warm"
                      />
                      <div className="text-right flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-text-dark text-base">{product.title}</h3>
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-xs text-secondary mt-1.5 line-clamp-1">{product.description}</p>
                        </div>
                        <div className="text-sm font-bold text-text-dark mt-2">₪{product.price}</div>
                      </div>
                    </div>

                    {/* Right side: Action Context or Payment Verification (Main Flow Step C) */}
                    <div className="md:w-1/2 flex flex-col justify-center border-t md:border-t-0 md:border-r border-primary/10 pt-4 md:pt-0 md:pr-6 space-y-4">
                      
                      {product.status === 'pending_fee_approval' && (
                        <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-800 space-y-1">
                          <p className="font-bold">עמלת העלאה ממתינה לאישור:</p>
                          <p className="leading-relaxed">העברת בהצלחה את ה-10 ש״ח למנהל. ברגע שהוא יאשר זאת, הפריט יהיה גלוי לכולם.</p>
                        </div>
                      )}

                      {product.status === 'active' && (
                        <div className="bg-success-soft/5 rounded-xl p-3.5 border border-success-soft/20 text-xs text-success-soft">
                          <p className="font-semibold">הפריט מוצג כעת למכירה בקטלוג.</p>
                          <p className="text-secondary mt-1">אנו נעדכן אותך כאן ברגע שמישהו ירכוש אותו!</p>
                        </div>
                      )}

                      {product.status === 'sold' && (
                        <div className="bg-green-50 rounded-xl p-3.5 border border-green-200 text-xs text-green-800 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <CheckCircle size={14} />
                            <span>העסקה הושלמה בהצלחה!</span>
                          </p>
                          <p className="text-secondary">המוצר נמכר ל-{buyer?.full_name}.</p>
                        </div>
                      )}

                      {/* Delete button option */}
                      {(product.status === 'active' || product.status === 'pending_fee_approval') && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`האם את בטוחה שברצונך למחוק את הפריט "${product.title}"?`)) {
                              try {
                                await deleteProduct(product.id);
                              } catch (err) {
                                alert(`שגיאה במחיקת המוצר: ${err.message}`);
                              }
                            }
                          }}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition-custom cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>מחיקת פריט</span>
                        </button>
                      )}

                      {/* Main Flow: Seller Approves Payment (Step C) */}
                      {product.status === 'pending_payment_approval' && buyer && (
                        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200 space-y-4">
                          <div className="text-xs space-y-1.5 text-text-dark">
                            <h4 className="font-bold text-blue-900 text-sm">התקבל תשלום מהקונה!</h4>
                            <p><strong>קונה:</strong> {buyer.full_name} ({buyer.phone})</p>
                            <p><strong>סכום שהועבר:</strong> ₪{(product.price * 1.10).toFixed(2)} (כולל 10% עמלה)</p>
                            <p><strong>אמצעי העברה:</strong> {product.payment_method === 'bit' ? 'Bit' : 'PayBox'}</p>
                          </div>

                          {/* Show Buyer's receipt screenshot */}
                          {product.payment_proof_url && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedReceipt(product.payment_proof_url)}
                                className="w-full bg-white hover:bg-bg-warm text-text-dark text-xs border border-primary/20 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-custom cursor-pointer"
                              >
                                <FileText size={14} className="text-accent" />
                                <span>צפייה בצילום מסך האסמכתא</span>
                              </button>
                            </div>
                          )}

                          {/* Action Button: Seller approves payment receipt */}
                          <div>
                            <button
                              onClick={() => approvePayment(product.id)}
                              className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl text-xs font-bold transition-custom shadow-md hover:scale-[1.01] cursor-pointer"
                            >
                              אשר קבלת תשלום
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bought' && (
        <div className="space-y-6">
          {myBuyListings.length === 0 ? (
            <div className="bg-white rounded-2xl py-12 px-4 text-center border max-w-md mx-auto">
              <p className="text-secondary text-sm">טרם רכשת מוצרים באתר.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myBuyListings.map((product) => {
                const badge = getStatusLabel(product.status);
                const seller = getUserById(product.user_id);
                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl border border-primary/5 shadow-premium overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/5] bg-bg-warm">
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-white ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow text-right">
                      <h3 className="font-bold text-text-dark text-sm">{product.title}</h3>
                      <p className="text-xs text-secondary mt-1">מוכר/ת: {seller?.full_name}</p>
                      <p className="text-xs text-secondary">טלפון: {seller?.phone}</p>
                      
                      <div className="mt-auto pt-4 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-secondary block">סכום ששולם</span>
                          <span className="font-bold text-text-dark text-base">₪{(product.price * 1.1).toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] italic text-secondary">באישור מול המוכר</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
          
          {/* Card 1: Personal Details */}
          <div className="bg-white rounded-3xl p-6 border border-primary/10 shadow-premium space-y-6">
            <div>
              <h3 className="font-playfair text-xl font-bold text-text-dark flex items-center gap-2 justify-end">
                <span>עדכון פרטים אישיים</span>
                <User size={20} className="text-accent" />
              </h3>
              <p className="text-secondary text-xs mt-1 font-light">שם מלא, מספר טלפון ותמונת פרופיל</p>
            </div>

            {profileMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === 'success' 
                  ? 'bg-success-soft/10 text-success-soft border border-success-soft/20' 
                  : 'bg-error-soft/10 text-error-soft border border-error-soft/20'
              }`}>
                {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark">שם מלא</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="הזינו שם מלא"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark">מספר טלפון להעברות (Bit/PayBox)</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="לדוגמה: 050-1234567"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                  required
                />
              </div>

              {/* Avatar upload or URL */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-text-dark">תמונת פרופיל</label>
                
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setUseAvatarUrl(false); setProfileForm({ ...profileForm, avatarUrl: '' }); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-custom cursor-pointer ${
                      !useAvatarUrl 
                        ? 'bg-accent text-white shadow-sm' 
                        : 'bg-primary/5 text-text-dark hover:bg-primary/10'
                    }`}
                  >
                    העלאת קובץ תמונה
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseAvatarUrl(true); setProfileForm({ ...profileForm, avatarUrl: '' }); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-custom cursor-pointer ${
                      useAvatarUrl 
                        ? 'bg-accent text-white shadow-sm' 
                        : 'bg-primary/5 text-text-dark hover:bg-primary/10'
                    }`}
                  >
                    הזנת קישור (URL)
                  </button>
                </div>

                {useAvatarUrl ? (
                  <input
                    type="url"
                    value={profileForm.avatarUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                    placeholder="הדביקו קישור לתמונת פרופיל (URL)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                  />
                ) : (
                  <UploadZone
                    label=""
                    description="גררו קובץ תמונה או לחצו לבחירה"
                    onUploadSuccess={(url) => setProfileForm({ ...profileForm, avatarUrl: url })}
                  />
                )}

                {profileForm.avatarUrl && (
                  <div className="flex items-center gap-3 mt-3 justify-end">
                    <span className="text-[10px] text-secondary">תצוגה מקדימה של התמונה:</span>
                    <img 
                      src={profileForm.avatarUrl} 
                      alt="פרופיל" 
                      className="w-10 h-10 rounded-full object-cover border border-primary/10"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'; }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProfileSaving}
                className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl text-sm font-semibold transition-custom shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isProfileSaving ? 'שומר פרטים...' : 'שמור שינויים'}
              </button>
            </form>
          </div>

          {/* Card 2: Account Credentials (Email / Password) */}
          <div className="space-y-6">
            
            {/* Email form */}
            <div className="bg-white rounded-3xl p-6 border border-primary/10 shadow-premium space-y-4">
              <div>
                <h3 className="font-playfair text-lg font-bold text-text-dark flex items-center gap-2 justify-end">
                  <span>עדכון כתובת דוא"ל</span>
                  <Mail size={18} className="text-accent" />
                </h3>
                <p className="text-secondary text-[11px] mt-0.5 font-light">שינוי כתובת הדוא"ל לשחזור וכניסה</p>
              </div>

              {emailMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  emailMsg.type === 'success' 
                    ? 'bg-success-soft/10 text-success-soft border border-success-soft/20' 
                    : 'bg-error-soft/10 text-error-soft border border-error-soft/20'
                }`}>
                  {emailMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{emailMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmail} className="space-y-3">
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ email: e.target.value })}
                  placeholder="הזינו אימייל חדש"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                  required
                />
                <button
                  type="submit"
                  disabled={isEmailSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-xl text-xs font-semibold transition-custom cursor-pointer"
                >
                  {isEmailSaving ? 'מעדכן אימייל...' : 'עדכן כתובת דוא"ל'}
                </button>
              </form>
            </div>

            {/* Password form */}
            <div className="bg-white rounded-3xl p-6 border border-primary/10 shadow-premium space-y-4">
              <div>
                <h3 className="font-playfair text-lg font-bold text-text-dark flex items-center gap-2 justify-end">
                  <span>שינוי סיסמה</span>
                  <Lock size={18} className="text-accent" />
                </h3>
                <p className="text-secondary text-[11px] mt-0.5 font-light">עדכון סיסמת החשבון (מינימום 6 תווים)</p>
              </div>

              {passwordMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMsg.type === 'success' 
                    ? 'bg-success-soft/10 text-success-soft border border-success-soft/20' 
                    : 'bg-error-soft/10 text-error-soft border border-error-soft/20'
                }`}>
                  {passwordMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="סיסמה חדשה"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="אימות סיסמה חדשה"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-xl text-xs font-semibold transition-custom cursor-pointer"
                >
                  {isPasswordSaving ? 'מעדכן סיסמה...' : 'עדכן סיסמה'}
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* Click-to-Zoom Receipt Lightbox Modal */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 relative space-y-3 cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-primary/5 pb-2">
              <h3 className="font-semibold text-xs text-text-dark">אסמכתת תשלום (צילום מסך)</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-secondary hover:text-text-dark text-xs cursor-pointer"
              >
                סגור
              </button>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border bg-bg-warm">
              <img 
                src={selectedReceipt} 
                alt="צילום מסך אסמכתת תשלום" 
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-[10px] text-secondary text-center">
              לחצו מחוץ לחלונית כדי לחזור
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
