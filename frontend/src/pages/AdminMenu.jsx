import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

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
    toast.error('❌ Token lipsă. Autentifică-te ca admin.');
    return;
  }

  const formData = new FormData();
  formData.append('name', newMenuItem.name);
  formData.append('description', newMenuItem.description);
  formData.append('price', Number(newMenuItem.price));

  // ⬇️ Imagine nouă sau existentă
  if (newMenuItem.image instanceof File) {
    formData.append('image', newMenuItem.image);
  } else if (typeof newMenuItem.image === 'string') {
    formData.append('image', newMenuItem.image); // 🔁 trimite linkul existent
  }

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

    if (response.ok) {
      if (editingItemId) {
        setMenu(menu.map((item) => (item.id === editingItemId ? result : item)));
        toast.success('✏️ Produs actualizat cu succes!', {
          position: 'top-right',
          autoClose: 2000
        });
      } else {
        setMenu([...menu, result]);
        toast.success('✅ Produs adăugat cu succes!', {
          position: 'top-right',
          autoClose: 2000
        });
      }
      setNewMenuItem({ name: '', description: '', price: '', image: null });
      setEditingItemId(null);
    } else {
      toast.error(`❌ Eroare: ${result.error}`);
    }
  } catch (err) {
    console.error('❌ Eroare rețea:', err);
    toast.error('❌ Serverul nu răspunde.');
  }
};

  const handleDelete = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${BASE_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      setMenu(menu.filter((item) => item.id !== id));
      toast.info('✅ Produs șters cu succes 🗑️', {
        position: 'top-right',
        autoClose: 2000
      });
    } else {
      toast.error('❌ Nu s-a putut șterge item-ul.');
    }
  } catch (err) {
    console.error('❌ Eroare la ștergere:', err);
    toast.error('❌ Eroare de rețea la ștergere.');
  }
};


  const handleEditClick = (item) => {
    setNewMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || null
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
        (newMenuItem.image || editingItemId) && (
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