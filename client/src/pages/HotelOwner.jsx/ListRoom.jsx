import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import Title from "../../components/Title";

const ListRoom = () => {
  const { getToken } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch rooms from backend
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        "http://localhost:5000/api/rooms/owner/my-rooms",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRooms(result.data);
        } else {
          setError(result.message || "Failed to fetch rooms");
        }
      } else {
        setError("Failed to fetch rooms");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Error loading rooms data");
    } finally {
      setLoading(false);
    }
  };

  // Handle availability toggle
  const handleToggleAvailability = async (roomId, currentStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isAvailable: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setRooms((prevRooms) =>
            prevRooms.map((room) =>
              room._id === roomId
                ? { ...room, isAvailable: !currentStatus }
                : room
            )
          );
          setSuccess("Room availability updated successfully");
          setError("");
        }
      } else {
        setError("Failed to update room availability");
      }
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Error updating room status");
    }
  };

  // Handle delete room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete room ${roomNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove room from local state
          setRooms((prevRooms) =>
            prevRooms.filter((room) => room._id !== roomId)
          );
          setSuccess("Room deleted successfully");
          setError("");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete room");
      }
    } catch (err) {
      console.error("Error deleting room:", err);
      setError("Error deleting room");
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-16">
        <Title
          align="left"
          font="outfit"
          title="Room Listing"
          subTitle="View, edit, or manage all listed rooms."
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <Title
        align="left"
        font="outfit"
        title="Room Listing"
        subTitle="View, edit, or manage all listed rooms. Keep this information up-to-date to provide the best experience for users."
      />

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4">
        All Rooms ({rooms.length})
      </h2>

      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No rooms found</p>
          <p className="text-gray-400">
            You haven't added any rooms yet. Start by adding your first room.
          </p>
          <button
            onClick={() => (window.location.href = "/owner/add-room")}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Add Your First Room
          </button>
        </div>
      ) : (
        /* Responsive table container */
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4 text-left">Hotel</th>
                <th className="p-4 text-left">Room Type</th>
                <th className="p-4 text-left">Room Number</th>
                <th className="p-4 text-left hidden lg:table-cell">
                  Amenities
                </th>
                <th className="p-4 text-left">Price/Night</th>
                <th className="p-4 text-left">Available</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {room.hotel?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {room.hotel?.city || ""}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{room.roomType}</td>
                  <td className="p-4">{room.roomNumber}</td>
                  <td className="p-4 hidden lg:table-cell">
                    {room.amenities && room.amenities.length > 0 ? (
                      <div
                        className="max-w-xs truncate"
                        title={room.amenities.join(", ")}
                      >
                        {room.amenities.slice(0, 3).join(", ")}
                        {room.amenities.length > 3 && "..."}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">
                      ₦{room.pricePerNight?.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {room.availableRooms}/{room.totalRooms}
                  </td>
                  <td className="p-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={room.isAvailable}
                        onChange={() =>
                          handleToggleAvailability(room._id, room.isAvailable)
                        }
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-checked:bg-green-600 rounded-full relative transition-colors">
                        <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                      </div>
                    </label>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/owner/edit-room/${room._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRoom(room._id, room.roomNumber)
                        }
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListRoom;
