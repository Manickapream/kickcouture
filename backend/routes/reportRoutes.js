const express = require("express");
const router = express.Router();
const Order = require("../models/Order");



// Helper functions
const startOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
    
// 🗓 Weekly Sales Report
router.get("/weekly", async (req, res) => {
  try {
    const start = startOfWeek();
    const end = new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: "cart" }, // ignore cart items
    });

    const dailySales = {};
    for (let o of orders) {
      const day = new Date(o.createdAt).toLocaleDateString("en-GB");
      if (!dailySales[day]) dailySales[day] = { sales: 0, items: 0 };
      dailySales[day].sales += o.totalPrice;
      dailySales[day].items += o.quantity;
    }

    const chartData = Object.entries(dailySales).map(([date, val]) => ({
      date,
      sales: val.sales,
      items: val.items,
    }));

    const totalSales = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalItems = orders.reduce((s, o) => s + o.quantity, 0);
    res.json({ totalSales, totalItems, count: orders.length, chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating weekly report" });
  }
});

// 📅 Monthly Sales Report
router.get("/monthly", async (req, res) => {
  try {
    const start = startOfMonth();
    const end = new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: "cart" },
    });

    const weeklySales = {};
    for (let o of orders) {
      const week = Math.ceil(new Date(o.createdAt).getDate() / 7);
      if (!weeklySales[week]) weeklySales[week] = { sales: 0, items: 0 };
      weeklySales[week].sales += o.totalPrice;
      weeklySales[week].items += o.quantity;
    }

    const chartData = Object.entries(weeklySales).map(([week, val]) => ({
      week: `Week ${week}`,
      sales: val.sales,
      items: val.items,
    }));

    const totalSales = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalItems = orders.reduce((s, o) => s + o.quantity, 0);
    res.json({ totalSales, totalItems, count: orders.length, chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating monthly report" });
  }
});

module.exports = router;
