import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const BASE_URL = process.env.REACT_APP_API_URL;

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
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
        setNewMenuItem({ ...newMenuItem, image: null });
      }
    } else {
      setNewMenuItem({ ...newMenuItem, [e.target.name]: e.target.value });
    }
  };

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('❌ Nu există token de autentificare.');
      return;
    }

    if (!newMenuItem.image || !(newMenuItem.image instanceof File)) {
      alert('❌ Imaginea nu este setată corect.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newMenuItem.name);
    formData.append('description', newMenuItem.description);
    formData.append('price', Number(newMenuItem.price));
    formData.append('image', newMenuItem.image);

    console.log('📦 FormData:', [...formData.entries()]);

    const url = editingItemId
      ? `${BASE_URL}/api/menu/${editingItemId}`
      : `${BASE_URL}/api/menu`;
    const method = editingItemId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();

      console.log('🧾 Răspuns:', result);

      if (response.ok) {
        if (editingItemId) {
          setMenu(menu.map((item) => (item.id === editingItemId ? result : item)));
          console.log('✏️ Item editat:', result);
        } else {
          setMenu([...menu, result]);
          console.log('✅ Item adăugat:', result);
        }
        setNewMenuItem({ name: '', description: '', price: '', image: null });
        setEditingItemId(null);
      } else {
        alert('❌ Eroare: ' + result.error);
      }
    } catch (err) {
      console.error('❌ Eroare rețea:', err);
      alert('❌ Serverul nu răspunde.');
    }
  };

  const handleDelete = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
  };

  const handleEditClick = (item) => {
    setNewMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      image: null
    });
    setEditingItemId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">
        {editingItemId ? 'Editare Item' : 'Administrare Meniu'}
      </h2>

      <form onSubmit={handleAddOrEdit} className="mb-4" encType="multipart/form-data">
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
              required={!editingItemId}
            />
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">
              {editingItemId ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </div>
      </form>

      {newMenuItem.name &&
        newMenuItem.description &&
        newMenuItem.price &&
        newMenuItem.image && (
          <div className="mb-4">
            <p className="fw-bold">Previzualizare item:</p>
            <ProductCard
              product={{
                ...newMenuItem,
                id: 'preview',
                image:
                  newMenuItem.image instanceof File
                    ? URL.createObjectURL(newMenuItem.image)
                    : newMenuItem.image
              }}
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
            <button
              className="btn btn-sm btn-warning position-absolute top-0 start-0 m-2"
              onClick={() => handleEditClick(item)}
            >
              ✎
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}