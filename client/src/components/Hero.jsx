// src/components/Hero.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets, { cities } from "../assets/assets";

const Hero = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !searchParams.destination ||
      !searchParams.checkIn ||
      !searchParams.checkOut
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Navigate to rooms page with search parameters
    const queryParams = new URLSearchParams({
      city: searchParams.destination,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
    }).toString();

    navigate(`/rooms?${queryParams}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
      <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20">
        Nigeria's Best Hotels & Experiences
      </p>
      <h1 className="font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
        Discover Your Awaited Dream Getaway
      </h1>
      <p className="max-w-130 mt-2 text-sm md:text-base">
        Discover the finest hotels in Nigeria. from luxury to adventure, we've
        got you covered.
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white text-gray-500 rounded-lg px-6 py-4 mt-7 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
      >
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.locationIcon} alt="location" className="h-4" />
            <label htmlFor="destination">Destination</label>
          </div>
          <input
            list="destinations"
            id="destination"
            type="text"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full"
            placeholder="Type here"
            value={searchParams.destination}
            onChange={handleInputChange}
            required
          />
          <datalist id="destinations">
            {cities.map((city, index) => (
              <option value={city} key={index} />
            ))}
          </datalist>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="calender" className="h-4" />
            <label htmlFor="checkIn">Check in</label>
          </div>
          <input
            id="checkIn"
            type="date"
            min={today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            value={searchParams.checkIn}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="calender" className="h-4" />
            <label htmlFor="checkOut">Check out</label>
          </div>
          <input
            id="checkOut"
            type="date"
            min={searchParams.checkIn || today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            value={searchParams.checkOut}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
          <label htmlFor="guests">Guests</label>
          <input
            min={1}
            max={10}
            id="guests"
            type="number"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16"
            placeholder="1"
            value={searchParams.guests}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1 hover:bg-gray-800 transition-colors"
        >
          <img src={assets.searchIcon} alt="search" className="h-7" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;
