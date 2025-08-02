import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

export default function AdminMenu() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });

  useEffect(() => {
    // Preluare produse deja existente
    fetch('http://localhost:3001/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('❌ Eroare la preluare produse:', err));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('image', newProduct.image);

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const added = await response.json();
      if (response.ok) {
        console.log('✅ Produs adăugat:', added);
        setProducts([...products, added]);
        setNewProduct({ name: '', description: '', price: '', image: null });
      } else {
        alert('❌ Eroare: ' + added.error);
      }
    } catch (err) {
      alert('❌ Serverul nu răspunde.');
    }
  };

  const handleDelete = (id) => {
    setProducts(products.filter((item) => item.id !== id));
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
              placeholder="Nume produs"
              value={newProduct.name}
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
              value={newProduct.description}
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
              value={newProduct.price}
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

      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 position-relative">
            <ProductCard product={product} />
            <button
              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
              onClick={() => handleDelete(product.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}