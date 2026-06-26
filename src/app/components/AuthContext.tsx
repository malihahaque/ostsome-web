import { createContext, useContext, useState, useEffect } from 'react';

export type AuthUser = {
  firstName: string;
  lastName: string;
  email: string;
  shopifyToken?: string; // Shopify customer access token
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  shopifyToken: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'ostsome_customer_token';
const USER_KEY  = 'ostsome_customer_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [shopifyToken, setShopifyToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  function login(u: AuthUser) {
    setUser(u);
    if (u.shopifyToken) {
      setShopifyToken(u.shopifyToken);
      localStorage.setItem(TOKEN_KEY, u.shopifyToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    setShopifyToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, shopifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}