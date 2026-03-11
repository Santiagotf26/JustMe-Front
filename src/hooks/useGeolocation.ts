import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

// Default to Bogotá, Colombia
const DEFAULT_LAT = 4.711;
const DEFAULT_LNG = -74.0721;

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        loading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    const timeout = setTimeout(() => {
      // Fallback if geolocation takes too long
      setState(prev => {
        if (prev.loading) {
          return { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, loading: false, error: 'Timeout — using default location' };
        }
        return prev;
      });
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        clearTimeout(timeout);
        setState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          loading: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
    );

    return () => clearTimeout(timeout);
  }, []);

  return state;
}
