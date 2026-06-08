import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-text-dark text-bg-warm/80 mt-auto border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo / Tagline */}
          <div className="space-y-4">
            <h3 className="font-playfair text-2xl font-bold text-white tracking-tight">SecondWear</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              פלטפורמת אופנה יד שנייה המקשרת בין חובבי סטייל, שומרת על הסביבה ומאפשרת רכישה ישירה ובטוחה.
            </p>
          </div>

          {/* Useful Links / Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">עזרה ותמיכה</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#faq" className="hover:text-accent transition-custom">שאלות נפוצות</a>
              </li>
              <li>
                <a href="#payments" className="hover:text-accent transition-custom">מדריך תשלומים ועמלות</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent transition-custom font-medium">שירות לקוחות (050-XXXXXXX)</a>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">מדיניות האתר</h4>
            <p className="text-xs leading-relaxed text-bg-warm/60">
              * כל הפרסומים כפופים לעמלת העלאה קבועה בסך 10 ש״ח.<br />
              * הרכישות מתבצעות ישירות מול המוכרים עם עמלת שימוש של 10% לטובת תחזוקת הפלטפורמה.<br />
              * יש להעלות אסמכתת תשלום תקינה לצורך אישור העסקה.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-bg-warm/50 gap-4">
          <p>© {new Date().getFullYear()} SecondWear. כל הזכויות שמורות.</p>
          <p className="flex items-center gap-1">
            <span>נוצר באהבה עבור אופנה בת קיימא</span>
            <Heart size={10} className="text-accent fill-accent" />
          </p>
        </div>
      </div>
    </footer>
  );
}
