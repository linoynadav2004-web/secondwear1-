import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, PlusCircle, User, RefreshCw, LogIn, LogOut } from 'lucide-react';

export default function Header() {
  const { cart, currentUser, logoutUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-bg-warm/95 backdrop-blur-md border-b border-primary/10 shadow-sm transition-custom">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-playfair text-2xl sm:text-3xl font-bold text-text-dark tracking-tight transition-custom group-hover:text-primary">
            SecondWear
          </span>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
        </Link>

        {/* Menu Links */}
        <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg transition-custom ${
              isActive('/') 
                ? 'text-primary bg-primary/5 font-bold' 
                : 'text-text-dark/80 hover:text-primary hover:bg-primary/5'
            }`}
          >
            קטלוג
          </Link>

          <Link
            to="/sell"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-custom ${
              isActive('/sell') 
                ? 'text-primary bg-primary/5 font-bold' 
                : 'text-text-dark/80 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <PlusCircle size={16} className="text-accent" />
            <span>פרסום פריט</span>
          </Link>

          <Link
            to="/my-listings"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-custom ${
              isActive('/my-listings') 
                ? 'text-primary bg-primary/5 font-bold' 
                : 'text-text-dark/80 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <User size={16} />
            <span>האזור שלי</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          {!isActive('/login') && (
            <Link
              to="/cart"
              className={`p-2.5 rounded-full border border-primary/10 transition-custom relative ${
                isActive('/cart') 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-white text-text-dark hover:bg-primary/5 hover:scale-105'
              }`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-bg-warm animate-bounce">
                  {cart.length}
                </span>
              )}
            </Link>
          )}

          {/* Login / Profile Dropdown */}
          {currentUser ? (
            <div className="flex items-center gap-3 border-r border-primary/10 pr-4">
              {currentUser.avatar_url ? (
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.full_name} 
                  className="w-8 h-8 rounded-full object-cover border border-primary/10 hidden sm:block"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs border border-accent/20 hidden sm:flex">
                  {currentUser.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-text-dark">{currentUser.full_name}</p>
                <p className="text-[10px] text-secondary">{currentUser.phone}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-full border border-primary/10 text-secondary hover:text-error-soft hover:bg-error-soft/5 transition-custom cursor-pointer"
                title="התנתקות"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-custom shadow-sm cursor-pointer"
            >
              <LogIn size={16} />
              <span>התחברות</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
