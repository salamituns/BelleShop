"use client";

import React, { useState, useEffect } from "react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  category: "Fragrance" | "Skincare" | "Beauty Tech" | "Lifestyle";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  tag?: string;
  description: string;
  imageBg: string;
  iconSvg: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// --- Product Catalog Data ---
const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Santal & Amber Nectar",
    category: "Fragrance",
    price: 185,
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 142,
    tag: "Best Seller",
    description: "Rare Australian sandalwood infused with golden amber, cardamom, and smoked vanilla.",
    imageBg: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #d97706 100%)",
    iconSvg: "✨",
  },
  {
    id: "prod-2",
    name: "Celestial Cellular Elixir",
    category: "Skincare",
    price: 140,
    originalPrice: 165,
    rating: 5.0,
    reviewsCount: 98,
    tag: "New Release",
    description: "Multi-molecular hyaluronic acid combined with marine peptides and 24K gold flakes.",
    imageBg: "linear-gradient(135deg, #022c22 0%, #065f46 50%, #10b981 100%)",
    iconSvg: "💧",
  },
  {
    id: "prod-3",
    name: "Lumina Sonic Sculpting Wand",
    category: "Beauty Tech",
    price: 260,
    rating: 4.8,
    reviewsCount: 84,
    tag: "Award Winner",
    description: "Micro-current and red-light therapy tool for contouring, lifting, and collagen synthesis.",
    imageBg: "linear-gradient(135deg, #311042 0%, #581c87 50%, #a855f7 100%)",
    iconSvg: "⚡",
  },
  {
    id: "prod-4",
    name: "Rose de Mai Midnight Crème",
    category: "Skincare",
    price: 125,
    rating: 4.9,
    reviewsCount: 210,
    tag: "Staff Pick",
    description: "Infused with rare Grasse roses, squalane, and ceramides for overnight cellular repair.",
    imageBg: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #f43f5e 100%)",
    iconSvg: "🌹",
  },
  {
    id: "prod-5",
    name: "Oud Royale Extrait de Parfum",
    category: "Fragrance",
    price: 310,
    originalPrice: 350,
    rating: 5.0,
    reviewsCount: 67,
    tag: "Limited Batch",
    description: "Wild Cambodian agarwood steeped in bourbon vetiver, dark plum, and Moroccan leather.",
    imageBg: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #78716c 100%)",
    iconSvg: "👑",
  },
  {
    id: "prod-6",
    name: "Mulberry Silk Loungewear Kimono",
    category: "Lifestyle",
    price: 195,
    rating: 4.7,
    reviewsCount: 52,
    description: "100% 22-Momme pure grade 6A mulberry silk with french seams and breathable thermal comfort.",
    imageBg: "linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #3b82f6 100%)",
    iconSvg: "👘",
  },
  {
    id: "prod-7",
    name: "Bio-Collagen Eye Infusion Mask",
    category: "Skincare",
    price: 68,
    originalPrice: 85,
    rating: 4.8,
    reviewsCount: 175,
    tag: "Popular",
    description: "Deeply hydrating hydrogel patches infused with caffeine, niacinamide, and bioactive peptides.",
    imageBg: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #06b6d4 100%)",
    iconSvg: "👁️",
  },
  {
    id: "prod-8",
    name: "Ionic Nano Steam Diffuser",
    category: "Beauty Tech",
    price: 155,
    rating: 4.9,
    reviewsCount: 119,
    description: "Ultra-fine ionic warm mist for deep pore purification and enhanced serum absorption.",
    imageBg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #6366f1 100%)",
    iconSvg: "💨",
  },
];

const CATEGORIES = ["All", "Fragrance", "Skincare", "Beauty Tech", "Lifestyle"] as const;

export default function HomePage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  // Auth Form State
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // User Session
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [protectedMessage, setProtectedMessage] = useState<string | null>(null);
  
  // Backend Health State
  const [backendHealth, setBackendHealth] = useState<"checking" | "online" | "offline">("checking");
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  
  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add Toast helper
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check Backend Health
  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/healthz", { cache: "no-store" });
      const duration = Math.round(performance.now() - start);
      if (res.ok) {
        setBackendHealth("online");
        setBackendLatency(duration);
      } else {
        setBackendHealth("offline");
      }
    } catch {
      setBackendHealth("offline");
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Check saved token on mount
  useEffect(() => {
    const token = localStorage.getItem("belleshop_token");
    const user = localStorage.getItem("belleshop_user");
    if (token && user) {
      setAuthToken(token);
      setCurrentUser(user);
      fetchProtectedInfo(token);
    }
  }, []);

  // Fetch Protected Info
  const fetchProtectedInfo = async (token: string) => {
    try {
      const res = await fetch("/api/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProtectedMessage(data.msg || "Authenticated successfully");
      } else if (res.status === 401) {
        // Token expired
        logout();
      }
    } catch (err) {
      console.error("Protected fetch error", err);
    }
  };

  // Auth: Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast("error", "Please provide both username and password.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", `Account created for @${username}! Logging you in...`);
        // Auto login
        await performLogin(username.trim(), password.trim());
      } else {
        addToast("error", data.detail || "Registration failed. Username may already exist.");
      }
    } catch (err) {
      addToast("error", "Could not connect to backend server.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Login
  const performLogin = async (user: string, pass: string) => {
    const params = new URLSearchParams();
    params.append("username", user);
    params.append("password", pass);

    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      setAuthToken(data.access_token);
      setCurrentUser(user);
      localStorage.setItem("belleshop_token", data.access_token);
      localStorage.setItem("belleshop_user", user);
      setIsAuthModalOpen(false);
      setUsername("");
      setPassword("");
      addToast("success", `Welcome back, @${user}! Access token granted.`);
      fetchProtectedInfo(data.access_token);
    } else {
      addToast("error", data.detail || "Invalid credentials. Please verify username and password.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast("error", "Please enter your username and password.");
      return;
    }
    setAuthLoading(true);
    try {
      await performLogin(username.trim(), password.trim());
    } catch (err) {
      addToast("error", "Error connecting to authentication service.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setProtectedMessage(null);
    localStorage.removeItem("belleshop_token");
    localStorage.removeItem("belleshop_user");
    setIsProfileModalOpen(false);
    addToast("info", "Signed out successfully.");
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast("success", `Added ${product.name} to your bag`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Filtered Products
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* --- Top Global Bar --- */}
      <div
        style={{
          background: "rgba(11, 15, 25, 0.95)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "8px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>✨ Complimentary Global Courier on all orders above $100</span>
        </div>

        {/* Live Backend Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--text-muted)" }}>API Cluster Status:</span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 500,
              background:
                backendHealth === "online"
                  ? "rgba(16, 185, 129, 0.12)"
                  : backendHealth === "checking"
                  ? "rgba(234, 179, 8, 0.12)"
                  : "rgba(244, 63, 94, 0.12)",
              border:
                backendHealth === "online"
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : backendHealth === "checking"
                  ? "1px solid rgba(234, 179, 8, 0.3)"
                  : "1px solid rgba(244, 63, 94, 0.3)",
              color:
                backendHealth === "online"
                  ? "#34d399"
                  : backendHealth === "checking"
                  ? "#facc15"
                  : "#fb7185",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "currentColor",
              }}
              className={backendHealth === "online" ? "animate-pulse-glow" : ""}
            />
            {backendHealth === "online"
              ? `FastAPI Online (${backendLatency}ms)`
              : backendHealth === "checking"
              ? "Checking..."
              : "API Unreachable"}
          </div>
        </div>
      </div>

      {/* --- Main Navigation --- */}
      <header
        className="glass-panel"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderLeft: "none",
          borderRight: "none",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 0 16px rgba(212, 175, 55, 0.3)",
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }} className="gold-gradient-text">
              BelleShop
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
              Haute Maison & Essentials
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", flex: "0 1 380px" }}>
          <input
            type="text"
            placeholder="Search perfumes, cellular serums, beauty tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              padding: "10px 18px 10px 40px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              transition: "var(--transition-fast)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-gold)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          />
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "12px" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions (Auth & Cart) */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {currentUser ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                color: "var(--accent-gold-light)",
                fontSize: "13px",
                fontWeight: 600,
                transition: "var(--transition-fast)",
              }}
            >
              <span>👑</span>
              <span>@{currentUser}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border-subtle)",
                padding: "8px 18px",
                borderRadius: "var(--radius-full)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 500,
                transition: "var(--transition-fast)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            >
              Sign In
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: "relative",
              background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
              border: "none",
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              color: "#000",
              fontSize: "14px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(212, 175, 55, 0.3)",
              transition: "var(--transition-fast)",
            }}
          >
            <span>🛍️</span>
            <span>Bag</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: "#000",
                  color: "#d4af37",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "9999px",
                  marginLeft: "2px",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main style={{ flex: 1, padding: "32px 24px 80px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        {/* --- Hero Section --- */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(26, 34, 53, 0.6) 100%)",
            border: "1px solid var(--border-subtle)",
            padding: "54px 48px",
            marginBottom: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 600,
              width: "fit-content",
            }}
            className="gold-badge"
          >
            <span>✨ 2026 Haute Parfumerie & Botanical Skincare</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              maxWidth: "750px",
            }}
          >
            Curated Elegance & <span className="gold-gradient-text">Modern Essentials.</span>
          </h1>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: 1.6 }}>
            Immerse yourself in artisanal fragrances, cellular bio-actives, and intelligent beauty instruments engineered for longevity and radiance.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px" }}>
            <button
              onClick={() => {
                const catalogEl = document.getElementById("catalog-section");
                catalogEl?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
                color: "#000",
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: "var(--radius-full)",
                fontSize: "15px",
                boxShadow: "0 4px 20px rgba(212, 175, 55, 0.35)",
              }}
            >
              Explore Collection ↓
            </button>

            {!currentUser && (
              <button
                onClick={() => {
                  setAuthMode("register");
                  setIsAuthModalOpen(true);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  padding: "12px 24px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "15px",
                }}
              >
                Join VIP Club (15% Off)
              </button>
            )}
          </div>

          {/* DevOps Homelab Badge Strip */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--accent-emerald)" }}>✓</span>
              <span>FastAPI 3.12 Backend</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--accent-emerald)" }}>✓</span>
              <span>MySQL 8 Cloud Native DB</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--accent-emerald)" }}>✓</span>
              <span>Argo Rollouts Canary CI/CD</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--accent-emerald)" }}>✓</span>
              <span>JWT Bearer Auth Protocol</span>
            </div>
          </div>
        </section>

        {/* --- Category Filters --- */}
        <section id="catalog-section" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "26px", fontWeight: 700 }}>Featured Showcase</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Showing {filteredProducts.length} handcrafted essentials
              </p>
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? "linear-gradient(135deg, #d4af37, #b45309)" : "rgba(255, 255, 255, 0.05)",
                      color: isActive ? "#000" : "var(--text-secondary)",
                      border: isActive ? "none" : "1px solid var(--border-subtle)",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* --- Product Grid --- */}
          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "rgba(15, 23, 42, 0.4)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔍</div>
              <div style={{ fontSize: "18px", fontWeight: 600 }}>No products found</div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                Try adjusting your search query or switching categories.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-highlight)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Product Visual Header */}
                  <div
                    style={{
                      height: "190px",
                      background: product.imageBg,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "56px",
                    }}
                  >
                    <span>{product.iconSvg}</span>
                    {product.tag && (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: "rgba(0, 0, 0, 0.75)",
                          backdropFilter: "blur(8px)",
                          color: "var(--accent-gold-light)",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          border: "1px solid rgba(212, 175, 55, 0.4)",
                        }}
                      >
                        {product.tag}
                      </span>
                    )}
                    <span
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        background: "rgba(0, 0, 0, 0.6)",
                        fontSize: "11px",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#facc15", marginBottom: "6px" }}>
                      <span>★ {product.rating.toFixed(1)}</span>
                      <span style={{ color: "var(--text-muted)" }}>({product.reviewsCount} reviews)</span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>{product.name}</h3>

                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1, marginBottom: "16px" }}>
                      {product.description}
                    </p>

                    {/* Price & Add to Cart */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                      <div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                          ${product.price}
                        </div>
                        {product.originalPrice && (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                            ${product.originalPrice}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
                          color: "#000",
                          fontWeight: 700,
                          fontSize: "13px",
                          padding: "8px 16px",
                          borderRadius: "var(--radius-full)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <span>+ Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- VIP Club Banner --- */}
        <section
          style={{
            marginTop: "60px",
            background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid var(--border-highlight)",
            borderRadius: "var(--radius-lg)",
            padding: "40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "36px" }}>👑</div>
          <h2 style={{ fontSize: "28px", fontWeight: 700 }} className="gold-gradient-text">
            BelleShop Maison VIP Privilege
          </h2>
          <p style={{ maxWidth: "600px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>
            Members receive priority access to limited batch parfums, private seasonal sales, and tailored concierge beauty consults.
          </p>
          {currentUser ? (
            <div style={{ color: "var(--accent-gold-light)", fontWeight: 600 }}>
              ✓ You are logged in as VIP Member @{currentUser}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("register");
                setIsAuthModalOpen(true);
              }}
              style={{
                background: "linear-gradient(135deg, #d4af37, #b45309)",
                color: "#000",
                fontWeight: 700,
                padding: "12px 32px",
                borderRadius: "var(--radius-full)",
                fontSize: "15px",
                boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
              }}
            >
              Create Free VIP Account
            </button>
          )}
        </section>
      </main>

      {/* --- Shopping Cart Drawer --- */}
      {isCartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="animate-slide-in"
            style={{
              width: "100%",
              maxWidth: "440px",
              height: "100%",
              background: "var(--bg-secondary)",
              borderLeft: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🛍️</span>
                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Your Shopping Bag ({cartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ fontSize: "18px", color: "var(--text-muted)", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto 0", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Your bag is empty</div>
                  <p style={{ fontSize: "13px", marginTop: "6px" }}>Discover our curated collection to add items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "14px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "6px",
                        background: item.imageBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        flexShrink: 0,
                      }}
                    >
                      {item.iconSvg}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: "var(--accent-gold-light)", fontWeight: 700, marginTop: "2px" }}>
                        ${item.price}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "var(--radius-full)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{ padding: "2px 8px", color: "var(--text-secondary)", fontSize: "13px" }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "18px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{ padding: "2px 8px", color: "var(--text-secondary)", fontSize: "13px" }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => updateQuantity(item.id, -item.quantity)}
                          style={{ fontSize: "11px", color: "var(--accent-rose)", marginLeft: "auto" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer / Checkout */}
            {cart.length > 0 && (
              <div
                style={{
                  padding: "20px 24px",
                  borderTop: "1px solid var(--border-subtle)",
                  background: "rgba(11, 15, 25, 0.95)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <span>Shipping</span>
                  <span style={{ color: "var(--accent-emerald)" }}>FREE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 800, color: "#fff", margin: "14px 0" }}>
                  <span>Total</span>
                  <span className="gold-gradient-text">${cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    addToast("success", "Order simulated successfully! Thank you for choosing BelleShop.");
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
                    color: "#000",
                    fontWeight: 700,
                    padding: "14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "15px",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.35)",
                  }}
                >
                  Proceed to Secure Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Authentication Modal --- */}
      {isAuthModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-highlight)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Tabs */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>
                {authMode === "login" ? "Welcome to BelleShop" : "Join BelleShop VIP"}
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                ✕
              </button>
            </div>

            {/* Toggle Switch */}
            <div
              style={{
                display: "flex",
                background: "rgba(0, 0, 0, 0.4)",
                padding: "4px",
                borderRadius: "var(--radius-full)",
                marginBottom: "24px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                onClick={() => setAuthMode("login")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: authMode === "login" ? 700 : 500,
                  background: authMode === "login" ? "linear-gradient(135deg, #d4af37, #b45309)" : "transparent",
                  color: authMode === "login" ? "#000" : "var(--text-secondary)",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("register")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: authMode === "register" ? 700 : 500,
                  background: authMode === "register" ? "linear-gradient(135deg, #d4af37, #b45309)" : "transparent",
                  color: authMode === "register" ? "#000" : "var(--text-secondary)",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alexander"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
                  color: "#000",
                  fontWeight: 700,
                  padding: "12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "14px",
                  opacity: authLoading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(212, 175, 55, 0.3)",
                }}
              >
                {authLoading ? "Authenticating..." : authMode === "login" ? "Sign In →" : "Create Account →"}
              </button>

              <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                ⚡ Connected to FastAPI `/api/${authMode === "login" ? "token" : "register"}` with MySQL
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIP Profile / Member Modal --- */}
      {isProfileModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-highlight)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              maxWidth: "460px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>👑</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700 }}>VIP Member Lounge</h3>
                  <div style={{ fontSize: "12px", color: "var(--accent-gold-light)" }}>Haute Tier Status: Active</div>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                ✕
              </button>
            </div>

            {/* Profile Info Card */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-muted)" }}>Authenticated User:</span>
                <span style={{ fontWeight: 600, color: "#fff" }}>@{currentUser}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-muted)" }}>Security Protocol:</span>
                <span style={{ color: "var(--accent-emerald)" }}>JWT HS256 Bearer</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-muted)" }}>Protected Route Response:</span>
                <span style={{ color: "var(--accent-gold-light)", fontWeight: 500 }}>{protectedMessage || "Verified"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  if (authToken) {
                    fetchProtectedInfo(authToken);
                    addToast("info", "Pinged /api/protected successfully.");
                  }
                }}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  padding: "10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Test /api/protected
              </button>

              <button
                onClick={logout}
                style={{
                  flex: 1,
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                  padding: "10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Toast Notification Container --- */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "360px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              background:
                toast.type === "success"
                  ? "rgba(6, 78, 59, 0.95)"
                  : toast.type === "error"
                  ? "rgba(136, 19, 55, 0.95)"
                  : "rgba(30, 41, 59, 0.95)",
              border:
                toast.type === "success"
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : toast.type === "error"
                  ? "1px solid rgba(244, 63, 94, 0.4)"
                  : "1px solid var(--border-subtle)",
              backdropFilter: "blur(12px)",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* --- Global Footer --- */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(11, 15, 25, 0.95)",
          padding: "48px 24px 32px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700 }} className="gold-gradient-text">
              ✦ BelleShop
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px", maxWidth: "300px" }}>
              Crafted with high-availability microservices, Kubernetes GitOps, and end-to-end security.
            </p>
          </div>

          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-secondary)" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Boutique</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span>Luxury Fragrance</span>
                <span>Cellular Skincare</span>
                <span>Beauty Devices</span>
                <span>Maison Loungewear</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Homelab Architecture</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span>Next.js 15 App Router</span>
                <span>FastAPI Microservice</span>
                <span>Argo Rollouts Canary</span>
                <span>Prometheus Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            paddingTop: "24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>© 2026 BelleShop Maison Inc. All rights reserved.</div>
          <div>Kubernetes Ingress Cluster • dev namespace</div>
        </div>
      </footer>
    </div>
  );
}
