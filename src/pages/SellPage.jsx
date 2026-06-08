import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UploadZone from '../components/UploadZone';
import { AlertCircle, ArrowLeft, Landmark, CheckCircle, ShieldAlert } from 'lucide-react';

export default function SellPage() {
  const { categories, addProduct } = useApp();
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Publication Fee Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feeProofUrl, setFeeProofUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validate basic form before opening fee modal
  const handleOpenFeeModal = (e) => {
    e.preventDefault();
    if (!title || !price || !categoryId) {
      alert('נא למלא שדות חובה: כותרת, מחיר וקטגוריה.');
      return;
    }
    setIsModalOpen(true);
  };

  // Final submission from inside modal
  const handleFinalSubmit = () => {
    if (!feeProofUrl) return;

    // Use default premium clothes fallback images if user hasn't provided a valid image URL
    const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80';

    addProduct({
      title,
      description,
      price,
      categoryId,
      imageUrl: finalImageUrl,
      feeProofUrl
    });

    setIsModalOpen(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-success-soft/10 text-success-soft rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={44} />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold text-text-dark">המוצר הועלה בהצלחה!</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-premium text-right space-y-4">
          <p className="text-sm text-text-dark leading-relaxed">
            הפריט <strong className="text-primary">"{title}"</strong> נרשם במערכת בסטטוס:
          </p>
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>ממתין לאישור עמלת פרסום (pending_fee_approval)</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            מאחר וסיימת להעלות את צילום מסך האסמכתא על סך 10 ש״ח, מנהלי האתר יאשרו את הפריט בקרוב והוא יופיע למכירה.
          </p>
          <div className="bg-primary/5 p-3.5 rounded-lg border border-primary/10 text-[11px] text-text-dark/95">
            💡 <strong>הערה:</strong> הפריט הועבר לבדיקה מהירה של מנהל האתר. תוך מספר שניות הוא יאושר אוטומטית ויוצג בקטלוג הראשי.
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl text-sm font-semibold transition-custom cursor-pointer"
          >
            חזרה לדף הבית
          </button>
          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setPrice('');
              setCategoryId('');
              setImageUrl('');
              setFeeProofUrl('');
              setIsSubmitted(false);
            }}
            className="bg-white hover:bg-bg-warm text-text-dark border border-primary/20 px-6 py-3 rounded-xl text-sm font-semibold transition-custom cursor-pointer"
          >
            פרסום פריט נוסף
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-text-dark">פרסום מוצר למכירה</h1>
          <p className="text-secondary text-sm mt-1">מלאו את פרטי הלבוש שלכם כדי למצוא לו קונה חדש</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-custom cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>חזרה לקטלוג</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form area */}
        <form onSubmit={handleOpenFeeModal} className="md:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-premium space-y-6">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text-dark mb-1.5">
              שם הפריט / כותרת <span className="text-error-soft">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: שמלת ערב ירוקה נצנצים במצב מעולה"
              className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-text-dark mb-1.5">
              תיאור הפריט
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספר/י על המידה, המותג, מצב הבגד, סיבת המכירה וכו׳"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-text-dark mb-1.5">
                מחיר מבוקש (₪) <span className="text-error-soft">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="לדוגמה: 120"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-text-dark mb-1.5">
                קטגוריה <span className="text-error-soft">*</span>
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom bg-white"
                required
              >
                <option value="">בחרו קטגוריה</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL Input */}
          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-text-dark mb-1.5">
              קישור לתמונת הפריט (URL)
            </label>
            <input
              type="url"
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="הדביקו קישור לתמונה או השאירו ריק להמחשה דיפולטיבית"
              className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
            />
            {imageUrl && (
              <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-secondary/20 shadow-sm">
                <img src={imageUrl} alt="תצוגה מקדימה" className="object-cover w-full h-full" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'; }} />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-semibold transition-custom shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer text-sm"
            >
              המשך לתשלום עמלת פרסום (10 ש״ח)
            </button>
          </div>
        </form>

        {/* Sidebar Info Guidelines */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-premium space-y-4">
            <h3 className="font-semibold text-text-dark text-sm border-b border-primary/5 pb-2">מדוע יש עמלת פרסום?</h3>
            <p className="text-secondary text-xs leading-relaxed">
              כדי להגן על לוח המכירות של SecondWear מפני ספאם ופרסומים מזויפים, וכן על מנת לתמוך בעלויות השרתים והתחזוקה, אנו גובים עמלה סמלית וקבועה של 10 ש״ח על כל העלאת פריט.
            </p>
            <div className="bg-primary/5 p-3.5 rounded-xl text-text-dark text-[11px] leading-relaxed">
              <strong>הנחיות למוכרים:</strong> לאחר קבלת העמלה הפריט שלך יעבור למצב פעיל. כשקונה ירכוש את הפריט, הוא ישלם לך ישירות את סכום הפריט המלא בתוספת 10% עמלה.
            </div>
          </div>
        </div>
      </div>

      {/* Main Flow Step A: Publication Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-primary/10 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <Landmark size={24} />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-text-dark">עמלת פרסום קבועה: ₪10</h2>
              <p className="text-secondary text-xs mt-1">אנא העבירו את דמי הפרסום לקבלת אישור הפעלה מיידי</p>
            </div>

            {/* Instruction Details */}
            <div className="bg-bg-warm rounded-2xl p-5 border border-primary/5 space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-text-dark">
                <span className="font-medium">טלפון להעברה:</span>
                <span className="font-bold text-accent text-base tracking-wider">050-7778899</span>
              </div>
              <div className="flex justify-between items-center text-text-dark">
                <span className="font-medium">אפליקציות נתמכות:</span>
                <span className="font-semibold text-primary">Bit או PayBox</span>
              </div>
              <div className="h-px bg-primary/10"></div>
              <p className="text-xs text-secondary leading-relaxed">
                שלחו 10 ש״ח למספר לעיל באפליקציית bit או Paybox עם תיאור ״עמלת פרסום SecondWear״. צלמו מסך של אישור העברה והעלו אותו מטה כהוכחה.
              </p>
            </div>

            {/* Upload screenshot */}
            <div>
              <UploadZone
                label="העלו צילום מסך של האסמכתא"
                description="גררו את אישור ההעברה של ה-10 ש״ח (צילום מסך מתוך bit/paybox)"
                onUploadSuccess={(url) => setFeeProofUrl(url)}
                required={true}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!feeProofUrl}
                className={`flex-grow py-3 rounded-xl font-semibold text-sm transition-custom shadow-sm cursor-pointer ${
                  feeProofUrl 
                    ? 'bg-accent hover:bg-accent-hover text-white hover:scale-[1.01]' 
                    : 'bg-secondary/20 text-secondary cursor-not-allowed'
                }`}
              >
                שלח פריט לאישור פרסום
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 bg-white border border-primary/20 text-text-dark rounded-xl text-sm font-semibold hover:bg-bg-warm transition-custom cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
