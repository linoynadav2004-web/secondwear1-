import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UploadZone from '../components/UploadZone';
import CityInput from '../components/CityInput';
import { AlertCircle, ArrowLeft, CreditCard, CheckCircle, ShieldAlert, Lock, Loader2, Sparkles } from 'lucide-react';

export default function SellPage() {
  const { categories, addProduct } = useApp();
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [city, setCity] = useState('');
  
  // Publication Fee Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // AI Description Generator State
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Generate description using Gemini AI
  const handleGenerateAiDescription = async () => {
    if (!title) {
      alert('נא להזין כותרת לפריט לפני שימוש במחולל ה-AI.');
      return;
    }
    
    setIsGeneratingDesc(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const categoryName = categories.find(c => c.id === categoryId)?.name || 'לבוש כללי';
    
    // Prepare prompt
    const promptText = `You are a creative marketing copywriter for "SecondWear", a Hebrew peer-to-peer second-hand clothing marketplace.
Write a short, engaging, and appealing description in Hebrew for a clothing item with these details:
- Title: "${title}"
- Category: "${categoryName}"

Your description must be highly inviting, positive, and formatted naturally for someone browsing a fashion board.
Focus on details like the design style, how it looks, and its appeal. 
Keep the text short (2-3 sentences max).
Do not include headings, introductions, markdown tags (like \`\`\` or similar), or notes. Respond ONLY with the description text itself in Hebrew.`;

    try {
      let replyText = "";
      
      // If we have an image uploaded as a Base64 string, let's pass it to Gemini Vision!
      let base64Data = "";
      let mimeType = "image/jpeg";
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const parts = imageUrl.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }

      if (apiKey) {
        let bodyData = {
          contents: [{
            parts: [{ text: promptText }]
          }]
        };

        // If base64 photo is available, use Gemini Vision analysis!
        if (base64Data) {
          bodyData.contents[0].parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          }
        );

        if (response.ok) {
          const resData = await response.json();
          replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          console.warn("Gemini description call failed, response status:", response.status);
        }
      }

      // Fallback simulation if no API key or failed call
      if (!replyText) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const fallbacks = [
          `פריט מדהים במצב מצוין! נלבש מעט מאוד ונשמר בארון בקפידה. מושלם ליומיום או לשילוב עם לוק חגיגי יותר. בד נעים מאוד ומחמיא לגוף.`,
          `מציאה שווה מהארון שלי! בגד איכותי, נוח ומאוד אופנתי. נמכר עקב חוסר שימוש ובמצב מעולה כמעט כמו חדש. כל הקודמת זוכה!`,
          `פריט הורס במצב מעולה, יושב מושלם ומאוד מחמיא. מתאים לעונה הנוכחית ויוסיף המון סטייל לכל אאוטפיט. גמישות קלה במחיר למציעים רציניים.`
        ];
        replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      setDescription(replyText.trim());
    } catch (err) {
      console.error(err);
      alert(`שגיאה ביצירת תיאור: ${err.message}`);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Validate basic form before opening fee modal
  const handleOpenFeeModal = (e) => {
    e.preventDefault();
    if (!title || !price || !categoryId) {
      alert('נא למלא שדות חובה: כותרת, מחיר וקטגוריה.');
      return;
    }
    if (!imageUrl) {
      alert('נא להעלות תמונת מוצר או להזין קישור לתמונה.');
      return;
    }
    setIsModalOpen(true);
  };

  // Final submission from inside modal (Credit Card payment simulation)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      alert('נא למלא את כל פרטי כרטיס האשראי.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate 2-second premium payment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Use default premium clothes fallback images if user hasn't provided a valid image URL
    const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80';

    const finalDescription = city ? `${description}\n\n📍 מיקום איסוף: ${city}` : description;

    try {
      await addProduct({
        title,
        description: finalDescription,
        price,
        categoryId,
        imageUrl: finalImageUrl
      });
      setIsModalOpen(false);
      setIsSubmitted(true);
    } catch (err) {
      alert(`שגיאה בתשלום או בפרסום המוצר: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-inter">
        <div className="w-20 h-20 bg-success-soft/10 text-success-soft rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={44} />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold text-text-dark">המוצר פורסם בהצלחה!</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-premium text-right space-y-4">
          <p className="text-sm text-text-dark leading-relaxed">
            הפריט <strong className="text-primary">"{title}"</strong> מפורסם כעת ופעיל באתר:
          </p>
          <div className="bg-success-soft/10 border border-success-soft/20 p-3.5 rounded-xl text-success-soft text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} />
            <span>פעיל ומפורסם בקטלוג (active)</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            עמלת הפרסום (10 ש״ח) שולמה בהצלחה באשראי מאובטח. הפריט שלך גלוי כעת לכל חברי הקהילה בקטלוג הראשי!
          </p>
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
              setCardName('');
              setCardNumber('');
              setCardExpiry('');
              setCardCvv('');
              setCity('');
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
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="description" className="block text-sm font-semibold text-text-dark">
                תיאור הפריט
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingDesc}
                className={`text-[10px] sm:text-xs font-bold text-accent hover:text-accent-hover transition-custom flex items-center gap-1 cursor-pointer bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/10 hover:bg-accent/10 ${
                  isGeneratingDesc ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingDesc ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-accent" />
                    <span>Gemini מנסח תיאור מוצר...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="animate-pulse text-accent" />
                    <span>לניסוח תיאור ב-AI ✨</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספר/י על המידה, המותג, מצב הבגד, סיבת המכירה וכו׳ (או היעזר/י במחולל ה-AI שלמעלה כדי לנסח בשבילך!)"
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

          {/* City Autocomplete field */}
          <div>
            <CityInput
              required
              value={city}
              onChange={setCity}
              placeholder="בחרו או הקלידו עיר איסוף..."
              label="עיר איסוף עצמי *"
            />
          </div>

          {/* Image Upload / URL Selector */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1.5">
              תמונת המוצר <span className="text-error-soft">*</span>
            </label>
            
            {/* Toggle tabs */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setUseUrl(false); setImageUrl(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-custom cursor-pointer ${
                  !useUrl 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'bg-primary/5 text-text-dark hover:bg-primary/10'
                }`}
              >
                העלאת קובץ תמונה
              </button>
              <button
                type="button"
                onClick={() => { setUseUrl(true); setImageUrl(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-custom cursor-pointer ${
                  useUrl 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'bg-primary/5 text-text-dark hover:bg-primary/10'
                }`}
              >
                הזנת קישור (URL)
              </button>
            </div>

            {useUrl ? (
              <div className="space-y-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="הדביקו קישור לתמונה (URL)"
                  className="w-full px-4 py-3 rounded-xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom"
                />
                {imageUrl && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-secondary/20 shadow-sm">
                    <img 
                      src={imageUrl} 
                      alt="תצוגה מקדימה" 
                      className="object-cover w-full h-full" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'; }} 
                    />
                  </div>
                )}
              </div>
            ) : (
              <UploadZone
                label=""
                description="גררו קובץ תמונה של הבגד או לחצו לבחירה"
                onUploadSuccess={(url) => setImageUrl(url)}
                required={true}
              />
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

      {/* Main Flow Step A: Credit Card Publication Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-primary/10 shadow-2xl relative space-y-6 animate-scale-up">
            
            {/* Modal Title */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard size={24} />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-text-dark">תשלום עמלת פרסום: ₪10</h2>
              <p className="text-secondary text-xs font-light">לפרסום מיידי של הפריט בקטלוג הקהילתי</p>
            </div>

            {/* Credit Card Details Form */}
            <form onSubmit={handleFinalSubmit} className="space-y-4 text-right">
              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark">שם בעל הכרטיס <span className="text-error-soft">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="ישראל ישראלי"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark">מספר כרטיס אשראי <span className="text-error-soft">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4580 1234 5678 9012"
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      let matches = val.match(/\d{4,16}/g);
                      let match = (matches && matches[0]) || '';
                      let parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(' '));
                      } else {
                        setCardNumber(val);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-left tracking-widest font-mono"
                    style={{ direction: 'ltr' }}
                  />
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 text-secondary">
                    <CreditCard size={16} />
                  </div>
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-dark">תוקף <span className="text-error-soft">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length >= 2) {
                        setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                      } else {
                        setCardExpiry(val);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-center font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-dark">CVV <span className="text-error-soft">*</span></label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength="3"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-center font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* Security info note */}
              <div className="bg-primary/5 p-3 rounded-xl flex items-center justify-between text-[10px] text-secondary">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-success-soft" />
                  חיבור מוצפן ומאובטח SSL (מצב דמו)
                </span>
                <span className="font-bold text-text-dark">₪10.00 לתשלום</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-grow py-3 rounded-xl font-semibold text-sm transition-custom shadow-sm cursor-pointer flex items-center justify-center gap-2 text-white ${
                    isProcessing 
                      ? 'bg-accent/70 cursor-not-allowed' 
                      : 'bg-accent hover:bg-accent-hover'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>מעבד תשלום מאובטח...</span>
                    </>
                  ) : (
                    <span>שלם ₪10 ופרסם</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                  className="px-5 py-3 bg-white border border-primary/20 text-text-dark rounded-xl text-sm font-semibold hover:bg-bg-warm transition-custom cursor-pointer"
                >
                  ביטול
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
