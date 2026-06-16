import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('secondwear_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [users, setUsers] = useState({
    'mock-user-1': {
      id: 'mock-user-1',
      full_name: 'מיכל כהן',
      phone: '052-4445566',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    'mock-user-2': {
      id: 'mock-user-2',
      full_name: 'דניאל לוי',
      phone: '054-7778899',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    'mock-user-3': {
      id: 'mock-user-3',
      full_name: 'שירה אברהם',
      phone: '050-3332211',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
    },
    'mock-user-4': {
      id: 'mock-user-4',
      full_name: 'יונתן מזרחי',
      phone: '053-9998877',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    '00000000-0000-0000-0000-000000000000': {
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'לינוי נדב (דמו)',
      phone: '050-1234567',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    }
  });

  // Check if Supabase keys are configured
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !url || 
      url.includes('your-placeholder') || 
      url.includes('your-project-id') || 
      !key || 
      key.includes('your-placeholder') || 
      key.includes('your-anon-public-key')
    ) {
      setIsSupabaseConfigured(false);
    }
  }, []);

  // Fetch products and categories on mount / when auth state changes
  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchProducts();
  }, [currentUser]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('secondwear_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth State Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);
      } else {
        const savedDemo = sessionStorage.getItem('secondwear_demo_user');
        if (savedDemo) {
          setCurrentUser(JSON.parse(savedDemo));
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        const savedDemo = sessionStorage.getItem('secondwear_demo_user');
        if (savedDemo) {
          setCurrentUser(JSON.parse(savedDemo));
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper: Fetch Profile details
  const fetchUserProfile = async (userId, authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      if (data) {
        setCurrentUser(data);
      } else {
        // Fallback if profile row is not yet created
        setCurrentUser({
          id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'משתמש/ת חדש/ה',
          phone: authUser.user_metadata?.phone || '',
          avatar_url: authUser.user_metadata?.avatar_url || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  // Fetch Users from Supabase and cache them in the users state
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      if (data) {
        setUsers(prev => {
          const next = { ...prev };
          data.forEach(user => {
            next[user.id] = user;
          });
          return next;
        });
      }
    } catch (err) {
      console.warn('Could not fetch user profiles from database:', err.message);
    }
  };

  // Fetch Categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories from database, using mock fallback categories:', err.message);
      // Fallback categories if database query fails or tables don't exist
      setCategories([
        { id: 'cat-shoes', name: 'נעליים', icon_url: 'Footprints' },
        { id: 'cat-jeans', name: 'ג\'ינס', icon_url: 'Layers' },
        { id: 'cat-pants', name: 'מכנסיים', icon_url: 'Wind' },
        { id: 'cat-shirts', name: 'חולצה', icon_url: 'Shirt' },
        { id: 'cat-tops', name: 'גופיות', icon_url: 'Sparkles' },
        { id: 'cat-dresses', name: 'שמלות וחצאיות', icon_url: 'Sparkles' },
        { id: 'cat-jackets', name: 'ז\'קטים ומעילים', icon_url: 'Shirt' },
        { id: 'cat-accessories', name: 'אקססוריז ותיקים', icon_url: 'ShoppingBag' }
      ]);
    }
  };

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    let currentCats = [];
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      currentCats = catData || [];
    } catch (err) {
      console.warn('Could not fetch categories for product mapping, using default list:', err.message);
    }

    if (currentCats.length === 0) {
      currentCats = [
        { id: 'cat-shoes', name: 'נעליים' },
        { id: 'cat-jeans', name: 'ג\'ינס' },
        { id: 'cat-pants', name: 'מכנסיים' },
        { id: 'cat-shirts', name: 'חולצה' },
        { id: 'cat-tops', name: 'גופיות' }
      ];
    }

    let productsList = [];
    let querySucceeded = false;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      productsList = data || [];
      querySucceeded = true;
    } catch (err) {
      console.error('Error fetching products from database, falling back to client-side mock products:', err.message);
    }

    // If database queries failed (tables don't exist / database connection error)
    if (!querySucceeded) {
      const catMap = {
        'shoes': 'cat-shoes',
        'jeans': 'cat-jeans',
        'pants': 'cat-pants',
        'shirts': 'cat-shirts',
        'tops': 'cat-tops'
      };

      // Map dynamic IDs if database succeeded in returning categories
      currentCats.forEach(c => {
        if (c.name.includes('נעליים')) catMap['shoes'] = c.id;
        if (c.name.includes('ג\'ינס')) catMap['jeans'] = c.id;
        if (c.name.includes('מכנסיים')) catMap['pants'] = c.id;
        if (c.name.includes('חולצה')) catMap['shirts'] = c.id;
        if (c.name.includes('גופיות')) catMap['tops'] = c.id;
      });

      // 20 beautiful pre-seeded mock products to make the store feel alive (interleaved for visual diversity)
      productsList = [
        // Row 1: Diverse items
        {
          id: 'mock-shoe-1',
          title: "סניקרס אדידס סטן סמית'",
          description: "נעלי Adidas Stan Smith לבנות קלאסיות. מידה 42. ננעלו פעמים בודדות בלבד ובמצב מעולה.",
          price: 220,
          category_id: catMap['shoes'],
          image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: '42',
          status: 'active',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: 'mock-jeans-1',
          title: "ג'ינס Levi's 501 קלאסי",
          description: "ג'ינס ליוויס מקורי בגזרה ישרה קלאסית. צבע כחול בינוני, במצב מעולה. מידה 32.",
          price: 190,
          category_id: catMap['jeans'],
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: '32',
          status: 'active',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
          id: 'mock-shirt-1',
          title: "חולצה מכופתרת פסים כחול-לבן",
          description: "חולצה מכופתרת מכותנה דקה עם פסי תכלת ולבן עדינים, גזרה קלאסית. מידה L.",
          price: 115,
          category_id: catMap['shirts'],
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: 'L',
          status: 'active',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 'mock-pants-1',
          title: "מכנסי מחוייט אלגנטי זארה",
          description: "מכנסיים מחויטים בצבע בז' חול של Zara. מתאימים לעבודה או לאירוע ערב. מידה S.",
          price: 120,
          category_id: catMap['pants'],
          image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'S',
          status: 'active',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        },

        // Row 2: Diverse items
        {
          id: 'mock-top-1',
          title: "גופיית ריב לבנה בייסיק",
          description: "גופיית בייסיק מבד ריב נמתח בצבע לבן. מחמיאה ומתאימה לכל לוק קיצי. מידה S.",
          price: 45,
          category_id: catMap['tops'],
          image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'S',
          status: 'active',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
        },
        {
          id: 'mock-shoe-2',
          title: "מגפי עור שחורים Zara",
          description: "מגפי עור אלגנטיים של זארה בצבע שחור, נוחים ומתאימים לחורף. מידה 38.",
          price: 180,
          category_id: catMap['shoes'],
          image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: '38',
          status: 'active',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: 'mock-jeans-2',
          title: "ג'ינס סקיני שחור משופשף",
          description: "ג'ינס סקיני צמוד בצבע שחור פחם משופשף מבית Zara. נלבש פעמים בודדות. מידה 36.",
          price: 100,
          category_id: catMap['jeans'],
          image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cd?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: '36',
          status: 'active',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString()
        },
        {
          id: 'mock-shirt-2',
          title: "טי-שירט לבנה מכותנה אורגנית",
          description: "חולצת בייסיק טי-שירט חלקה בצבע לבן בוהק, בד נעים ואיכותי מאוד. מידה M.",
          price: 60,
          category_id: catMap['shirts'],
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'M',
          status: 'active',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
        },

        // Row 3: Diverse items
        {
          id: 'mock-pants-2',
          title: "מכנסי קרגו זית טרנדיים",
          description: "מכנסי קרגו (דגמ\"ח) אופנתיים עם כיסים בצדדים בצבע ירוק זית. מידה M.",
          price: 135,
          category_id: catMap['pants'],
          image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: 'M',
          status: 'active',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString()
        },
        {
          id: 'mock-top-2',
          title: "גופיית סאטן שחורה אלגנטית",
          description: "גופיית סאטן נשפכת עם כתפיות דקות בצבע שחור עמוק, מתאימה במיוחד ליציאות. מידה M.",
          price: 75,
          category_id: catMap['tops'],
          image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: 'M',
          status: 'active',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString()
        },
        {
          id: 'mock-shoe-3',
          title: "סניקרס נייק אייר פורס 1",
          description: "Nike Air Force 1 לבנות קלאסיות. במצב מעולה, עברו ניקוי יסודי. מידה 44.",
          price: 300,
          category_id: catMap['shoes'],
          image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: '44',
          status: 'active',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
        },
        {
          id: 'mock-jeans-3',
          title: "ג'ינס וינטג' רחב Wide Leg",
          description: "ג'ינס רחב ואופנתי בסגנון רטרו שנות ה-90. צבע כחול בהיר, נוח במיוחד. מידה 38.",
          price: 140,
          category_id: catMap['jeans'],
          image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: '38',
          status: 'active',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString()
        },

        // Row 4: Diverse items
        {
          id: 'mock-shirt-3',
          title: "חולצת פלנל משבצות אופנתית",
          description: "חולצה מכופתרת מבד פלנל חם ונעים עם משבצות באדום ושחור. מידה L.",
          price: 95,
          category_id: catMap['shirts'],
          image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
          condition: 'משומש במצב טוב',
          size: 'L',
          status: 'active',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString()
        },
        {
          id: 'mock-pants-3',
          title: "מכנסי פשתן קיציים לבנים",
          description: "מכנסיים מ-100% פשתן איכותי וקליל בצבע לבן. מעולים לחוף הים או לקיץ. מידה L.",
          price: 110,
          category_id: catMap['pants'],
          image_url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'L',
          status: 'active',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString()
        },
        {
          id: 'mock-top-3',
          title: "גופיית ספורט Nike דריי-פיט",
          description: "גופיית ספורט מנדפת זיעה של נייקי בצבע ורוד עתיק. נוחה לפעילות גופנית. מידה S.",
          price: 90,
          category_id: catMap['tops'],
          image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'S',
          status: 'active',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString()
        },
        {
          id: 'mock-shoe-4',
          title: "סנדלי עור חומות בעיצוב אישי",
          description: "סנדלי עור שטוחות ונוחות במיוחד מעור איכותי, מתאימות לקיץ הישראלי. מידה 39.",
          price: 130,
          category_id: catMap['shoes'],
          image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
          condition: 'משומש במצב טוב',
          size: '39',
          status: 'active',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
        },

        // Row 5: Diverse items
        {
          id: 'mock-jeans-4',
          title: "ג'ינס קרוע אופנתי Pull&Bear",
          description: "ג'ינס עם קרעים מעוצבים בגזרת Mom fit מבית Pull&Bear. נראה מעולה. מידה 34.",
          price: 95,
          category_id: catMap['jeans'],
          image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          condition: 'משומש במצב טוב',
          size: '34',
          status: 'active',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString()
        },
        {
          id: 'mock-shirt-4',
          title: "חולצה מכופתרת פשתן שחורה",
          description: "חולצת פשתן קלילה ואוורירית בצבע שחור, מושלמת ללוק יומיומי משודרג. מידה M.",
          price: 130,
          category_id: catMap['shirts'],
          image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
          condition: 'כמו חדש',
          size: 'M',
          status: 'active',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString()
        },
        {
          id: 'mock-pants-4',
          title: "מכנסי טרנינג אפורים נוחים",
          description: "מכנסי ספורט/פנאי מכותנה עבה ומחממת בצבע אפור מלאנז'. מידה XL.",
          price: 80,
          category_id: catMap['pants'],
          image_url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&auto=format&fit=crop&q=80',
          condition: 'משומש במצב טוב',
          size: 'XL',
          status: 'active',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString()
        },
        {
          id: 'mock-top-4',
          title: "גופיית קרופ בצבע שמנת",
          description: "גופיית קרופ קצרה וקלילה עם עיטור מיוחד בצבע שמנת חם. מידה XS.",
          price: 50,
          category_id: catMap['tops'],
          image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
          condition: 'במצב מצוין',
          size: 'XS',
          status: 'active',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 220).toISOString()
        }
      ];
    }

    const savedCustom = localStorage.getItem('secondwear_custom_products');
    const localProds = savedCustom ? JSON.parse(savedCustom) : [];
    setProducts([...localProds, ...productsList]);
  };

  // 1. Authenticated Actions
  const registerUser = async (userData) => {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          phone: userData.phone,
          avatar_url: userData.avatarUrl
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // 2. Insert user details into public.users table
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: userData.email.toLowerCase(),
          full_name: userData.fullName,
          phone: userData.phone,
          avatar_url: userData.avatarUrl || null
        });

      if (profileError) {
        console.error('Profile insertion error:', profileError);
      }
      
      await fetchUserProfile(authData.user.id, authData.user);
    }
    
    return { user: authData.user, session: authData.session };
  };

  const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    
    if (data.user) {
      await fetchUserProfile(data.user.id, data.user);
    }
    return data.user;
  };

  const loginAsDemo = () => {
    const demoUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test-user@secondwear.co.il',
      full_name: 'לינוי נדב (דמו)',
      phone: '050-1234567',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    sessionStorage.setItem('secondwear_demo_user', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    return demoUser;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const logoutUser = async () => {
    sessionStorage.removeItem('secondwear_demo_user');
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Supabase signout notice:', error.message);
    setCurrentUser(null);
  };

  // 2. Add Product (Sell)
  const addProduct = async (productData) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לפרסם מוצר.');

    const newProd = {
      id: 'prod-' + Date.now(),
      title: productData.title,
      description: productData.description,
      price: parseFloat(productData.price),
      image_url: productData.imageUrl,
      category_id: productData.categoryId,
      user_id: currentUser.id,
      status: 'active', // Instantly active since fee is paid via Credit Card
      fee_proof_url: null,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: productData.title,
            description: productData.description,
            price: parseFloat(productData.price),
            image_url: productData.imageUrl,
            category_id: productData.categoryId,
            user_id: currentUser.id,
            status: 'active',
            fee_proof_url: null
          }
        ])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        await fetchProducts();
        return data[0];
      }
    } catch (err) {
      console.warn('Database addProduct failed, using local fallback:', err.message);
      
      // Save to localStorage for persistence across refreshes
      const savedCustom = localStorage.getItem('secondwear_custom_products');
      const localProds = savedCustom ? JSON.parse(savedCustom) : [];
      const updatedLocal = [newProd, ...localProds];
      localStorage.setItem('secondwear_custom_products', JSON.stringify(updatedLocal));

      setProducts((prev) => [newProd, ...prev]);
      return newProd;
    }
  };

  // 3. Cart Actions
  const addToCart = (product) => {
    if (cart.find((item) => item.id === product.id)) return;
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateLocalCustomProduct = (productId, updates) => {
    const savedCustom = localStorage.getItem('secondwear_custom_products');
    if (savedCustom) {
      const localProds = JSON.parse(savedCustom);
      const updated = localProds.map(p => p.id === productId ? { ...p, ...updates } : p);
      localStorage.setItem('secondwear_custom_products', JSON.stringify(updated));
    }
  };

  // 4. Checkout (P2P transaction initialization)
  const checkoutCart = async (paymentMethod, paymentProofsMap) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לבצע רכישה.');

    // 1. Update local state in-memory immediately (optimistic UI & demo user support)
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const isInCart = cart.some((item) => item.id === p.id);
        if (isInCart) {
          const proofUrl = typeof paymentProofsMap === 'object' ? paymentProofsMap[p.id] : paymentProofsMap;
          const updates = {
            status: 'pending_payment_approval',
            buyer_id: currentUser.id,
            payment_proof_url: proofUrl,
            payment_method: paymentMethod
          };
          updateLocalCustomProduct(p.id, updates);
          return {
            ...p,
            ...updates
          };
        }
        return p;
      })
    );

    // 2. Perform Supabase database update
    for (const item of cart) {
      const proofUrl = typeof paymentProofsMap === 'object' ? paymentProofsMap[item.id] : paymentProofsMap;
      try {
        const { error } = await supabase
          .from('products')
          .update({
            status: 'pending_payment_approval', // Main Flow Step B
            buyer_id: currentUser.id,
            payment_proof_url: proofUrl,
            payment_method: paymentMethod
          })
          .eq('id', item.id);

        if (error) throw error;
      } catch (err) {
        console.warn(`Checkout database update skipped/failed for product ${item.id}:`, err.message);
      }
    }

    clearCart();
    await fetchProducts();
  };

  // 5. Seller approves payment (Step C)
  const approvePayment = async (productId) => {
    // 1. Update local state in-memory immediately
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updateLocalCustomProduct(productId, { status: 'sold' });
          return { ...p, status: 'sold' };
        }
        return p;
      })
    );

    // 2. Database update
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', productId);

      if (error) throw error;
    } catch (err) {
      console.warn(`Database approvePayment failed, using local fallback:`, err.message);
    }
    await fetchProducts();
  };

  // 6. Admin: Approve Listing Fee
  const approveListingFee = async (productId) => {
    // 1. Update local state in-memory immediately
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updateLocalCustomProduct(productId, { status: 'active' });
          return { ...p, status: 'active' };
        }
        return p;
      })
    );

    // 2. Database update
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', productId);

      if (error) throw error;
    } catch (err) {
      console.warn(`Database approveListingFee failed, using local fallback:`, err.message);
    }
    await fetchProducts();
  };

  const deleteProduct = async (productId) => {
    // 1. If it is a custom local fallback product (offline/demo), delete locally
    if (productId.toString().startsWith('prod-')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      const savedCustom = localStorage.getItem('secondwear_custom_products');
      if (savedCustom) {
        const localProds = JSON.parse(savedCustom);
        const updatedLocal = localProds.filter((p) => p.id !== productId);
        localStorage.setItem('secondwear_custom_products', JSON.stringify(updatedLocal));
      }
      return;
    }

    // 2. Delete from Supabase database first
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error(`Database deleteProduct failed for product ${productId}:`, error.message);
      throw error;
    }

    // 3. If database deletion succeeded, filter the local state
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Update User Profile Details
  const updateUserProfile = async (profileData) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לעדכן פרופיל.');

    // 1. If not a mock/demo user, update in database
    if (currentUser.id !== '00000000-0000-0000-0000-000000000000') {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          avatar_url: profileData.avatarUrl || null
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      // Also update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
          avatar_url: profileData.avatarUrl
        }
      });
      if (authError) {
        console.warn('Auth user metadata update warning:', authError.message);
      }
    }

    // 2. Update local state
    const updated = {
      ...currentUser,
      full_name: profileData.fullName,
      phone: profileData.phone,
      avatar_url: profileData.avatarUrl || ''
    };
    setCurrentUser(updated);
    
    // Update demo user storage if demo
    if (currentUser.id === '00000000-0000-0000-0000-000000000000') {
      sessionStorage.setItem('secondwear_demo_user', JSON.stringify(updated));
    }

    // Refresh users cache
    setUsers(prev => ({
      ...prev,
      [currentUser.id]: updated
    }));

    return updated;
  };

  // Update User Email
  const updateUserEmail = async (newEmail) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לעדכן אימייל.');

    if (currentUser.id !== '00000000-0000-0000-0000-000000000000') {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      // Update in public.users table as well
      const { error: dbError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', currentUser.id);
      if (dbError) {
        console.error('Database email update error:', dbError.message);
      }
    }

    const updated = { ...currentUser, email: newEmail };
    setCurrentUser(updated);
    if (currentUser.id === '00000000-0000-0000-0000-000000000000') {
      sessionStorage.setItem('secondwear_demo_user', JSON.stringify(updated));
    }
    
    setUsers(prev => ({
      ...prev,
      [currentUser.id]: updated
    }));
  };

  // Update User Password
  const updateUserPassword = async (newPassword) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לעדכן סיסמה.');

    if (currentUser.id !== '00000000-0000-0000-0000-000000000000') {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    }
  };

  // Send Password Reset Email
  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  // Helper to fetch any user details by ID from local cache state
  const getUserById = (userId) => {
    if (!userId) return null;
    return users[userId] || {
      full_name: 'משתמש/ת SecondWear',
      phone: 'לא זמין',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      cart,
      currentUser,
      loading,
      isSupabaseConfigured,
      registerUser,
      loginUser,
      loginAsDemo,
      loginWithGoogle,
      logoutUser,
      getUserById,
      addProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      clearCart,
      checkoutCart,
      approvePayment,
      approveListingFee,
      updateUserProfile,
      updateUserEmail,
      updateUserPassword,
      sendPasswordResetEmail,
      refreshData: async () => {
        await fetchCategories();
        await fetchProducts();
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
