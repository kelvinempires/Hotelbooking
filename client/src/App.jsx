import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { AllRooms } from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelReg from "./components/HotelReg";
import LayOut from "./pages/HotelOwner.jsx/LayOut";
import Dashboard from "./pages/HotelOwner.jsx/Dashboard";
import AddRoom from "./pages/HotelOwner.jsx/AddRoom";
import ListRoom from "./pages/HotelOwner.jsx/ListRoom";

const App = () => {
  const location = useLocation();
  const isOwnerPage = location.pathname.startsWith("/owner");
  const showHotelReg = location.pathname === "/";
  return (
    <div>
      {!isOwnerPage && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/owner" element={<LayOut />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
