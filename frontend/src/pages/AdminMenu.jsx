import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Statistics from "../components/Statistics";
import Orders from "./Orders";
import Clients from "./Clients";
import { toast } from "react-toastify";
import { API_URL } from "../apiConfig";
import { parseJwt } from "../utils/auth";
import "../../src/assets/styles/AdminMenu.css";

export default function AdminMenu() {
  const [activeSection, setActiveSection] = useState("menu");
  const [menu, setMenu] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    isNew: false,
    isPromo: false,
    category: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Verificare token la accesare
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined") {
      navigate("/login?expired=true");
      return;
    }
    const payload = parseJwt(token);
    const now = Date.now() / 1000;
    if (!payload || payload.exp < now) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login?expired=true");
    }
  }, [navigate]);

  // ✅ Preluare meniu doar când secțiunea "menu" e activă
  useEffect(() => {
    if (activeSection !== "menu") return;
    fetch(`${API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("❌ Eroare la preluare meniu:", err));
  }, [activeSection]);

  // ✅ Tema salvată
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  };

  const handleOrdersChange = () => setRefreshKey((k) => k + 1);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setNewItem((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "image") {
      const file = files?.[0];
      if (file?.type?.startsWith("image/")) {
        setNewItem((prev) => ({ ...prev, image: file }));
      } else {
        toast.error("❌ Fișierul selectat nu este valid.");
        setNewItem((prev) => ({ ...prev, image: null }));
      }
    } else {
      setNewItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      description: "",
      price: "",
      image: null,
      isNew: false,
      isPromo: false,
      category: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newItem.image?.size > 5 * 1024 * 1024) {
      toast.error("❌ Imaginea este prea mare. Maxim 5MB.");
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("❌ Token lipsă. Autentifică-te.");
      return;
    }
    const formData = new FormData();
    Object.entries(newItem).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else {
        formData.append(key, key === "price" ? Number(value) : value);
      }
    });
    const url = editingId ? `${API_URL}/menu/${editingId}` : `${API_URL}/menu`;
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        const updatedMenu = editingId
          ? menu.map((item) => (item.id === editingId ? result : item))
          : [...menu, result];
        setMenu(updatedMenu);
        toast.success(editingId ? "✏️ Produs actualizat!" : "✅ Produs adăugat!");
        resetForm();
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(`❌ Eroare: ${result.error}`);
      }
    } catch {
      toast.error("❌ Serverul nu răspunde.");
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      image: null,
      isNew: item.isNew || false,
      isPromo: item.isPromo || false,
      category: item.category || "",
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMenu((prev) => prev.filter((item) => item.id !== id));
        toast.info("🗑️ Produs șters cu succes");
        setRefreshKey((k) => k + 1);
      } else {
        toast.error("❌ Nu s-a putut șterge produsul.");
      }
    } catch {
      toast.error("❌ Eroare de rețea.");
    }
  };

  const sections = [
    { id: "menu", label: "Meniu 🍽️" },
    { id: "inventory", label: "Inventar 📦" },
    { id: "orders", label: "Comenzi 🛒" },
    { id: "stats", label: "Statistici 📊" },
    { id: "clients", label: "Clienți 👥" },
    { id: "staff", label: "Staff 🧑‍🍳" },
    { id: "schedule", label: "Programări 🗓️" },
  ];

  return (
    <>
      {/* Buton Hamburger */}
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className="admin-dashboard">
        {/* Schimbare temă */}
        <div className="theme-switch" onClick={toggleTheme}>
          🌗 Schimbă tema
        </div>

        {/* Sidebar unic */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <h2>🍕 Admin Restaurant</h2>
          <ul>
            {sections.map((section) => (
              <li
                key={section.id}
                className={activeSection === section.id ? "active" : ""}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
              >
                {section.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Zona principală */}
        <main className="main-area">
          <h1>{sections.find((s) => s.id === activeSection)?.label}</h1>

          {activeSection === "menu" && (
            <>
              <div className="card-add-product">
                <h2>Adaugă produse noi</h2>
                <form className="product-form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nume produs"
                    value={newItem.name}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Descriere"
                    value={newItem.description}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Preț (€)"
                    value={newItem.price}
                    onChange={handleChange}
                    required
                  />
                                    <select
                    name="category"
                    value={newItem.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selectează categoria</option>
                    <option value="mancare">Mâncare</option>
                    <option value="bautura">Băutură</option>
                  </select>

                  <div className="checkbox-row">
                    <label className="tag-new">
                      <input
                        type="checkbox"
                        name="isNew"
                        checked={newItem.isNew}
                        onChange={handleChange}
                      />
                      Nou
                    </label>
                    <label className="tag-promo">
                      <input
                        type="checkbox"
                        name="isPromo"
                        checked={newItem.isPromo}
                        onChange={handleChange}
                      />
                      Promo
                    </label>
                  </div>

                  <label className="file-upload">
                    Alege imaginea produsului
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </label>

                  <div className="form-actions">
                    <button type="submit">
                      {editingId ? "Salvează" : "Adaugă"}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetForm}>
                        Anulează
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Previzualizare produs */}
              {newItem.name && newItem.description && newItem.price && (
                <div className="preview">
                  <p>Previzualizare:</p>
                  <ProductCard
                    product={{
                      ...newItem,
                      id: "preview",
                      image:
                        newItem.image instanceof File
                          ? URL.createObjectURL(newItem.image)
                          : newItem.image,
                    }}
                  />
                </div>
              )}

              {/* Lista de produse */}
              <div className="product-grid">
                {menu.map((item) => (
                  <div key={item.id} className="product-wrapper">
                    <div className="product-card-wrapper">
                      <div className="product-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                          aria-label={`Editează ${item.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Șterge ${item.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                      <ProductCard product={item} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "orders" && (
            <div className="admin-panel">
              <Orders onOrderUpdated={handleOrdersChange} />
            </div>
          )}

          {activeSection === "stats" && (
            <div className="admin-panel">
              <Statistics refreshKey={refreshKey} />
            </div>
          )}

          {activeSection === "clients" && (
            <div className="admin-panel">
              <Clients />
            </div>
          )}

          {["inventory", "staff", "schedule"].includes(activeSection) && (
            <section className="placeholder">
              <p>Funcționalitate în curs de dezvoltare.</p>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
