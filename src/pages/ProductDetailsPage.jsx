import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShoppingBag, Phone, User, Tag, ShieldCheck, MessageSquare, Send, X, Bot } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, getUserById, addToCart, currentUser } = useApp();

  const product = products.find((p) => p.id === id);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isDirectMode, setIsDirectMode] = useState(false);

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return '972' + clean.substring(1);
    }
    return clean;
  };

  useEffect(() => {
    if (!isChatOpen) {
      setIsDirectMode(false);
    }
  }, [isChatOpen]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (product) {
      const seller = getUserById(product.user_id);
      setChatMessages([
        {
          id: 1,
          sender: 'seller',
          text: `היי! אני ${seller?.full_name || 'המוכר/ת'}. שמחה שאת מתעניינת ב"${product.title}". יש לך שאלות לגבי הפריט? 😊`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [product]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, isChatOpen]);

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="text-5xl">🔍</div>
        <h1 className="font-playfair text-2xl font-bold text-text-dark">הפריט לא נמצא</h1>
        <p className="text-secondary text-sm leading-relaxed">
          מצטערים, הפריט שחיפשת אינו קיים או שהוסר מהאתר.
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

  const seller = getUserById(product.user_id);
  const category = categories.find((c) => c.id === product.category_id);
  const isOwnProduct = currentUser ? product.user_id === currentUser.id : false;

  // Filter 3 related products in the same category (excluding current)
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.status === 'active')
    .slice(0, 3);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();
    const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const updatedMessages = [
      ...chatMessages,
      {
        id: Date.now(),
        sender: 'user',
        text: userMsg,
        time: messageTime
      }
    ];
    setChatMessages(updatedMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let replyText = "";

      if (apiKey) {
        // Prepare chat history for prompt
        const chatHistoryPrompt = updatedMessages
          .map(m => `${m.sender === 'user' ? 'Buyer' : 'Seller'}: ${m.text}`)
          .join('\n');

        const promptText = `You are a real person named "${seller?.full_name || 'Seller'}" selling your second-hand item "${product.title}" on SecondWear.
Product details:
- Title: "${product.title}"
- Description: "${product.description || 'No description provided'}"
- Price: ${product.price} ILS
- Category: ${category?.name || 'clothing'}

A potential buyer is chatting with you. You must act as the seller, responding in Hebrew.
Keep your response short (1-3 sentences maximum), natural, casual, and friendly, just like a person chatting on WhatsApp/Instagram.
You are open to slight price negotiation (up to 15-20% off) if they ask. Answer questions about the condition, size, and pickup/shipping based on the product details (if size/condition isn't specified, invent a reasonable detail or say you're not sure but it fits S/M/L, etc.).

Here is the conversation history:
${chatHistoryPrompt}

Respond ONLY with your next message as the seller. Do not add any JSON, markdown formatting, or prefix.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: promptText }]
              }]
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      // Local fallback simulation if API fails or is not configured
      if (!replyText) {
        const lowerInput = userMsg.toLowerCase();
        if (lowerInput.includes('מחיר') || lowerInput.includes('גמיש') || lowerInput.includes('הנחה') || lowerInput.includes('שקל')) {
          replyText = `לגבי המחיר, הוא מפורסם ב-₪${product.price}. אני יכול/ה לרדת קצת לקראתך ל-₪${Math.round(product.price * 0.9)} אם ניסגר עכשיו!`;
        } else if (lowerInput.includes('איפה') || lowerInput.includes('איסוף') || lowerInput.includes('גר') || lowerInput.includes('גרה') || lowerInput.includes('מאיפה')) {
          replyText = "אני מאזור המרכז, אבל אפשר לעשות משלוח דרך האתר בתוספת של 15 שקלים בלבד וזה יגיע אלייך מהר.";
        } else if (lowerInput.includes('מידה') || lowerInput.includes('קטן') || lowerInput.includes('גדול') || lowerInput.includes('מתאים')) {
          replyText = "המידה יושבת בול, היא סטנדרטית לגמרי ומאוד נוחה ומחמיאה.";
        } else if (lowerInput.includes('מצב') || lowerInput.includes('חדש') || lowerInput.includes('נקי') || lowerInput.includes('כביסה')) {
          replyText = "הפריט במצב מעולה, נלבש פעמים בודדות בלבד, נקי ומריח טוב :)";
        } else {
          replyText = `היי! שמחה שאת מתעניינת. הפריט באמת מהמם ובמצב מצוין. תרצי לבצע רכישה דרך האתר?`;
        }
      }

      // Add delay for realistic typing feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'seller',
          text: replyText.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative">
      {/* Back link */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-text-dark text-sm font-semibold transition-custom group cursor-pointer"
        >
          <span>חזרה לדף הקודם</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="bg-white rounded-3xl border border-primary/10 shadow-premium overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 text-right">
        
        {/* Left/Top Column: Image */}
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-primary/5 bg-bg-warm">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-green-500 text-white text-lg font-bold px-6 py-2.5 rounded-full shadow-lg border border-green-400">
                נמכר בהצלחה! 🎉
              </span>
            </div>
          )}
          {product.status === 'pending_payment_approval' && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-blue-500 text-white text-base font-bold px-5 py-2 rounded-full shadow-lg border border-blue-400">
                ממתין לאישור תשלום
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category Tag */}
            {category && (
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full border border-accent/20">
                <Tag size={12} />
                {category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-text-dark leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline justify-end gap-1.5 border-b border-primary/5 pb-4">
              <span className="text-3xl font-extrabold text-text-dark">₪{product.price}</span>
              <span className="text-xs text-secondary">מחיר פריט</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-text-dark text-sm">תיאור הפריט:</h3>
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                {product.description || 'אין תיאור זמין עבור פריט זה.'}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-primary/5">
            {/* Seller Card */}
            <div className="bg-bg-warm/50 border border-primary/5 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 px-2.5 py-0.5 rounded text-accent font-bold text-xs tracking-wide flex items-center gap-1">
                  <Phone size={12} />
                  {seller?.phone || 'לא זמין'}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-secondary">המוכר/ת</p>
                  <p className="font-bold text-text-dark text-sm">{seller?.full_name || 'לא ידוע'}</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                  {seller?.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-secondary" />
                  )}
                </div>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="flex items-center gap-2 justify-end text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <span>רכישה מאובטחת בעזרת מנגנון Gemini AI לאימות האסמכתא</span>
              <ShieldCheck size={14} className="shrink-0" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {product.status === 'active' ? (
                isOwnProduct ? (
                  <div className="w-full text-center py-3.5 bg-bg-warm text-secondary rounded-xl text-sm font-semibold border border-primary/5">
                    הפריט שלך (לא ניתן לרכוש פריט עצמי)
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        addToCart(product);
                        navigate('/cart');
                      }}
                      className="flex-grow bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-custom shadow-md hover:scale-[1.01] active:scale-95 text-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      <span>רכשי עכשיו</span>
                    </button>
                    
                    {/* Chat with Seller Button */}
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-xl text-sm font-semibold transition-custom shadow-sm hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      <span>צ׳אט עם המוכר</span>
                    </button>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-6 py-3.5 bg-white border border-primary/20 text-text-dark rounded-xl text-sm font-semibold hover:bg-bg-warm transition-custom cursor-pointer flex items-center justify-center"
                      title="הוספה לסל"
                    >
                      הוספה לסל
                    </button>
                  </>
                )
              ) : (
                <div className="w-full text-center py-3.5 bg-secondary/10 text-secondary rounded-xl text-sm font-semibold">
                  הפריט אינו זמין לרכישה כרגע (סטטוס: {product.status === 'sold' ? 'נמכר' : 'באישור'})
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 text-right">
          <h2 className="font-playfair text-xl font-bold text-text-dark">פריטים נוספים שעשויים לעניין אותך</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-premium hover:shadow-premium-hover transition-custom flex flex-col h-full group text-right"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm shrink-0">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-custom" />
                  <div className="absolute top-3 right-3 bg-bg-warm/95 text-text-dark text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    ₪{p.price}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-playfair font-bold text-text-dark group-hover:text-primary transition-custom text-sm line-clamp-1 mb-1">
                    {p.title}
                  </h4>
                  <p className="text-secondary text-xs line-clamp-2 leading-relaxed flex-grow">
                    {p.description || 'אין תיאור.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sliding Chat Drawer (Side Panel) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          {/* Backdrop Closer */}
          <div className="flex-grow" onClick={() => setIsChatOpen(false)}></div>
          
          {/* Chat Panel Container */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-r border-primary/10 text-right animate-slide-in relative overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-custom cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h4 className="font-bold text-sm leading-tight">{seller?.full_name || 'מוכר/ת'}</h4>
                  <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-300 font-medium">
                    <span>מחובר/ת</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 border border-white/15 flex items-center justify-center relative">
                  {seller?.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Product Sticky Panel in Chat */}
            <div className="bg-indigo-50 border-b border-indigo-100 p-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900">₪{product.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-950 line-clamp-1">{product.title}</span>
                <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover border border-indigo-100" />
              </div>
            </div>

            {/* Real-Seller Direct Contact Banner */}
            {!isDirectMode && (
              <button
                type="button"
                onClick={() => {
                  setIsDirectMode(true);
                  setChatMessages(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      sender: 'system',
                      text: 'השיחה הועברה לערוץ ישיר מול המוכר האמיתי.',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-bold py-2.5 px-4 border-b border-indigo-200 transition-custom flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full"
              >
                <span>לא מרוצה מהתשובות? לחצי למעבר למוכר האמיתי</span>
                <Bot size={13} className="text-indigo-600 animate-pulse" />
              </button>
            )}

            {/* Message History area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-bg-warm/30 scrollbar-thin scrollbar-thumb-primary/5 flex flex-col">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';
                
                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="self-center bg-indigo-50 text-indigo-800 px-3.5 py-1.5 rounded-full text-[10px] font-bold border border-indigo-100 my-2 text-center"
                    >
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${isUser ? 'self-start items-start' : 'self-end items-end'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-accent text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-text-dark rounded-tl-none border border-primary/5 shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-secondary mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && !isDirectMode && (
                <div className="self-end flex flex-col items-end max-w-[75%]">
                  <div className="bg-white text-text-dark border border-primary/5 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10 px-4">
                    <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce delay-0"></span>
                    <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[9px] text-secondary mt-1 px-1">מקליד/ה...</span>
                </div>
              )}

              {/* WhatsApp Redirection Card */}
              {isDirectMode && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl text-center space-y-3 shadow-xs my-2 self-stretch animate-slide-in shrink-0">
                  <p className="font-bold text-xs">השיחה הועברה למוכר האמיתי! 📞</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    העוזר הווירטואלי פינה את מקומו. כעת תוכלי לעבור לשיחה ישירה עם המוכר בנייד או לשלוח לו הודעה מהירה בוואטסאפ:
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(seller?.phone)}?text=${encodeURIComponent(`היי ${seller?.full_name}, אני פונה לגבי הפריט שלך "${product.title}" ב-SecondWear!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-custom flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>פתיחת צ'אט בוואטסאפ</span>
                    </a>
                    <div className="text-xs font-bold text-emerald-900 bg-white/60 py-1.5 rounded-lg border border-emerald-100">
                      טלפון המוכר: {seller?.phone || 'לא זמין'}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {isDirectMode ? (
              <div className="p-4 border-t border-primary/10 bg-bg-warm/50 text-center text-xs text-secondary font-semibold shrink-0">
                השיחה פעילה כעת בערוץ הישיר מול המוכר (WhatsApp)
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-primary/10 bg-white flex gap-2 items-center shrink-0">
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className={`p-3 rounded-full flex items-center justify-center shrink-0 transition-custom shadow ${
                    userInput.trim()
                      ? 'bg-accent hover:bg-accent-hover text-white hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-secondary/15 text-secondary cursor-not-allowed'
                  }`}
                >
                  <Send size={16} className="rotate-180" />
                </button>
                
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="הקלידו הודעה למוכר..."
                  className="flex-grow px-4 py-2.5 rounded-2xl border border-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-custom text-right"
                />
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
