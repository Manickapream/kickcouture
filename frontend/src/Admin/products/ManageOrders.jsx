import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../products/ManageProducts.css";

function ManageOrders() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order/all");
      setProducts(res.data.orders);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleDelete = async (order) => {
    if (order.status === "approved") {
      alert("❌ Approved orders cannot be deleted!");
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/order/${order._id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error removing order", err);
    }
  };

 const handleApprove = async (order) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/order/${order._id}/approve`
    );
    alert(res.data.message || "✅ Order approved successfully!");
    fetchProducts(); // refresh
  } catch (err) {
    console.error("Error approving order:", err.response?.data || err);
    alert(err.response?.data?.message || "Failed to approve order!");
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
          <h2>Manage Orders</h2>
        </div>

        <section className="best-selling">
          {products.map((order) => {
            const product = order.productId;
            return (
              <div className="product-card" key={order._id}>
                <img
                  src={"http://localhost:5000/" + product.image}
                  alt={product.title}
                />
                <div className="product-info">
                  <h1>{product.name}</h1>
                  <h2>Status: {order.status}</h2>
                  <h2>Recipient: {order.email}</h2>
                  <h2>Size: {product.size}</h2>
                  <h3>₹ {product.price}</h3>
                  <p>Brand: {product.brand}</p>
                  <p>{product.description}</p>

                  <button onClick={() => handleDelete(order)}>❌ Cancel</button>
                  <button
                    onClick={() => handleApprove(order)}
                    disabled={order.status === "approved"}
                    className={order.status === "approved" ? "disabled" : ""}
                  >
                    {order.status === "approved" ? "Approved" : "Approve"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default ManageOrders;
