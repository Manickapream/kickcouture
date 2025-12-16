import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Inventory.css";

const Inventory = () => {
  const [brandCounts, setBrandCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/product/get"),
        axios.get("http://localhost:5000/api/order/get"),
      ]);

      const allProducts = productsRes.data.data || [];
      const allOrders = ordersRes.data.data || [];

      // Count total sold per product (paid orders only)
      const soldCounts = allOrders
        .filter((order) => order.status === "paid")
        .reduce((acc, order) => {
          acc[order.productId] = (acc[order.productId] || 0) + (order.quantity || 1);
          return acc;
        }, {});

      // Filter out sold-out products
      const availableProducts = allProducts.filter((p) => {
        const sold = soldCounts[p._id] || 0;
        return !p.stock || sold < p.stock; // still available
      });

      // Count available products by brand
      const counts = availableProducts.reduce((acc, item) => {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
        return acc;
      }, {});

      setBrandCounts(counts);
    } catch (err) {
      console.error("Error fetching inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>📦 Inventory Management</h1>
        <p>Monitor available products and stock counts per brand.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="inventory-card">
          <h2>📊 Available Product Count by Brand</h2>

          {Object.keys(brandCounts).length > 0 ? (
            <ul className="brand-list">
              {Object.entries(brandCounts).map(([brand, count], index) => (
                <li key={brand} className="brand-item">
                  <div className="brand-name">
                    <span className="brand-circle">{brand[0]}</span>
                    {brand}
                  </div>
                  <span className={`brand-count count-${(index % 4) + 1}`}>
                    {count} available
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-products">All products sold out!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;
