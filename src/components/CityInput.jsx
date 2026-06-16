import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

const FALLBACK_CITIES = [
  'תל אביב - יפו',
  'ירושלים',
  'חיפה',
  'ראשון לציון',
  'פתח תקווה',
  'אשדוד',
  'נתניה',
  'באר שבע',
  'חולון',
  'רמת גן',
  'הרצליה',
  'כפר סבא',
  'רעננה',
  'מודיעין-מכבים-רעות',
  'גבעתיים',
  'הוד השרון',
  'ראש העין',
  'רחובות',
  'נס ציונה',
  'חדרה',
  'עפולה',
  'אילת',
  'אשקלון',
  'בית שמש',
  'בת ים',
  'רמלה',
  'לוד',
  'קרית גת',
  'נהריה',
  'נוף הגליל',
  'נצרת',
  'קרית שמונה',
  'שדרות',
  'יבנה',
  'עכו',
  'כרמיאל'
].sort();

export default function CityInput({ value, onChange, placeholder = 'הקלידו שם עיר בישראל...', required = false, label = 'עיר' }) {
  const [cities, setCities] = useState(FALLBACK_CITIES);
  const [filtered, setFiltered] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);

  // Sync value prop with internal input state
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Fetch cities from Gov.il API on mount
  useEffect(() => {
    let active = true;
    const fetchCities = async () => {
      setLoading(true);
      try {
        // Gov.il API endpoint for list of settlements in Israel
        const response = await fetch(
          'https://data.gov.il/api/3/action/datastore_search?resource_id=b7cf8f14-64a2-4b33-8d4b-edb286fdbd37&limit=1500'
        );
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        if (data?.result?.records && active) {
          const fetchedCities = data.result.records
            .map((record) => record['שם_ישוב']?.toString().trim())
            .filter((name) => name && isNaN(name)) // Filter out empty or numeric values
            .filter((v, i, self) => self.indexOf(v) === i) // Unique values
            .sort();

          if (fetchedCities.length > 0) {
            setCities(fetchedCities);
          }
        }
      } catch (err) {
        console.warn('Could not fetch cities from Gov Data API, using fallback list:', err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCities();
    return () => {
      active = false;
    };
  }, []);

  // Filter list of cities based on user input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFiltered([]);
      return;
    }
    const cleanInput = inputValue.trim().toLowerCase();
    const matches = cities.filter((city) =>
      city.toLowerCase().includes(cleanInput)
    );
    setFiltered(matches.slice(0, 10)); // Limit to top 10 results for performance
  }, [inputValue, cities]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setShowDropdown(true);
  };

  const handleSelectCity = (city) => {
    setInputValue(city);
    onChange(city);
    setShowDropdown(false);
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-1.5 relative w-full font-inter" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-text-dark flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-error-soft">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Input field */}
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-primary/10 bg-bg-warm/50 focus:border-accent focus:bg-white outline-none transition-custom text-right"
        />

        {/* Start Icon (MapPin) */}
        <div className="absolute top-1/2 right-3.5 -translate-y-1/2 text-secondary pointer-events-none">
          <MapPin size={16} />
        </div>

        {/* End Actions (Loader / Clear button) */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center gap-1.5">
          {loading && (
            <Loader2 size={14} className="animate-spin text-accent" />
          )}
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 text-secondary hover:text-text-dark rounded-full hover:bg-primary/5 transition-custom cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-primary/15 rounded-xl shadow-premium mt-1.5 max-h-60 overflow-y-auto divide-y divide-primary/5 scrollbar-thin scrollbar-thumb-primary/10 text-right">
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                onClick={() => handleSelectCity(city)}
                className="w-full text-right px-4 py-2.5 hover:bg-bg-warm text-sm text-text-dark font-medium transition-custom cursor-pointer flex items-center justify-between"
              >
                <span className="text-xs text-secondary font-normal">יישוב בישראל</span>
                <span className="text-text-dark">{city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
