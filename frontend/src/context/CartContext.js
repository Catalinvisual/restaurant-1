import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { API_URL } from '../apiConfig';
import { getToken } from '../utils/auth';

// 🔧 Creăm contextul
const CartContext = createContext();

// 🔄 Reducer pentru coș
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingIndex = state.findIndex(item => item.id === action.payload.id);
      if (existingIndex !== -1) {
        const updatedItem = {
          ...state[existingIndex],
          quantity: state[existingIndex].quantity + action.payload.quantity
        };
        const updatedState = [...state];
        updatedState[existingIndex] = updatedItem;
        return updatedState;
      }
      return [...state, action.payload];

    case 'REMOVE_BY_INDEX':
      const updatedCart = [...state];
      updatedCart.splice(action.payload, 1);
      return updatedCart;

    case 'UPDATE_QUANTITY':
      return state.map((item, index) =>
        index === action.payload.index
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

// 🔄 Funcție pentru actualizarea statusului comenzii
const updateOrderStatus = async (orderId, newStatus) => {
  const token = getToken();

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ token adăugat
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Eroare la actualizarea statusului comenzii');
    }

    const data = await response.json();
    console.log('✅ Status actualizat:', data);
    return data;
  } catch (error) {
    console.error('❌ Eroare la actualizare:', error);
    throw error;
  }
};

// 🛒 Provider cu salvare automată în localStorage
export const CartProvider = ({ children }) => {
  const initialCart = JSON.parse(localStorage.getItem('cart')) || [];
  const [cartItems, dispatch] = useReducer(cartReducer, initialCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    console.log(`🧾 Total în coș: €${total.toFixed(2)}`);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, dispatch, updateOrderStatus }}>
      {children}
    </CartContext.Provider>
  );
};

// 🧩 Hook personalizat
export const useCart = () => useContext(CartContext);
