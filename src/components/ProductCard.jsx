import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Clock, CheckCircle } from 'lucide-react';

export default function ProductCard({ product, showActions = true, isAdminView = false, onActionClick = null }) {
  const { addToCart, categories, getUserById, currentUser } = useApp();
  const seller = getUserById(product.user_id);
  const category = categories.find(c => c.id === product.category_id);

  // Status rendering mapping
  const getStatusBadge = () => {
    switch (product.status) {
      case 'pending_fee_approval':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <Clock size={12} />
            <span>ממתין לעמלת פרסום</span>
          </span>
        );
      case 'pending_payment_approval':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-200 animate-pulse">
            <Clock size={12} />
            <span>ממתין לאישור תשלום</span>
          </span>
        );
      case 'sold':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-200">
            <CheckCircle size={12} />
            <span>נמכר!</span>
          </span>
        );
      case 'active':
        return (
          <span className="bg-success-soft/10 text-success-soft text-xs font-semibold px-2.5 py-1 rounded-full border border-success-soft/20">
            פעיל
          </span>
        );
      default:
        return null;
    }
  };

  const isOwnProduct = currentUser ? product.user_id === currentUser.id : false;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-custom group flex flex-col h-full border border-primary/5">
      
      {/* Link wrapper for image and product details */}
      <Link to={`/product/${product.id}`} className="flex flex-col flex-grow">
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-custom"
            loading="lazy"
          />
          
          {/* Category & Status Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {category && (
              <span className="bg-bg-warm/95 text-text-dark text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                {category.name}
              </span>
            )}
            {getStatusBadge()}
          </div>

          {/* Quick info hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-custom flex items-end p-4">
            <div className="text-white text-xs text-right w-full">
              <p className="font-semibold">{seller?.full_name || 'מוכר/ת'}</p>
              <p className="opacity-90">{seller?.phone || 'טלפון לא זמין'}</p>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-4 flex flex-col flex-grow text-right">
          <h3 className="font-playfair text-lg font-bold text-text-dark leading-tight group-hover:text-primary transition-custom mb-1 line-clamp-1">
            {product.title}
          </h3>
          
          <p className="text-secondary text-xs line-clamp-2 mb-3 leading-relaxed">
            {product.description || 'אין תיאור לפריט זה.'}
          </p>

          {/* Seller Info */}
          <div className="bg-bg-warm/60 p-2.5 rounded-xl border border-primary/5 text-xs mb-1 space-y-1 w-full mt-auto">
            <div className="flex justify-between">
              <span className="text-secondary font-medium">מוכר/ת:</span>
              <span className="text-text-dark font-semibold">{seller?.full_name || 'לא ידוע'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary font-medium">טלפון:</span>
              <span className="text-accent font-bold tracking-wide">{seller?.phone || 'לא זמין'}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action panel & Price (kept outside link for clickable actions) */}
      <div className="p-4 pt-2 border-t border-primary/5 mt-auto">
        <div className="flex justify-between items-center">
          <div className="text-right">
            <span className="text-xs text-secondary block">מחיר פריט</span>
            <span className="text-xl font-bold text-text-dark">₪{product.price}</span>
          </div>

          {showActions && (
            <div>
              {product.status === 'active' ? (
                isOwnProduct ? (
                  <span className="text-xs text-secondary font-medium italic">הפריט שלך</span>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-custom shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>הוסף לסל</span>
                  </button>
                )
              ) : (
                isAdminView && onActionClick && (
                  <button
                    onClick={() => onActionClick(product)}
                    className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-custom cursor-pointer"
                  >
                    נהל פריט
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
