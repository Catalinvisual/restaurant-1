import React, { createContext, useReducer, useContext, useEffect } from 'react';

const CartContext = createContext();

// 🔄 Reducer cu actualizare cantitate
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
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

export const CartProvider = ({ children }) => {
  const initialCart = JSON.parse(localStorage.getItem('cart')) || [];
  const [cartItems, dispatch] = useReducer(cartReducer, initialCart);

  // 💾 Salvare automată în localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);