import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getCustomerToken, setCustomerToken, getAdminToken, setAdminToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);

  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Initialize Customer Session
  useEffect(() => {
    const token = getCustomerToken();
    if (token) {
      api.customerAuth.getProfile()
        .then(res => {
          setCustomer(res.user);
          setCustomerAddresses(res.addresses || []);
        })
        .catch(err => {
          console.warn('Customer session expired or invalid:', err.message);
          setCustomerToken(null);
          setCustomer(null);
        })
        .finally(() => setCustomerLoading(false));
    } else {
      setCustomerLoading(false);
    }
  }, []);

  // Initialize Admin Session
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      api.adminAuth.getProfile()
        .then(res => {
          setAdmin(res.admin);
        })
        .catch(err => {
          console.warn('Admin session expired or invalid:', err.message);
          setAdminToken(null);
          setAdmin(null);
        })
        .finally(() => setAdminLoading(false));
    } else {
      setAdminLoading(false);
    }
  }, []);

  // Customer Login with Cart & Wishlist Merge
  const customerLogin = async (email, password, guestCart = [], guestWishlist = []) => {
    const res = await api.customerAuth.login({ email, password });
    setCustomerToken(res.token);
    setCustomer(res.user);

    // Refresh profile to load addresses
    try {
      const prof = await api.customerAuth.getProfile();
      setCustomerAddresses(prof.addresses || []);
    } catch (e) {
      console.warn('Could not load addresses on login:', e);
    }

    // Merge guest cart if items exist
    let mergedCart = null;
    if (guestCart && guestCart.length > 0) {
      try {
        mergedCart = await api.cart.merge(guestCart);
      } catch (e) {
        console.warn('Cart merge error on login:', e);
      }
    }

    // Merge guest wishlist if items exist
    let mergedWishlist = null;
    if (guestWishlist && guestWishlist.length > 0) {
      try {
        mergedWishlist = await api.wishlist.merge(guestWishlist);
      } catch (e) {
        console.warn('Wishlist merge error on login:', e);
      }
    }

    return { ...res, mergedCart, mergedWishlist };
  };

  const customerRegister = async (data) => {
    const res = await api.customerAuth.register(data);
    if (res.token) {
      setCustomerToken(res.token);
      setCustomer(res.user);
      try {
        const prof = await api.customerAuth.getProfile();
        setCustomerAddresses(prof.addresses || []);
      } catch (e) {}
    }
    return res;
  };

  const customerLogout = async () => {
    try {
      await api.customerAuth.logout();
    } catch (e) {}
    setCustomerToken(null);
    setCustomer(null);
    setCustomerAddresses([]);
    try {
      localStorage.removeItem('forge3d_current_customer');
      localStorage.removeItem('forge3d_local_cart');
      localStorage.removeItem('forge3d_local_wishlist');
    } catch {}
  };

  const refreshCustomerProfile = async () => {
    try {
      const res = await api.customerAuth.getProfile();
      setCustomer(res.user);
      setCustomerAddresses(res.addresses || []);
      return res;
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Login
  const adminLogin = async (email, password) => {
    const res = await api.adminAuth.login({ email, password });
    setAdminToken(res.token);
    setAdmin(res.admin);
    return res;
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdmin(null);
    try {
      localStorage.removeItem('forge3d_current_admin');
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      customer,
      customerAddresses,
      customerLoading,
      customerLogin,
      customerRegister,
      customerLogout,
      refreshCustomerProfile,
      admin,
      adminLoading,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
