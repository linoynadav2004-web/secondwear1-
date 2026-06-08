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
          if (c.name.includes('חולצות')) catMap['shirts'] = c.id;
          if (c.name.includes('מכנסיים')) catMap['pants'] = c.id;
          if (c.name.includes('שמלות')) catMap['dresses'] = c.id;
          if (c.name.includes('ז\'קטים') || c.name.includes('מעילים')) catMap['jackets'] = c.id;
          if (c.name.includes('נעליים')) catMap['shoes'] = c.id;
          if (c.name.includes('אקססוריז')) catMap['accessories'] = c.id;
        });

        // 4 beautiful pre-seeded mock products to make the store feel alive
        productsList = [
          {
            id: 'mock-1',
            name: "ז'קט ג'ינס וינטג' ליוויס",
            description: "ז'קט ג'ינס Levi's מקורי במצב מעולה, כמעט ולא נלבש. מידה M.",
            price: 150,
            category_id: catMap['jackets'] || '',
            image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: 'M',
            status: 'active',
            user_id: 'mock-user-1',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            name: 'שמלת פרחים קיצית Zara',
            description: 'שמלה פרחונית קלילה ואלגנטית של Zara, מתאימה לקיץ ולאירועים. מידה S.',
            price: 90,
            category_id: catMap['dresses'] || '',
            image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
            condition: 'במצב מצוין',
            size: 'S',
            status: 'active',
            user_id: 'mock-user-2',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-3',
            name: 'סניקרס אדידס סטן סמית\'',
            description: 'נעלי Adidas Stan Smith לבנות קלאסיות. מידה 42. ננעלו פעמים בודדות בלבד.',
            price: 220,
            category_id: catMap['shoes'] || '',
            image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
            condition: 'כמו חדש',
            size: '42',
            status: 'active',
            user_id: 'mock-user-3',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-4',
            name: 'סוודר גולף צמר מפנק',
            description: 'סוודר גולף בצבע שמנת, עשוי 100% צמר איכותי ומחמם מאוד. מידה L.',
            price: 120,
            category_id: catMap['shirts'] || '',
            image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
            condition: 'משומש במצב טוב',
            size: 'L',
            status: 'active',
            user_id: 'mock-user-4',
            created_at: new Date().toISOString()
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
