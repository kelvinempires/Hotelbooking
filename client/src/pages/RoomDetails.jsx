import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import assets, {
  facilityIcons,
  roomCommonData,
  roomsDummyData,
} from "../assets/assets";
import StarRating from "../components/StarRating";

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const room = roomsDummyData.find((room) => room._id === id);
    room && setRoom(room);
    room && setMainImage(room.images[0]);
  }, []);

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* room details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
          <p className="text-sm font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            20% OFF
          </p>
        </div>
        {/* room rating */}
        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="min-2xl:">200+ reviews</p>
        </div>
        {/* room address */}
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="locationIcon" />
          <span>{room.hotel.address}</span>
        </div>
        {/* room images */}
        <div className="flex flex-col lg:flex-row  mt-6 gap-6 ">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              alt="room image"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images.length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room image"
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                    mainImage === image && "outline-3 outline-orange-500"
                  }`}
                />
              ))}
          </div>
        </div>
        {/* room highlight */}
        <div className=" flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair ">
              Indulge in luxury like never before.
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4 ">
              {room.amenities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                >
                  <img
                    src={facilityIcons[item]}
                    alt={item}
                    className="w-5 h-5"
                  />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
          {/* room price */}
          <p className="text-2xl font-medium">₦ {room.pricePerNight}/night</p>
        </div>
        {/* check-in checkout form */}
        <form className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl">
          <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
            <div className="flex flex-col">
              <label htmlFor="checkInDate" className="font-medium">
                Check in
              </label>
              <input
                type="date"
                id="checkInDate"
                placeholder="check-In"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
            <div className="flex flex-col">
              <label htmlFor="checkOutDate" className="font-medium">
                Check Out
              </label>
              <input
                type="date"
                id="checkOutDate"
                placeholder="check-Out"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
            <div className="flex flex-col">
              <label htmlFor="guest" className="font-medium">
                Guest
              </label>
              <input
                type="number"
                id="guest"
                placeholder="0"
                className="max-w-20 rounded border border-gray-300 px-3 mt-1.5 outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer hover:shadow-lg shadow-primary/50 active:shadow-none mt-8 md:mt-0 "
          >
            Check Availability
          </button>
        </form>
        {/* common Specifications */}
        <div className="mt-25 space-y-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-start gap-2">
              <img
                src={spec.icon}
                alt={`${spec.title}-icon`}
                className="w-6.5"
              />
              <div>
                <p className="text-base">{spec.title}</p>
                <p className=" text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="max-w-3xl border-y border-gray-300 py-10 my-15 text-gray-500">
            Guests will be allocated on the ground floor according to
            availability. You will receive a comfortable two-bedroom apartment
            that offers a true city experience. The quoted price is for two
            guests. When selecting the number of guests, please ensure you mark
            the correct number to receive the exact price for a group booking.
            Guests will be allocated to the ground floor based on availability,
            ensuring a cozy and authentic city stay.
          </p>
        </div>
        {/* posted by */}
        <div className=" flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <img
              src={room.hotel.owner.image}
              alt="host"
              className="h-14 w-14 md:h-18 md:w-18 rounded-full"
            />
            <div>
              <p className="text-lg md:text-xl">Hosted By {room.hotel.name}</p>
              <div className="flex items-center mt-1">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary transition-all cursor-pointer hover:shadow-lg active:shadow-none hover:scale-95">COntact Now</button>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
