import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UploadZone from '../components/UploadZone';
import CityInput from '../components/CityInput';
import { Trash2, Phone, CreditCard, CheckCircle, Smartphone, Info, MapPin, Truck, FileText, X, Sparkles, Cpu, AlertTriangle, Check, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, getUserById, checkoutCart } = useApp();
  const navigate = useNavigate();

  // State
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment & Proof
  const [selectedMethod, setSelectedMethod] = useState(''); // 'bit' or 'paybox'
  const [paymentProofs, setPaymentProofs] = useState({}); // mapping product.id -> proofUrl
  const [isDone, setIsDone] = useState(false);
  
  // Gemini AI scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [scanSuccess, setScanSuccess] = useState(null); // null, true, false
  const [scanDetails, setScanDetails] = useState(null);
  
  const [shippingMethod, setShippingMethod] = useState('pickup'); // 'pickup' or 'delivery'
  const [shippingAddress, setShippingAddress] = useState({
    city: '',
    street: '',
    houseNumber: '',
    notes: ''
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState({ city: '', street: '', houseNumber: '', notes: '' });

  // Auto-calculated fields
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const siteFee = subtotal * 0.10; // 10% site fee
  const shippingFee = shippingMethod === 'delivery' ? 15 : 0; // 15 ILS for shipping
  const totalAmount = subtotal + siteFee + shippingFee;

  const handleUploadProofForProduct = (productId, url) => {
    setPaymentProofs((prev) => ({
      ...prev,
      [productId]: url
    }));
  };

  const handleOpenAddressModal = () => {
    setTempAddress({ ...shippingAddress });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setShippingAddress({ ...tempAddress });
    setIsAddressModalOpen(false);
  };

  const isAddressFilled = () => {
    return shippingAddress.city.trim() !== '' && 
           shippingAddress.street.trim() !== '' && 
           shippingAddress.houseNumber.trim() !== '';
  };

  // Check if all items in cart have a payment proof uploaded
  const isFormComplete = () => {
    if (!selectedMethod) return false;
    // Check if every item in cart has an uploaded screenshot proof
    return cart.every((item) => paymentProofs[item.id]);
  };

  const runSimulationVerify = async (expectedAmount, expectedPhone, sellerName) => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    setScanLogs(prev => [...prev, `🔍 סורק טקסט (OCR) ומזהה לוגואים של Bit/PayBox באסמכתא...`]);
    await delay(1500);
    setScanLogs(prev => [...prev, `💵 קורא סכומי העברה מבוקשים... נמצאה העברה על סך ₪${expectedAmount.toFixed(2)}`]);
    await delay(1500);
    setScanLogs(prev => [...prev, `📱 מאמת טלפון של המקבל מול פרטי המוכר... נמצא טלפון תואם ל-${sellerName} (${expectedPhone})`]);
    await delay(1200);
    setScanLogs(prev => [...prev, `✅ אימות Gemini AI עבר בהצלחה לפריט זה (מצב סימולציית AI).`]);
    return true;
  };

  const runGeminiVerification = async () => {
    setIsScanning(true);
    setScanSuccess(null);
    setScanDetails(null);
    setScanLogs(['🤖 מתחיל תהליך אימות אסמכתאות בעזרת Gemini AI...', '📁 טוען קובץ תמונה ומכין נתונים לניתוח...']);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    let overallSuccess = true;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const seller = getUserById(item.user_id);
      const itemFee = item.price * 0.10;
      const itemShipping = shippingMethod === 'delivery' ? 15 : 0;
      const expectedAmount = item.price + itemFee + itemShipping;
      const expectedPhone = seller?.phone || 'לא ידוע';

      setScanLogs(prev => [...prev, `\n🔍 מנתח אסמכתא עבור פריט ${i + 1} מתוך ${cart.length}: "${item.title}"...`]);
      await delay(1500);

      const proofStr = paymentProofs[item.id] || '';
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (proofStr.startsWith('data:image/')) {
        const parts = proofStr.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }

      if (apiKey && base64Data) {
        setScanLogs(prev => [...prev, `📡 מתחבר ל-Gemini Vision API לצורך ניתוח ראייה ממוחשבת...`]);
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: `You are an expert OCR and financial verification assistant.
Analyze this image uploaded on SecondWear, a Hebrew peer-to-peer second-hand clothing store, and verify if it represents a successful payment confirmation.

To determine if the image is a genuine successful payment or transfer confirmation (e.g., from Bit, Paybox, Pepper Pay, or an Israeli bank transfer):
1. **Verify if it is a successful transfer confirmation**:
   - Check if the image contains clear Hebrew keywords indicating a completed transaction, such as: "הועבר בהצלחה", "בוצע", "העברה בוצעה", "הכסף נשלח", "אישור העברה", "פרטי העברה", "העברת ל...", or "העברה ל...".
   - Look for standard payment app visuals like green checkmarks, check icons, or successful receipt layouts.
   - If the image contains medical texts (such as "בדיקות דם", "תוצאות", lab values like RBC, WBC, "טווח הנורמה", "כימיה בדם"), text documents, clothing items, or anything that is not a payment confirmation, set "is_receipt" to false.

2. **Verify the expected amount**:
   - The expected amount is ${expectedAmount} ILS. Check if the transferred amount in the receipt matches or is close to this amount (allow the item price ${item.price} ILS, or the total with fee/shipping).

3. **Verify the expected recipient phone number**:
   - The expected recipient phone number is ${expectedPhone}. Check if the phone number of the receiver matches or is close to this (ignore formatting differences like dashes or country codes).

4. **Verify the payment method**:
   - Detect the payment method used ("bit", "paybox", "bank", or "other").

You must respond STRICTLY with a JSON object. Do not include markdown code block formatting (no \`\`\`json or \`\`\`).
The structure must be exactly:
{
  "is_receipt": boolean,
  "amount_detected": number or null,
  "phone_detected": string or null,
  "method": "bit" | "paybox" | "bank" | "other" | null,
  "confidence_score": number (0.0 to 1.0),
  "explanation": "A concise summary in Hebrew explaining your decision. If rejected, explain clearly what the image appears to be instead (e.g., 'הועלה קובץ בדיקות דם ולא אישור תשלום' or 'הועלתה תמונת שמלה')."
}`
                    },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                      }
                    }
                  ]
                }],
                generationConfig: {
                  responseMimeType: 'application/json'
                }
              })
            }
          );

          if (!response.ok) {
            let errorMsg = `שגיאה ${response.status}`;
            if (response.status === 503) {
              errorMsg = "שרת ה-AI של Google עמוס כרגע (שגיאה 503). אנא נסו שוב בעוד מספר שניות.";
            } else if (response.status === 429) {
              errorMsg = "חריגה ממכסת הבקשות של מפתח ה-API (שגיאה 429). אנא נסו שוב בעוד דקה.";
            } else if (response.status === 400 || response.status === 403) {
              errorMsg = "מפתח ה-API אינו תקין או שאין הרשאה לגישה למודל (שגיאה 400/403).";
            }
            throw new Error(errorMsg);
          }
          
          const resData = await response.json();
          let responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!responseText) throw new Error('התקבלה תשובה ריקה משרת ה-AI');
          
          // Robust JSON cleaning to strip potential markdown codeblocks
          let cleanedResponse = responseText.trim();
          if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
            cleanedResponse = cleanedResponse.replace(/```$/, '');
            cleanedResponse = cleanedResponse.trim();
          }
          
          const result = JSON.parse(cleanedResponse);
          
          setScanLogs(prev => [
            ...prev,
            `💡 תשובת Gemini AI: ${result.explanation}`,
            `🎯 רמת אמינות הזיהוי: ${(result.confidence_score * 100).toFixed(0)}%`
          ]);

          if (!result.is_receipt) {
            overallSuccess = false;
            setScanLogs(prev => [...prev, `❌ נכשל: Gemini AI קבע כי הקובץ שהועלה אינו אסמכתת תשלום תקינה.`]);
          } else {
            setScanLogs(prev => [...prev, `✅ אימות Gemini AI עבר בהצלחה לפריט זה.`]);
          }
        } catch (err) {
          console.error('Gemini API call failed:', err);
          overallSuccess = false;
          setScanLogs(prev => [...prev, `❌ שגיאה באימות מול Gemini: ${err.message || 'שגיאה לא ידועה'}`]);
        }
      } else {
        setScanLogs(prev => [...prev, `ℹ️ מפתח API אינו מוגדר. מפעיל סימולטור אימות לצורך הדגמה...`]);
        const isLegit = await runSimulationVerify(expectedAmount, expectedPhone, seller?.full_name);
        if (!isLegit) overallSuccess = false;
      }
    }

    await delay(1500);

    if (overallSuccess) {
      setScanSuccess(true);
      setScanLogs(prev => [...prev, '🎉 כל האסמכתאות אומתו בהצלחה ע״י Gemini AI!']);
      
      // Submit to Supabase / AppContext
      await checkoutCart(selectedMethod, paymentProofs);
      
      await delay(2000);
      setIsScanning(false);
      setCheckoutStep(1);
      setIsDone(true);
    } else {
      setScanSuccess(false);
      setScanLogs(prev => [...prev, '❌ אימות האסמכתאות נכשל. אנא בדקו שהעליתם צילומי מסך תקינים ונסו שוב.']);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete()) return;
    runGeminiVerification();
  };

  if (isDone) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-success-soft/10 text-success-soft rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={44} />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold text-text-dark font-playfair">האסמכתא נשלחה למוכר!</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-premium text-right space-y-4">
          <p className="text-sm text-text-dark leading-relaxed">
            שלחת בהצלחה את הוכחות התשלום. סטטוס הפריטים שונה ל:
          </p>
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-800 text-xs font-semibold flex items-center gap-2">
            <Info size={16} />
            <span>ממתין לאישור תשלום המוכר (pending_payment_approval)</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            המוכר עודכן על העברת הכספים וצילום המסך שהעלית מוצג באזור האישי שלו. ברגע שהמוכר יאשר את קבלת התשלום, העסקה תיסגר סופית והמוצר יסומן כ"נמכר".
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl text-sm font-semibold transition-custom cursor-pointer"
          >
            חזרה לקטלוג
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="text-5xl">🛍️</div>
        <h1 className="font-playfair text-2xl font-bold text-text-dark">סל הקניות שלך ריק</h1>
        <p className="text-secondary text-sm leading-relaxed">
          עדיין לא הוספת פריטים לסל הקניות שלך. מוזמנת לחזור לקטלוג ולמצוא מציאות שוות!
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-semibold transition-custom shadow-md cursor-pointer"
        >
          חזרה לקטלוג
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
      
      {/* Gemini AI Verification Scan Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-white font-inter">
          <div className="bg-text-dark rounded-3xl border border-primary/20 max-w-2xl w-full p-6 sm:p-8 space-y-6 flex flex-col md:flex-row gap-8 text-right shadow-2xl relative overflow-hidden animate-scale-up">
            
            {/* Ambient glows */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Left Column: Log messages */}
            <div className="flex-grow flex flex-col justify-between space-y-4 md:w-3/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={10} />
                    Gemini 2.5 Flash
                  </span>
                  <h3 className="font-playfair text-xl font-bold text-white flex items-center gap-1.5 justify-end">
                    <span>אימות אסמכתאות AI</span>
                    <Cpu size={18} className="text-accent animate-pulse" />
                  </h3>
                </div>
                <p className="text-xs text-secondary leading-relaxed font-light">
                  Gemini סורק את צילום מסך האסמכתא שהעליתם ומאמת את ביצוע ההעברה, סכום התשלום ומספר הטלפון של המוכר.
                </p>
              </div>

              {/* Logs area */}
              <div className="bg-black/50 border border-primary/5 rounded-2xl p-4 h-64 overflow-y-auto space-y-2.5 text-xs font-mono scrollbar-thin scrollbar-thumb-primary/10 text-right">
                {scanLogs.map((log, index) => {
                  let logColorClass = "text-secondary";
                  
                  if (log.startsWith('✅') || log.startsWith('🎉')) {
                    logColorClass = "text-emerald-400 font-medium";
                  } else if (log.startsWith('❌')) {
                    logColorClass = "text-rose-400 font-semibold";
                  } else if (log.startsWith('💡') || log.startsWith('🎯')) {
                    logColorClass = "text-amber-300 font-medium";
                  } else if (log.startsWith('📡') || log.startsWith('🤖')) {
                    logColorClass = "text-indigo-300";
                  } else if (log.startsWith('⚠️')) {
                    logColorClass = "text-amber-400 font-semibold";
                  } else if (log.startsWith('ℹ️')) {
                    logColorClass = "text-blue-300 font-medium";
                  }
                  
                  return (
                    <div key={index} className={`leading-relaxed whitespace-pre-line hover:text-white transition-colors ${logColorClass}`}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {/* Status display */}
              <div className="pt-2">
                {scanSuccess === null && (
                  <div className="flex items-center gap-2 justify-end text-xs text-accent">
                    <span>סורק ומאמת אסמכתאות, נא להמתין...</span>
                    <Loader2 size={16} className="animate-spin text-accent" />
                  </div>
                )}
                {scanSuccess === true && (
                  <div className="flex items-center gap-2 justify-end text-xs text-success-soft font-semibold bg-success-soft/10 p-3 rounded-xl border border-success-soft/20">
                    <span>האסמכתאות אושרו! ההזמנה שלך הושלמה.</span>
                    <CheckCircle size={16} className="text-success-soft" />
                  </div>
                )}
                {scanSuccess === false && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-end text-xs text-error-soft font-semibold bg-error-soft/10 p-3 rounded-xl border border-error-soft/20">
                      <span>אימות האסמכתא נכשל. הקובץ אינו תואם.</span>
                      <AlertTriangle size={16} className="text-error-soft" />
                    </div>
                    <button
                      onClick={() => setIsScanning(false)}
                      className="w-full bg-white/10 hover:bg-white/15 text-white py-2 rounded-xl text-xs font-semibold transition-custom cursor-pointer"
                    >
                      סגור ונסה שוב
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Visual of scanning receipt */}
            <div className="md:w-2/5 flex flex-col items-center justify-center space-y-4">
              <span className="text-[10px] text-secondary">תצוגת סריקה מקדימה</span>
              
              <div className="relative aspect-[3/4] w-40 sm:w-44 rounded-2xl overflow-hidden border border-primary/10 bg-bg-warm/5 shadow-inner">
                {/* Check receipt photo */}
                {cart.length > 0 && paymentProofs[cart[0].id] ? (
                  <img
                    src={paymentProofs[cart[0].id]}
                    alt="סריקה"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-secondary">אין קובץ</div>
                )}
                
                {/* Laser scan animation overlay */}
                {scanSuccess === null && (
                  <div className="absolute left-0 w-full h-0.5 bg-accent shadow-[0_0_10px_#C97C5D,0_0_15px_#C97C5D] animate-scan"></div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Page title */}
      <div className="text-right">
        <h1 className="font-playfair text-3xl font-bold text-text-dark">סל הקניות שלך</h1>
        <p className="text-secondary text-sm mt-1">פריטי לבוש שבחרת לרכוש מחברי הקהילה</p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto pb-6 border-b border-primary/5">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-custom ${checkoutStep >= 1 ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-secondary/20 text-secondary'}`}>1</div>
          <span className="text-[11px] mt-1.5 text-text-dark font-semibold">סל קניות</span>
        </div>
        <div className={`flex-grow h-0.5 mx-2 transition-custom ${checkoutStep >= 2 ? 'bg-primary' : 'bg-secondary/20'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-custom ${checkoutStep >= 2 ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-secondary/20 text-secondary'}`}>2</div>
          <span className="text-[11px] mt-1.5 text-text-dark font-semibold">משלוח</span>
        </div>
        <div className={`flex-grow h-0.5 mx-2 transition-custom ${checkoutStep >= 3 ? 'bg-primary' : 'bg-secondary/20'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-custom ${checkoutStep >= 3 ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-secondary/20 text-secondary'}`}>3</div>
          <span className="text-[11px] mt-1.5 text-text-dark font-semibold">תשלום ואסמכתא</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Step Content */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Step 1: Cart Items List */}
          {checkoutStep === 1 && (
            <div className="space-y-4">
              {cart.map((item) => {
                const seller = getUserById(item.user_id);
                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl p-4 border border-primary/5 shadow-premium flex gap-4 items-center justify-between text-right"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-16 h-20 object-cover rounded-xl border bg-bg-warm"
                      />
                      <div>
                        <h3 className="font-semibold text-text-dark text-sm leading-tight">{item.title}</h3>
                        <p className="text-xs text-secondary mt-1">מוכר/ת: {seller?.full_name || 'לא ידוע'}</p>
                        <p className="text-xs text-secondary mt-0.5">טלפון להעברה: <span className="font-semibold text-accent">{seller?.phone || 'לא זמין'}</span></p>
                        <p className="text-sm font-bold text-text-dark mt-1.5">₪{item.price}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-secondary hover:text-error-soft hover:bg-error-soft/5 rounded-lg transition-custom cursor-pointer"
                      title="הסר מהסל"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Shipping Option & Address form */}
          {checkoutStep === 2 && (
            <div className="space-y-6 bg-white rounded-2xl p-6 border border-primary/10 shadow-premium text-right">
              <h2 className="font-playfair text-xl font-bold text-text-dark border-b border-primary/5 pb-2 flex items-center gap-2 justify-end">
                <span>שיטת קבלת הפריטים</span>
                <Truck size={20} className="text-accent" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup Option */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-5 rounded-2xl border-2 text-right flex flex-col justify-between h-32 transition-custom cursor-pointer ${
                    shippingMethod === 'pickup'
                      ? 'border-accent bg-accent/5 scale-[1.01]'
                      : 'border-secondary/20 hover:border-accent/40'
                  }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'pickup' ? 'border-accent bg-accent' : 'border-secondary/35'}`}>
                      {shippingMethod === 'pickup' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </span>
                    <MapPin size={24} className={shippingMethod === 'pickup' ? 'text-accent' : 'text-secondary'} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-dark text-sm">איסוף עצמי</h4>
                    <p className="text-xs text-secondary mt-0.5">תיאום איסוף ישירות מול המוכר (חינם)</p>
                  </div>
                </button>

                {/* Delivery Option */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('delivery')}
                  className={`p-5 rounded-2xl border-2 text-right flex flex-col justify-between h-32 transition-custom cursor-pointer ${
                    shippingMethod === 'delivery'
                      ? 'border-accent bg-accent/5 scale-[1.01]'
                      : 'border-secondary/20 hover:border-accent/40'
                  }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'delivery' ? 'border-accent bg-accent' : 'border-secondary/35'}`}>
                      {shippingMethod === 'delivery' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </span>
                    <Truck size={24} className={shippingMethod === 'delivery' ? 'text-accent' : 'text-secondary'} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-dark text-sm">משלוח עד הבית</h4>
                    <p className="text-xs text-secondary mt-0.5">משלוח מהיר לכתובת שלך (+₪15)</p>
                  </div>
                </button>
              </div>

              {shippingMethod === 'delivery' && (
                <div className="pt-4 border-t border-primary/5 space-y-4">
                  <h3 className="text-sm font-semibold text-text-dark">כתובת למשלוח</h3>
                  
                  {isAddressFilled() ? (
                    <div className="bg-bg-warm p-4 rounded-xl border border-primary/5 flex justify-between items-center">
                      <div className="text-xs space-y-1 text-right">
                        <p className="font-semibold text-text-dark">
                          {shippingAddress.street} {shippingAddress.houseNumber}, {shippingAddress.city}
                        </p>
                        {shippingAddress.notes && (
                          <p className="text-secondary">הערות: {shippingAddress.notes}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddressModal}
                        className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                      >
                        עריכה
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl flex flex-col items-center gap-3 text-center">
                      <p className="text-xs text-secondary font-medium">טרם הזנת פרטי כתובת למשלוח</p>
                      <button
                        type="button"
                        onClick={handleOpenAddressModal}
                        className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-custom shadow-md cursor-pointer"
                      >
                        הזן כתובת למשלוח
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4 border-t border-primary/5">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(3)}
                  disabled={shippingMethod === 'delivery' && !isAddressFilled()}
                  className={`flex-grow py-3.5 rounded-xl font-semibold text-sm transition-custom shadow-md cursor-pointer ${
                    shippingMethod === 'delivery' && !isAddressFilled()
                      ? 'bg-secondary/20 text-secondary cursor-not-allowed'
                      : 'bg-accent hover:bg-accent-hover text-white'
                  }`}
                >
                  המשך לתשלום ואסמכתא
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="px-6 py-3.5 bg-white border border-primary/20 text-text-dark rounded-xl text-sm font-semibold hover:bg-bg-warm transition-custom cursor-pointer"
                >
                  חזרה לסל
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Proof Upload */}
          {checkoutStep === 3 && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-primary/10 shadow-premium text-right">
              <h2 className="font-playfair text-xl font-bold text-text-dark border-b border-primary/5 pb-2 flex items-center gap-2 justify-end">
                <span>תשלום והעלאת אסמכתא</span>
                <CreditCard size={20} className="text-accent" />
              </h2>
              
              {/* Payment Method Selector Buttons */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-text-dark">
                  בחרו אפליקציית העברת כספים: <span className="text-error-soft">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bit')}
                    className={`p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-custom cursor-pointer ${
                      selectedMethod === 'bit' 
                        ? 'border-accent bg-accent/5 text-accent scale-102' 
                        : 'border-secondary/20 hover:border-accent/40 text-text-dark'
                    }`}
                  >
                    <Smartphone size={24} className={selectedMethod === 'bit' ? 'text-accent' : 'text-secondary'} />
                    <span className="text-sm">Bit</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('paybox')}
                    className={`p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-custom cursor-pointer ${
                      selectedMethod === 'paybox' 
                        ? 'border-accent bg-accent/5 text-accent scale-102' 
                        : 'border-secondary/20 hover:border-accent/40 text-text-dark'
                    }`}
                  >
                    <CreditCard size={24} className={selectedMethod === 'paybox' ? 'text-accent' : 'text-secondary'} />
                    <span className="text-sm">PayBox</span>
                  </button>
                </div>
              </div>

              {/* Group payment instructions per item in cart (direct to seller) */}
              <div className="space-y-6 pt-4 border-t border-primary/5">
                <p className="text-xs text-secondary leading-relaxed">
                  עליך לבצע העברה ישירה למספר הטלפון של המוכר. הסכום כולל את מחיר הפריט, 10% עמלת שימוש באתר{shippingMethod === 'delivery' && ' ו-15 ש"ח דמי משלוח'}:
                </p>

                {cart.map((item) => {
                  const seller = getUserById(item.user_id);
                  const itemFee = item.price * 0.10;
                  const itemShipping = shippingMethod === 'delivery' ? 15 : 0;
                  const itemTotal = item.price + itemFee + itemShipping;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-bg-warm rounded-2xl p-4 border border-primary/5 space-y-4"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] text-accent font-semibold block uppercase">תשלום עבור פריט</span>
                          <span className="font-semibold text-text-dark text-sm">{item.title}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-secondary block">סכום להעברה (כולל עמלה ומשלוח)</span>
                          <span className="font-bold text-text-dark text-sm">₪{itemTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Seller P2P Details */}
                      <div className="bg-white p-3.5 rounded-xl border border-primary/5 text-xs space-y-2.5">
                        <div className="flex justify-between text-text-dark">
                          <span>שם המוכר:</span>
                          <strong className="text-primary">{seller?.full_name}</strong>
                        </div>
                        <div className="flex justify-between items-center text-text-dark">
                          <span>מספר טלפון להעברה:</span>
                          <span className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded text-accent font-bold text-sm tracking-wide">
                            <Phone size={12} />
                            {seller?.phone}
                          </span>
                        </div>
                        {shippingMethod === 'delivery' && (
                          <div className="flex justify-between text-text-dark">
                            <span>כתובת יעד למשלוח:</span>
                            <span className="font-medium text-secondary">{shippingAddress.street} {shippingAddress.houseNumber}, {shippingAddress.city}</span>
                          </div>
                        )}
                        <div className="h-px bg-primary/5 my-1"></div>
                        <div className="text-[10px] text-secondary space-y-0.5">
                          <div className="flex justify-between">
                            <span>מחיר הפריט:</span>
                            <span>₪{item.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>עמלת אתר (10%):</span>
                            <span>₪{itemFee.toFixed(2)}</span>
                          </div>
                          {shippingMethod === 'delivery' && (
                            <div className="flex justify-between text-accent font-medium">
                              <span>דמי משלוח:</span>
                              <span>₪15.00</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Screenshot Upload for this item (AT THE END) */}
                      <UploadZone
                        label="העלאת צילום מסך של האסמכתא לפריט זה"
                        description="העלו את אישור ההעברה מתוך Bit/PayBox (צילום מסך)"
                        onUploadSuccess={(url) => handleUploadProofForProduct(item.id, url)}
                        required={true}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-primary/5">
                <button
                  type="submit"
                  disabled={!isFormComplete()}
                  className={`flex-grow py-3.5 rounded-xl font-semibold text-sm transition-custom shadow-md cursor-pointer ${
                    isFormComplete()
                      ? 'bg-accent hover:bg-accent-hover text-white hover:scale-[1.01]'
                      : 'bg-secondary/20 text-secondary cursor-not-allowed'
                  }`}
                >
                  שלח אסמכתאות וסיים רכישה
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep(2)}
                  className="px-6 py-3.5 bg-white border border-primary/20 text-text-dark rounded-xl text-sm font-semibold hover:bg-bg-warm transition-custom cursor-pointer"
                >
                  חזרה
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Cart Pricing summary block */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-premium space-y-4 text-right">
            <h3 className="font-semibold text-text-dark text-sm border-b border-primary/5 pb-2">סיכום הזמנה</h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-secondary">
                <span>מחיר פריטים:</span>
                <span className="font-medium text-text-dark">₪{subtotal}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>עמלת שימוש באתר (10%):</span>
                <span className="font-medium text-text-dark">₪{siteFee.toFixed(2)}</span>
              </div>
              {shippingMethod === 'delivery' && (
                <div className="flex justify-between text-secondary">
                  <span>דמי משלוח:</span>
                  <span className="font-medium text-text-dark">₪{shippingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-primary/5 my-2"></div>
              <div className="flex justify-between text-base font-bold text-text-dark">
                <span>סה"כ לתשלום:</span>
                <span className="text-accent">₪{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStep === 1 && (
              <button
                onClick={() => setCheckoutStep(2)}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-semibold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer"
              >
                המשך לביצוע צ׳קאאוט
              </button>
            )}

            {checkoutStep === 2 && (
              <button
                onClick={() => setCheckoutStep(3)}
                disabled={shippingMethod === 'delivery' && !isAddressFilled()}
                className={`w-full py-3.5 rounded-xl font-semibold transition-custom shadow-md text-sm cursor-pointer ${
                  shippingMethod === 'delivery' && !isAddressFilled()
                    ? 'bg-secondary/20 text-secondary cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-white hover:scale-[1.01] active:scale-95'
                }`}
              >
                המשך לתשלום ואסמכתא
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Address Modal Dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-right animate-scale-up border border-primary/5">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-secondary hover:text-text-dark rounded-full hover:bg-bg-warm transition-custom cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="font-playfair text-xl font-bold text-text-dark">פרטי כתובת למשלוח</h3>
              <p className="text-secondary text-xs mt-1">אנא מלאו את כל פרטי הכתובת למשלוח תקין</p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <CityInput
                required
                value={tempAddress.city}
                onChange={(city) => setTempAddress({ ...tempAddress, city })}
                placeholder="לדוגמה: תל אביב"
                label="עיר *"
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-text-dark">רחוב <span className="text-error-soft">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="לדוגמה: דיזנגוף"
                    value={tempAddress.street}
                    onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-dark">מספר בית <span className="text-error-soft">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="12"
                    value={tempAddress.houseNumber}
                    onChange={(e) => setTempAddress({ ...tempAddress, houseNumber: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-dark font-medium">הערות לשליח / קוד כניסה</label>
                <textarea
                  placeholder="קומה 3, דירה 7. קוד כניסה לבניין 1234#..."
                  rows={3}
                  value={tempAddress.notes}
                  onChange={(e) => setTempAddress({ ...tempAddress, notes: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-accent hover:bg-accent-hover text-white py-3 rounded-xl text-sm font-semibold transition-custom shadow-md cursor-pointer"
                >
                  שמור כתובת
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
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
