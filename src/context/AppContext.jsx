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
        setCurrentUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        setCurrentUser(null);
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
      console.error('Error fetching categories:', err.message);
    }
  };

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    try {
      // 1. Fetch categories to ensure correct mapping of category IDs for the fallback mock products
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      const currentCats = catData || [];

      // 2. Fetch products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      let productsList = data || [];
      
      if (productsList.length === 0) {
        // Build category map to resolve category UUIDs dynamically
        const catMap = {};
        currentCats.forEach(c => {
          if (c.name.includes('נעליים')) catMap['shoes'] = c.id;
          if (c.name.includes('ג\'ינס')) catMap['jeans'] = c.id;
          if (c.name.includes('מכנסיים')) catMap['pants'] = c.id;
          if (c.name.includes('חולצה')) catMap['shirts'] = c.id;
          if (c.name.includes('גופיות')) catMap['tops'] = c.id;
        });

        // 20 beautiful pre-seeded mock products to make the store feel alive (4 per category)
        productsList = [
          // Category 1: נעליים (shoes)
          {
            id: 'mock-shoe-1',
            name: "סניקרס אדידס סטן סמית'",
            description: "נעלי Adidas Stan Smith לבנות קלאסיות. מידה 42. ננעלו פעמים בודדות בלבד ובמצב מעולה.",
            price: 220,
            category_id: catMap['shoes'] || '',
            image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: '42',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          },
          {
            id: 'mock-shoe-2',
            name: "מגפי עור שחורים Zara",
            description: "מגפי עור אלגנטיים של זארה בצבע שחור, נוחים ומתאימים לחורף. מידה 38.",
            price: 180,
            category_id: catMap['shoes'] || '',
            image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: '38',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          },
          {
            id: 'mock-shoe-3',
            name: "סניקרס נייק אייר פורס 1",
            description: "Nike Air Force 1 לבנות קלאסיות. במצב מעולה, עברו ניקוי יסודי. מידה 44.",
            price: 300,
            category_id: catMap['shoes'] || '',
            image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: '44',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
          },
          {
            id: 'mock-shoe-4',
            name: "סנדלי עור חומות בעיצוב אישי",
            description: "סנדלי עור שטוחות ונוחות במיוחד מעור איכותי, מתאימות לקיץ הישראלי. מידה 39.",
            price: 130,
            category_id: catMap['shoes'] || '',
            image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
            condition: 'משומש במצב טוב',
            size: '39',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
          },

          // Category 2: ג'ינס (jeans)
          {
            id: 'mock-jeans-1',
            name: "ג'ינס Levi's 501 קלאסי",
            description: "ג'ינס ליוויס מקורי בגזרה ישרה קלאסית. צבע כחול בינוני, במצב מעולה. מידה 32.",
            price: 190,
            category_id: catMap['jeans'] || '',
            image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: '32',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          },
          {
            id: 'mock-jeans-2',
            name: "ג'ינס סקיני שחור משופשף",
            description: "ג'ינס סקיני צמוד בצבע שחור פחם משופשף מבית Zara. נלבש פעמים בודדות. מידה 36.",
            price: 100,
            category_id: catMap['jeans'] || '',
            image_url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cd?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: '36',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString()
          },
          {
            id: 'mock-jeans-3',
            name: "ג'ינס וינטג' רחב Wide Leg",
            description: "ג'ינס רחב ואופנתי בסגנון רטרו שנות ה-90. צבע כחול בהיר, נוח במיוחד. מידה 38.",
            price: 140,
            category_id: catMap['jeans'] || '',
            image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: '38',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString()
          },
          {
            id: 'mock-jeans-4',
            name: "ג'ינס קרוע אופנתי Pull&Bear",
            description: "ג'ינס עם קרעים מעוצבים בגזרת Mom fit מבית Pull&Bear. נראה מעולה. מידה 34.",
            price: 95,
            category_id: catMap['jeans'] || '',
            image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
            condition: 'משומש במצב טוב',
            size: '34',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString()
          },

          // Category 3: מכנסיים (pants)
          {
            id: 'mock-pants-1',
            name: "מכנסי מחוייט אלגנטי זארה",
            description: "מכנסיים מחויטים בצבע בז' חול של Zara. מתאימים לעבודה או לאירוע ערב. מידה S.",
            price: 120,
            category_id: catMap['pants'] || '',
            image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'S',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
          },
          {
            id: 'mock-pants-2',
            name: "מכנסי קרגו זית טרנדיים",
            description: "מכנסי קרגו (דגמ\"ח) אופנתיים עם כיסים בצדדים בצבע ירוק זית. מידה M.",
            price: 135,
            category_id: catMap['pants'] || '',
            image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: 'M',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString()
          },
          {
            id: 'mock-pants-3',
            name: "מכנסי פשתן קיציים לבנים",
            description: "מכנסיים מ-100% פשתן איכותי וקליל בצבע לבן. מעולים לחוף הים או לקיץ. מידה L.",
            price: 110,
            category_id: catMap['pants'] || '',
            image_url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'L',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString()
          },
          {
            id: 'mock-pants-4',
            name: "מכנסי טרנינג אפורים נוחים",
            description: "מכנסי ספורט/פנאי מכותנה עבה ומחממת בצבע אפור מלאנז'. מידה XL.",
            price: 80,
            category_id: catMap['pants'] || '',
            image_url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600&auto=format&fit=crop&q=80',
            condition: 'משומש במצב טוב',
            size: 'XL',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString()
          },

          // Category 4: חולצה (shirts)
          {
            id: 'mock-shirt-1',
            name: "חולצה מכופתרת פסים כחול-לבן",
            description: "חולצה מכופתרת מכותנה דקה עם פסי תכלת ולבן עדינים, גזרה קלאסית. מידה L.",
            price: 115,
            category_id: catMap['shirts'] || '',
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: 'L',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          {
            id: 'mock-shirt-2',
            name: "טי-שירט לבנה מכותנה אורגנית",
            description: "חולצת בייסיק טי-שירט חלקה בצבע לבן בוהק, בד נעים ואיכותי מאוד. מידה M.",
            price: 60,
            category_id: catMap['shirts'] || '',
            image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'M',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
          },
          {
            id: 'mock-shirt-3',
            name: "חולצת פלנל משבצות אופנתית",
            description: "חולצה מכופתרת מבד פלנל חם ונעים עם משבצות באדום ושחור. מידה L.",
            price: 95,
            category_id: catMap['shirts'] || '',
            image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
            condition: 'משומש במצב טוב',
            size: 'L',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString()
          },
          {
            id: 'mock-shirt-4',
            name: "חולצה מכופתרת פשתן שחורה",
            description: "חולצת פשתן קלילה ואוורירית בצבע שחור, מושלמת ללוק יומיומי משודרג. מידה M.",
            price: 130,
            category_id: catMap['shirts'] || '',
            image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'M',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString()
          },

          // Category 5: גופיות (tops)
          {
            id: 'mock-top-1',
            name: "גופיית ריב לבנה בייסיק",
            description: "גופיית בייסיק מבד ריב נמתח בצבע לבן. מחמיאה ומתאימה לכל לוק קיצי. מידה S.",
            price: 45,
            category_id: catMap['tops'] || '',
            image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'S',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
          },
          {
            id: 'mock-top-2',
            name: "גופיית סאטן שחורה אלגנטית",
            description: "גופיית סאטן נשפכת עם כתפיות דקות בצבע שחור עמוק, מתאימה במיוחד ליציאות. מידה M.",
            price: 75,
            category_id: catMap['tops'] || '',
            image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: 'M',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString()
          },
          {
            id: 'mock-top-3',
            name: "גופיית ספורט Nike דריי-פיט",
            description: "גופיית ספורט מנדפת זיעה של נייקי בצבע ורוד עתיק. נוחה לפעילות גופנית. מידה S.",
            price: 90,
            category_id: catMap['tops'] || '',
            image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'S',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString()
          },
          {
            id: 'mock-top-4',
            name: "גופיית קרופ בצבע שמנת",
            description: "גופיית קרופ קצרה וקלילה עם עיטור מיוחד בצבע שמנת חם. מידה XS.",
            price: 50,
            category_id: catMap['tops'] || '',
            image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: 'XS',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date(Date.now() - 1000 * 60 * 220).toISOString()
          }
        ];
      }

      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }
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
    
    return authData.user;
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
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
    setCurrentUser(null);
  };

  // 2. Add Product (Sell)
  const addProduct = async (productData) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לפרסם מוצר.');

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
          status: 'pending_fee_approval', // Main Flow Step A
          fee_proof_url: productData.feeProofUrl
        }
      ])
      .select();

    if (error) throw error;
    await fetchProducts();
    return data?.[0];
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

  // 4. Checkout (P2P transaction initialization)
  const checkoutCart = async (paymentMethod, paymentProofUrl) => {
    if (!currentUser) throw new Error('עליך להיות מחובר כדי לבצע רכישה.');

    for (const item of cart) {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'pending_payment_approval', // Main Flow Step B
          buyer_id: currentUser.id,
          payment_proof_url: paymentProofUrl,
          payment_method: paymentMethod
        })
        .eq('id', item.id);

      if (error) {
        console.error(`Checkout error for product ${item.id}:`, error.message);
      }
    }

    clearCart();
    await fetchProducts();
  };

  // 5. Seller approves payment (Step C)
  const approvePayment = async (productId) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'sold' })
      .eq('id', productId);

    if (error) throw error;
    await fetchProducts();
  };

  // 6. Admin: Approve Listing Fee
  const approveListingFee = async (productId) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'active' })
      .eq('id', productId);

    if (error) throw error;
    await fetchProducts();
  };

  // Helper to fetch any user details by ID
  const getUserById = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      return {
        full_name: 'משתמש/ת SecondWear',
        phone: 'לא זמין',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      };
    }
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
      loginWithGoogle,
      logoutUser,
      getUserById,
      addProduct,
      addToCart,
      removeFromCart,
      clearCart,
      checkoutCart,
      approvePayment,
      approveListingFee,
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
