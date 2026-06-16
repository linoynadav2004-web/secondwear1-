import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Layers, Sparkles, Shirt, Wind, Footprints, ShoppingBag, Info } from 'lucide-react';

export default function HomePage() {
  const { products, categories, isSupabaseConfigured } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Filter only active products for the catalog
  const activeProducts = products.filter(
    (p) => p.status === 'active' && (selectedCategory === 'all' || p.category_id === selectedCategory)
  );

  // Map Category Icons
  const renderCatIcon = (iconName) => {
    switch (iconName) {
      case 'Shirt': return <Shirt size={20} />;
      case 'Layers': return <Layers size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Wind': return <Wind size={20} />;
      case 'Footprints': return <Footprints size={20} />;
      case 'ShoppingBag': return <ShoppingBag size={20} />;
      default: return <Shirt size={20} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      

      
      {!isSupabaseConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 p-5 rounded-2xl flex items-center gap-4 text-sm font-semibold text-right shadow-sm">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <p className="font-bold">האתר מחובר למסד הנתונים Supabase!</p>
            <p className="text-xs text-secondary mt-0.5">כדי להתחיל לרשום משתמשים ולשמור מוצרים באמת, אנא פתחו את הקובץ <code>.env</code> בתיקיית השורש והזינו את ה-URL וה-Anon Key של פרויקט ה-Supabase שלכם.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent relative overflow-hidden px-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <h1 className="font-playfair text-4xl md:text-6xl font-bold text-text-dark mb-4 leading-tight">
          בגדים עם סיפור שני.
        </h1>
        <p className="font-inter text-secondary text-base md:text-lg max-w-2xl mx-auto mb-8 font-light">
          גלו ארון בגדים קהילתי, בר קיימא ומלא בסטייל. קנו ומכרו בגדי יד שנייה איכותיים בדרך הפשוטה והבטוחה ביותר.
        </p>
        
        <div className="flex justify-center gap-4">
          <a
            href="/sell"
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3.5 rounded-xl font-semibold transition-custom shadow-md hover:scale-105 active:scale-95 cursor-pointer text-sm"
          >
            להעלאת פריט חדש
          </a>
          <a
            href="#catalog"
            className="bg-white hover:bg-bg-warm text-text-dark border border-primary/20 px-6 py-3.5 rounded-xl font-semibold transition-custom hover:scale-105 active:scale-95 cursor-pointer text-sm"
          >
            דפדוף בקטלוג
          </a>
        </div>
      </section>

      {/* Info Banner on Peer-to-Peer fee flow */}
      <section className="bg-white border border-primary/10 rounded-2xl p-5 shadow-premium flex flex-col md:flex-row items-center gap-4">
        <div className="p-3 bg-accent/10 rounded-xl text-accent">
          <Info size={24} />
        </div>
        <div className="text-right flex-grow">
          <h4 className="font-semibold text-text-dark text-sm">איך זה עובד ב-SecondWear?</h4>
          <p className="text-secondary text-xs mt-1 leading-relaxed">
            העלאת פריט עולה עמלה סמלית של 10 ש״ח באשראי מאובטח. רכישת פריט מתבצעת על ידי העברת התשלום ישירות למוכר בצירוף 10% עמלת אתר (Bit/PayBox), כאשר האסמכתא שלכם נסרקת ומאומתת מיידית על ידי Gemini AI!
          </p>
        </div>
      </section>


      {/* Category Filter Section */}
      <section id="catalog" className="space-y-6">
        <div className="text-center md:text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-text-dark">קטגוריות מובילות</h2>
          <p className="text-secondary text-sm mt-1">סננו לפי פריט הלבוש שאתם מחפשים</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 justify-start md:justify-center scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-custom whitespace-nowrap cursor-pointer shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-primary text-white scale-105'
                : 'bg-white text-text-dark hover:bg-primary/5 hover:text-primary border border-primary/5'
            }`}
          >
            <span>הכל</span>
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-custom whitespace-nowrap cursor-pointer shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white scale-105'
                  : 'bg-white text-text-dark hover:bg-primary/5 hover:text-primary border border-primary/5'
              }`}
            >
              <span className="text-accent">{renderCatIcon(cat.icon)}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Active Listings Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-dark">הקולקציה החדשה</h2>
            <p className="text-secondary text-sm mt-1">בגדים מעולים שמחכים ליד חדשה</p>
          </div>
          <span className="text-xs text-secondary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/5">
            נמצאו {activeProducts.length} פריטים
          </span>
        </div>

        {activeProducts.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 px-4 text-center border border-primary/10 shadow-premium max-w-md mx-auto space-y-4">
            <div className="text-4xl">🧥</div>
            <h3 className="font-playfair text-xl font-bold text-text-dark">אין פריטים פעילים כרגע</h3>
            <p className="text-secondary text-sm leading-relaxed">
              הקטלוג כרגע ריק. העלו את הפריט הראשון שלכם — עמלת פרסום של 10 ש״ח באשראי מאובטח, והפריט מיד פעיל!
            </p>
            <div className="pt-2">
              <a
                href="/sell"
                className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl transition-custom text-sm cursor-pointer"
              >
                פרסמי פריט עכשיו
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
