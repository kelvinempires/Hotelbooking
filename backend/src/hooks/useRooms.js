// src/hooks/useRooms.js
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

export const useRooms = (filters = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await apiService.getRooms(filters);
        setRooms(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [JSON.stringify(filters)]);

  return { rooms, loading, error };
};

export const useRoomsByHotel = (hotelId, filters = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!hotelId) return;

      try {
        setLoading(true);
        const response = await apiService.getRoomsByHotel(hotelId, filters);
        setRooms(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId, JSON.stringify(filters)]);

  return { rooms, loading, error };
};

export const useRoom = (id) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiService.getRoom(id);
        setRoom(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  return { room, loading, error };
};
