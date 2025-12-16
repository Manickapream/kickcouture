import { Routes, Route } from 'react-router-dom';
import Dashboard from '../Admin/Dashboard';
import AddProduct from '../Admin/AddProduct';
import EditProduct from '../Admin/EditProduct';
import ViewOrders from '../Admin/ViewOrders';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/AddProduct" element={<AddProduct />} />
      <Route path="/admin/edit-product/:id" element={<EditProduct />} />
      <Route path="/admin/orders" element={<ViewOrders />} />
    </Routes>
  );
};

export default AdminRoutes;
