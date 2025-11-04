// src/hooks/useHotels.js
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

export const useHotels = (filters = {}) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await apiService.getHotels(filters);
        setHotels(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [JSON.stringify(filters)]);

  return { hotels, loading, error };
};

export const useFeaturedHotels = () => {
  return useHotels({ featured: true, limit: 4 });
};

export const useHotel = (id) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiService.getHotel(id);
        setHotel(response.data.hotel);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  return { hotel, loading, error };
};
