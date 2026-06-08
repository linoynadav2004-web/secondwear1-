import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UploadZone from '../components/UploadZone';
import { Trash2, Phone, CreditCard, CheckCircle, Smartphone, Info } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, getUserById, checkoutCart } = useApp();
  const navigate = useNavigate();

  // State
  const [selectedMethod, setSelectedMethod] = useState(''); // 'bit' or 'paybox'
  const [paymentProofs, setPaymentProofs] = useState({}); // mapping product.id -> proofUrl
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Auto-calculated fields
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const siteFee = subtotal * 0.10; // 10% site fee
  const totalAmount = subtotal + siteFee;

  const handleUploadProofForProduct = (productId, url) => {
    setPaymentProofs((prev) => ({
      ...prev,
      [productId]: url
    }));
  };

  // Check if all items in cart have a payment proof uploaded
  const isFormComplete = () => {
    if (!selectedMethod) return false;
    // Check if every item in cart has an uploaded screenshot proof
    return cart.every((item) => paymentProofs[item.id]);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    // Call state action (takes first proof for mockup or can map multiple)
    // In our context state, we map payment proofs to the products in the database
    cart.forEach(item => {
      checkoutCart(selectedMethod, paymentProofs[item.id]);
    });

    setIsCheckoutStep(false);
    setIsDone(true);
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
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-[11px] text-text-dark/95">
            💡 <strong>טיפ לבדיקה:</strong> סמל/י את עצמך כעת כ<strong>מוכר/ת</strong> בסרגל הסימולטור העליון, ועבור/י לעמוד "האזור שלי" (My Listings) כדי לראות את הפריט שנמכר ולאשר את התשלום.
          </div>
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-text-dark">סל הקניות שלך</h1>
        <p className="text-secondary text-sm mt-1">פריטי לבוש שבחרת לרכוש מחברי הקהילה</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {!isCheckoutStep ? (
            cart.map((item) => {
              const seller = getUserById(item.user_id);
              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-4 border border-primary/5 shadow-premium flex gap-4 items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-16 h-20 object-cover rounded-xl border bg-bg-warm"
                    />
                    <div>
                      <h3 className="font-semibold text-text-dark text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-secondary mt-1">מוכר/ת: {seller?.full_name}</p>
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
            })
          ) : (
            // Peer-to-Peer Payment Screen & Screenshot Upload Form (Main Flow Step B)
            <form onSubmit={handleCheckoutSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-primary/10 shadow-premium">
              <h2 className="font-playfair text-xl font-bold text-text-dark border-b border-primary/5 pb-2">שלב 2: העברת תשלום ואסמכתא</h2>
              
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
                <p className="text-xs text-secondary">
                  על פי מדיניות האתר, עליך לבצע העברה ישירה למספר הטלפון של המוכר על סך מחיר הפריט + 10% עמלת אתר (מחושב אוטומטית מטה):
                </p>

                {cart.map((item) => {
                  const seller = getUserById(item.user_id);
                  const itemTotal = item.price * 1.10; // item + 10%
                  
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
                          <span className="text-[10px] text-secondary block">סכום להעברה (כולל 10% עמלה)</span>
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
                        <p className="text-[10px] text-secondary leading-normal">
                          בצע/י העברה של <strong>₪{itemTotal.toFixed(2)}</strong> למוכר זה ב-{selectedMethod || 'אפליקציה שנבחרה'}, צלם/י מסך אישור והעלה/י מטה.
                        </p>
                      </div>

                      {/* Screenshot Upload for this item */}
                      <UploadZone
                        label="העלאת צילום מסך של האסמכתא לפריט זה"
                        description="העלו את אישור ההעברה מתוך Bit/PayBox"
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
                  onClick={() => setIsCheckoutStep(false)}
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
          <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-premium space-y-4">
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
              <div className="h-px bg-primary/5 my-2"></div>
              <div className="flex justify-between text-base font-bold text-text-dark">
                <span>סה"כ לתשלום:</span>
                <span className="text-accent">₪{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {!isCheckoutStep && (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-semibold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer"
              >
                המשך לביצוע צ׳קאאוט
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
