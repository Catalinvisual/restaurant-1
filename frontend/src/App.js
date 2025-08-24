import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import MyOrders from "./pages/MyOrders";
import { CartProvider } from "./context/CartContext";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminMenu from "./pages/AdminMenu";
import Contact from "./pages/Contact";
import "../src/App.css";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import RequireAuth from "./components/RequireAuth";
import AdminRoute from "./components/AdminRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <MainLayout>
                  <Cart />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <MainLayout>
                <Orders />
              </MainLayout>
            }
          />
          <Route
            path="/my-orders"
            element={
              <MainLayout>
                <MyOrders />
              </MainLayout>
            }
          />
          <Route
            path="/menu"
            element={
              <MainLayout>
                <Menu />
              </MainLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <MainLayout>
                <Checkout />
              </MainLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MainLayout>
                <Contact />
              </MainLayout>
            }
          />

          {/* 🔒 Protejăm pagina admin cu AdminRoute */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminMenu />
                </AdminLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
