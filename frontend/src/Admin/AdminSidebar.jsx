import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers,
  FaStore, FaChartBar, FaWarehouse, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import "./AdminSidebar.css";

const navItems = [
  { to: "/Dashboard",       icon: "FaTachometerAlt", label: "Dashboard"  },
  { to: "/manage-products", icon: "FaBox",           label: "Products"   },
  { to: "/manage-orders",   icon: "FaShoppingBag",  label: "Orders"     },
  { to: "/manage-users",    icon: "FaUsers",         label: "Users"      },
  { to: "/manage-vendors",  icon: "FaStore",         label: "Vendors"    },
  { to: "/report",          icon: "FaChartBar",      label: "Report"     },
  { to: "/inventory",       icon: "FaWarehouse",     label: "Inventory"  },
];

const icons = { FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaStore, FaChartBar, FaWarehouse };

const AdminSidebar = () => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logoutAdmin(); navigate("/"); };

  return (
    <>
      <button className="sidebar-mobile-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><span>Kick</span>Couture</div>
          <p className="brand-sub">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon, label }) => {
            const Icon = icons[icon];
            return (
              <Link key={to} to={to}
                className={`sidebar-link ${location.pathname === to ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="sidebar-icon"><Icon /></span>
                <span className="sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
};

export default AdminSidebar;
