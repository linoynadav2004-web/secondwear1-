import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ShoppingBag, PlusCircle, Sparkles, ShieldCheck, Smartphone, CheckCircle, Leaf, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  const { products, currentUser } = useApp();
  const navigate = useNavigate();

  // Calculate active products count
  const activeProductsCount = products.filter(p => p.status === 'active').length;

  const steps = [
    {
      number: '01',
      title: 'מצלמים ומפרסמים',
      desc: 'מעלים תמונה של פריט הלבוש שתרצו למכור, קובעים מחיר ובוחרים עיר איסוף.',
      icon: <PlusCircle className="text-accent" size={24} />
    },
    {
      number: '02',
      title: 'העברה ישירה ב-Bit / PayBox',
      desc: 'הקונה מעביר את הכסף ישירות לטלפון שלכם ללא פערי תיווך וללא עמלות מצידכם.',
      icon: <Smartphone className="text-primary" size={24} />
    },
    {
      number: '03',
      title: 'אימות חכם ב-Gemini AI',
      desc: 'הקונה מעלה צילום מסך של האסמכתא. מודל ה-AI שלנו מאמת אותה מיידית מול פרטיכם.',
      icon: <Sparkles className="text-accent" size={24} />
    },
    {
      number: '04',
      title: 'איסוף עצמי או משלוח',
      desc: 'מתאמים איסוף פנים אל פנים או שולחים עד הבית בצורה פשוטה ומהירה.',
      icon: <CheckCircle className="text-success-soft" size={24} />
    }
  ];

  const benefits = [
    {
      title: 'אקולוגי וירוק',
      desc: 'רכישת בגדי יד שנייה חוסכת משאבי ייצור יקרים ומפחיתה את זיהום הסביבה.',
      icon: <Leaf className="text-emerald-600" size={32} />
    },
    {
      title: 'עסקאות ישירות ללא עמלות מכירה',
      desc: 'אנחנו לא לוקחים עמלות מהסכום שקבעתם עבור המוצר. הכסף מגיע אליכם במלואו.',
      icon: <Smartphone className="text-accent" size={32} />
    },
    {
      title: 'אימות מבוסס בינה מלאכותית',
      desc: 'מערכת Gemini Vision סורקת את קבלת התשלום ומגנה עליכם מפני זיופים וספאם.',
      icon: <Sparkles className="text-primary" size={32} />
    },
    {
      title: 'קהילה מקומית איכותית',
      desc: 'מכירה וקנייה מחברים ומבני הקהילה הקרובים אליכם, עם איסוף נוח.',
      icon: <ShieldCheck className="text-accent-hover" size={32} />
    }
  ];

  const testimonials = [
    {
      name: 'שרון דוד',
      role: 'מוכרת וקונה קבועה',
      text: 'מכרתי כבר 5 שמלות שהיו סתם זרוקות בארון וקניתי ז׳קט מושלם של זארה בחצי מחיר. מערכת אימות ה-AI פשוט גאונית וחוסכת המון כאב ראש!',
      stars: 5
    },
    {
      name: 'רועי לוי',
      role: 'סטודנט באוניברסיטה',
      text: 'כסטודנט, השילוב של קנייה זולה, איסוף עצמי קרוב לבית והעברה ישירה בביט זה שילוב מנצח. מומלץ בחום!',
      stars: 5
    }
  ];

  return (
    <div className="space-y-20 pb-20 font-inter text-right">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Beautiful visual collage */}
          <div className="lg:col-span-6 relative flex justify-center order-2 lg:order-1">
            <div className="grid grid-cols-12 gap-4 max-w-[500px] w-full">
              {/* Image 1: Main */}
              <div className="col-span-8 overflow-hidden rounded-3xl shadow-premium hover:shadow-premium-hover transition-custom group">
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80" 
                  alt="אופנה איכותית יד שנייה" 
                  className="w-full h-[320px] object-cover group-hover:scale-105 transition-custom"
                />
              </div>
              {/* Decorative block */}
              <div className="col-span-4 bg-accent/10 rounded-3xl flex flex-col items-center justify-center p-4 text-center border border-accent/20">
                <span className="text-3xl font-playfair font-bold text-accent">{activeProductsCount || 20}</span>
                <span className="text-[10px] font-semibold text-text-dark mt-1">פריטים מחכים לך בקטלוג</span>
              </div>
              {/* Image 2 */}
              <div className="col-span-4 overflow-hidden rounded-3xl shadow-premium hover:shadow-premium-hover transition-custom group">
                <img 
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80" 
                  alt="אביזרי אופנה" 
                  className="w-full h-[180px] object-cover group-hover:scale-105 transition-custom"
                />
              </div>
              {/* Image 3 */}
              <div className="col-span-8 overflow-hidden rounded-3xl shadow-premium hover:shadow-premium-hover transition-custom group">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80" 
                  alt="בגדים מובילים למכירה" 
                  className="w-full h-[180px] object-cover group-hover:scale-105 transition-custom"
                />
              </div>
            </div>

            {/* Ambient visual glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/15 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Hero Right: Content */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-accent text-xs font-semibold">
              <Sparkles size={12} className="animate-pulse" />
              <span>ארון בגדים קהילתי, חכם וירוק</span>
            </div>
            
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-text-dark leading-[1.15]">
              הארון שלך, <br />
              <span className="text-primary relative inline-block">
                הסיפור הבא שלהן
                <span className="absolute bottom-1 left-0 w-full h-1 bg-accent/40 rounded"></span>
              </span>
            </h1>

            <p className="text-secondary text-sm sm:text-base leading-relaxed font-light max-w-lg">
              SecondWear הוא לוח מכירות חברתי המאפשר לחברי הקהילה לקנות ולמכור בגדים pre-loved ישירות זה מזה. 
              ללא מתווכים, עם תשלום ישיר, ומערכת אימות אוטומטית המבוססת על Gemini AI שמאשרת את העברות הכספים עבורכם.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {currentUser ? (
                <>
                  <Link 
                    to="/catalog"
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] transition-custom flex items-center gap-2 group cursor-pointer"
                  >
                    <span>כניסה לקטלוג הבגדים</span>
                    <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
                  </Link>
                  <Link 
                    to="/sell"
                    className="bg-white hover:bg-bg-warm text-text-dark border border-primary/20 px-8 py-4 rounded-2xl text-sm font-bold shadow-sm hover:scale-[1.02] transition-custom flex items-center gap-2 cursor-pointer"
                  >
                    <span>פרסום בגד למכירה</span>
                    <PlusCircle size={18} className="text-accent" />
                  </Link>
                </>
              ) : (
                <Link 
                  to="/login"
                  className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] transition-custom flex items-center gap-2 cursor-pointer"
                >
                  <span>התחברות / הרשמה לקהילה</span>
                  <PlusCircle size={18} className="text-white" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 1.5 Quick Community Auth Callout (Only visible when not logged in) */}
      {!currentUser && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-primary/10 shadow-premium flex flex-col sm:flex-row justify-between items-center gap-6 text-right relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-2">
              <h3 className="font-playfair text-xl font-bold text-text-dark">רוצה להתחיל למכור פריטים משלך? 👗</h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-light max-w-xl">
                כל אחד יכול לעיין בקטלוג המוצרים וליהנות מהאתר ללא עלות וללא הרשמה. 
                עם זאת, כדי לפרסם בגדים מהארון שלך למכירה, לנהל רכישות או לשוחח בצ'אט עם חברי קהילה – יש צורך להתחבר או להירשם לחשבון.
              </p>
            </div>
            <Link 
              to="/login"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] transition-custom cursor-pointer shrink-0"
            >
              התחברות או יצירת חשבון
            </Link>
          </div>
        </section>
      )}

      {/* 2. Process Section (How It Works) */}
      <section className="bg-white py-16 border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-playfair text-3xl font-bold text-text-dark">איך זה עובד?</h2>
            <p className="text-secondary text-xs sm:text-sm font-light">
              תהליך פשוט, שקוף ומאובטח המבוסס על שיתוף פעולה ישיר בין המוכר לקונה בקהילה
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-bg-warm/50 border border-primary/5 rounded-2xl p-6 relative hover:shadow-premium transition-custom group hover:scale-[1.01]"
              >
                {/* Step number background */}
                <div className="absolute top-4 left-4 text-4xl font-playfair font-extrabold text-primary/10">
                  {step.number}
                </div>
                
                {/* Icon wrapper */}
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                  {step.icon}
                </div>

                <h3 className="font-bold text-text-dark text-base mb-2">{step.title}</h3>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Gemini AI Callout Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-text-dark text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-primary/10 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-accent/25 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/15 px-3 py-1 rounded-full inline-flex items-center gap-1">
                <Sparkles size={10} className="animate-spin" />
                Gemini 2.5 Flash Integration
              </span>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">
                אימות אסמכתאות אוטומטי מבוסס AI
              </h2>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-light max-w-2xl">
                רכישת בגדים ב-SecondWear מבוססת על העברה ישירה (Peer-to-Peer) לטלפון של המוכר. כדי להבטיח בטיחות מלאה ולחסוך מהמוכרים את הצורך לבדוק את חשבון הבנק או אפליקציות Bit/Paybox, שילבנו את מודל הראייה הממוחשבת של Gemini AI.
                <br /><br />
                כשהקונה מעלה את אישור ההעברה, ה-AI מנתח את התמונה מיידית, מזהה את הסכום, מוודא שמספר הטלפון של המקבל אכן שייך למוכר הנכון, ומאשר את העסקה תוך שניות בודדות!
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-[260px] space-y-4 backdrop-blur-sm shadow-inner">
                <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={26} />
                </div>
                <h4 className="font-bold text-sm text-white">100% מאובטח וחופשי מספאם</h4>
                <p className="text-[10px] text-secondary leading-relaxed">
                  העלאת עמלת פרסום סמלית בכרטיס אשראי מאובטח מגנה על לוח המודעות, ואימות Gemini Vision AI מאפשר עסקאות חלקות ובטוחות.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Benefits Section (Why Us) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-playfair text-3xl font-bold text-text-dark">למה לבחור ב-SecondWear?</h2>
          <p className="text-secondary text-xs sm:text-sm font-light">הדרך הטובה, החכמה והחסכונית ביותר לחדש את המלתחה</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-2xl border border-primary/10 shadow-premium hover:shadow-premium-hover transition-custom flex flex-col text-right hover:scale-[1.02]"
            >
              <div className="mb-4">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-text-dark text-base mb-2">{benefit.title}</h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-light">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="bg-bg-warm/60 py-16 border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-3xl font-bold text-text-dark">לקוחות מרוצים בקהילה</h2>
            <p className="text-secondary text-xs sm:text-sm font-light">הנה מה שיש לחברי הקהילה שלנו להגיד על השימוש באתר</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-premium space-y-4"
              >
                <div className="flex gap-1 text-amber-500 justify-end">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-text-dark text-xs sm:text-sm leading-relaxed italic font-light">
                  "{t.text}"
                </p>
                <div className="border-t border-primary/5 pt-3 mt-4 flex items-center justify-end gap-3">
                  <div className="text-right">
                    <h4 className="font-bold text-xs sm:text-sm text-text-dark">{t.name}</h4>
                    <span className="text-[10px] text-secondary">{t.role}</span>
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center font-bold text-accent text-xs">
                    {t.name[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Footer CTA Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-4">
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text-dark">מוכנים להתחיל לקנות ולמכור?</h2>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed font-light max-w-md mx-auto">
          הצטרפו לקהילת האופנה המקומית הגדולה והבטוחה בישראל עוד היום!
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Link 
            to={currentUser ? "/catalog" : "/login"}
            className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] transition-custom flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentUser ? "היכנסו לקטלוג המוצרים" : "התחברות והצטרפות לקהילה"}</span>
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
