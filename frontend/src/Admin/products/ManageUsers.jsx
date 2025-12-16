import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../products/ManageUsers.css";

function ManageUsers() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user");
      console.log(res.data.users)
      setProducts(res.data.users);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`http://localhost:5000/api/user/${editId}`, formData);
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await axios.delete(`http://localhost:5000/api/user/${id}`);
      fetchProducts();
    }
  };

  const handleDashboard = () => {
    navigate("/Dashboard");
  };

  return (
    <div className="page-container">
      <div className="header">
        <h1 className="logo">
          <span>Kick</span>Couture
        </h1>
        <button onClick={handleDashboard} className="logout-button">
          DashBoard
        </button>
      </div>









      <div className="card">
        <div className="card-header">
          <h2>Manage Users</h2>
        </div>
          <section className="best-selling">
            {products.map((product) => (
              <div className="product-card" key={product._id}>
                {/* <img src={"http://localhost:5000/" + product.image} alt={product.title} /> */}
                <div className="product-info">
                  <h1>{product.name}</h1>
                  <h2>{product.email}</h2>
                  <p>{product.password}</p>
                  {/* <button onClick={() => handleAddToCart(product)}>Add to Cart 🛒</button> */}
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
      </div>
    </div>
  );
}

export default ManageUsers;
