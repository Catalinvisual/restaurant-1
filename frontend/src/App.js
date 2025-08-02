import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import MyOrders from './pages/MyOrders';
import { CartProvider } from './context/CartContext';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import AdminMenu from './pages/AdminMenu';
import '../src/App.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <CartProvider>
      <Router>
        {/* 🛎️ ToastContainer e recomandat aici pentru ca notificările să nu fie afectate de layout */}
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="app-container">
          <Header />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<AdminMenu />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
