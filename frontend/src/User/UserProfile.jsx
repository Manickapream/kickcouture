import React from 'react'
import UserNavbar from '../Navbar/UserNavbar'
import { Cart } from '../Cart/Cart'
import { OldOrders } from '../OldOrders/OldOrders'
import { useNavigate } from 'react-router-dom'


const UserProfile = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    if (isLoggedIn === "false") {
      navigate('/UserLogin');
    }
  }, [navigate]);

  return (
    <>
      <div>
        <h1>User</h1>
        <Cart />
        <OldOrders />
      </div>
    </>
  )
}

export default UserProfile