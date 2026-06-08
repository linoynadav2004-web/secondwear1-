import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle, Smartphone, User, FileText, ChevronLeft, ShieldCheck } from 'lucide-react';

export default function MyListingsPage() {
  const { products, currentUser, getUserById, approvePayment } = useApp();
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' or 'bought'
  const [selectedReceipt, setSelectedReceipt] = useState(null); // zoom receipt modal state

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
          <img 
            src={currentUser.avatar_url} 
            alt={currentUser.full_name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-accent"
          />
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
      </div>

      {/* Main Area */}
      {activeTab === 'selling' ? (
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
      ) : (
        // Bought Listings Tab
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
