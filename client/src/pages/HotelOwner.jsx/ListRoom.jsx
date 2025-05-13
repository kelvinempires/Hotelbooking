import React, { useState } from "react";
import { roomCommonData } from "../../assets/assets";
import Title from "../../components/Title";

const ListRoom = () => {
  const [rooms] = useState(roomCommonData);

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <Title
        align="left"
        font="outfit"
        title="Room Listing"
        subTitle="View, edit, or manage all listed rooms. Keep this information up-to-date to provide the best experience for users."
      />

      <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4">
        All Rooms
      </h2>

      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Room Type</th>
              <th className="p-3 text-left hidden sm:table-cell">Facilities</th>
              <th className="p-3 text-left">Price/Night</th>
              <th className="p-3 text-center">Availability</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.roomType}</td>
                <td className="p-3 hidden sm:table-cell">
                  {Array.isArray(item.amenities)
                    ? item.amenities.join(", ")
                    : "—"}
                </td>
                <td className="p-3">₦{item.pricePerNight}</td>
                <td className="p-3 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      readOnly
                    />
                    <div className="w-10 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full relative transition-colors">
                      <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                    </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
