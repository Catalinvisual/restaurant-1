import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

// 🔗 Importăm URL-ul backendului din .env
const BASE_URL = process.env.REACT_APP_API_URL;

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });

  useEffect(() => {
    // ⚡ Preluare meniu de la backend
    fetch(`${BASE_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error('❌ Eroare la preluare meniu:', err));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        setNewMenuItem({ ...newMenuItem, image: file });
      } else {
        alert('❌ Fișierul selectat nu este o imagine validă.');
      }
    } else {
      setNewMenuItem({ ...newMenuItem, [e.target.name]: e.target.value });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newMenuItem.image || !(newMenuItem.image instanceof File)) {
      alert('❌ Imaginea este invalidă.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('name', newMenuItem.name);
      formData.append('description', newMenuItem.description);
      formData.append('price', Number(newMenuItem.price));
      formData.append('image', newMenuItem.image);

      const response = await fetch(`${BASE_URL}/api/menu`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const added = await response.json();
      if (response.ok) {
        console.log('✅ Item de meniu adăugat:', added);
        setMenu([...menu, added]);
        setNewMenuItem({ name: '', description: '', price: '', image: null });
      } else {
        alert('❌ Eroare: ' + added.error);
      }
    } catch (err) {
      alert('❌ Serverul nu răspunde.');
    }
  };

  const handleDelete = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Administrare Meniu</h2>

      <form onSubmit={handleAdd} className="mb-4" encType="multipart/form-data">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Nume item"
              value={newMenuItem.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="description"
              placeholder="Descriere"
              value={newMenuItem.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="price"
              placeholder="Preț"
              value={newMenuItem.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="file"
              className="form-control"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">Adaugă</button>
          </div>
        </div>
      </form>

      {/* 🖼️ Previzualizare imagine înainte de trimitere */}
      {newMenuItem.image && (
        <div className="mb-4">
          <p className="fw-bold">Previzualizare imagine:</p>
          <img
            src={URL.createObjectURL(newMenuItem.image)}
            alt="Previzualizare"
            className="img-thumbnail"
            style={{ maxWidth: '200px' }}
          />
        </div>
      )}

      <div className="row">
        {menu.map((item) => (
          <div key={item.id} className="col-md-4 position-relative">
            <ProductCard product={item} />
            <button
              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
              onClick={() => handleDelete(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}