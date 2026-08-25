import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('huellitas_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage', error);
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('huellitas_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }, [cart]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Limit to stock if available
        const newQty = Math.min(existingItem.quantity + quantity, product.stock || 99);
        showToast(`Cantidad actualizada de ${product.name} en el carrito!`);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      showToast(`${product.name} agregado al carrito!`);
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    const item = cart.find((i) => i.id === productId);
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    if (item) {
      showToast(`${item.name} eliminado del carrito.`, 'info');
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Carrito vaciado.', 'info');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toast,
        showToast
      }}
    >
      {children}
      
      {/* Premium Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-premium max-w-sm rounded-xl overflow-hidden pointer-events-auto">
          <div className={`px-4 py-3 border-l-4 flex items-center justify-between gap-3 ${
            toast.type === 'success' 
              ? 'bg-[#fcfbf9] border-sage-500 text-sage-800' 
              : toast.type === 'info'
              ? 'bg-[#fcfbf9] border-accent-400 text-accent-800'
              : 'bg-[#fcfbf9] border-primary-500 text-primary-800'
          }`}>
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast(null)} 
              className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
