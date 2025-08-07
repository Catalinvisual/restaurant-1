import React, { createContext, useReducer, useContext, useEffect } from 'react';

const CartContext = createContext();

// 🔄 Reducer cu verificare duplicat și actualizare cantitate
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
    <CartContext.Provider value={{ cartItems, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// 🧩 Hook personalizat
export const useCart = () => useContext(CartContext);