import { useEffect, useState, useCallback } from 'react';

const RECENT_VEHICLES_KEY = 'recent-vehicles';
const MAX_RECENT = 5;

interface RecentVehicle {
  fleetNumber: string;
  primeRego?: string;
  lastUsed: number;
}

export function useRecentVehicles() {
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([]);

  const loadRecent = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(RECENT_VEHICLES_KEY);
      if (stored) {
        const vehicles = JSON.parse(stored) as RecentVehicle[];
        // Sort by most recently used
        vehicles.sort((a, b) => b.lastUsed - a.lastUsed);
        setRecentVehicles(vehicles.slice(0, MAX_RECENT));
      }
    } catch (error) {
      console.error('Failed to load recent vehicles:', error);
    }
  }, []);

  const addRecent = useCallback((fleetNumber: string, primeRego?: string) => {
    if (typeof window === 'undefined' || !fleetNumber) return;

    try {
      const stored = localStorage.getItem(RECENT_VEHICLES_KEY);
      let vehicles: RecentVehicle[] = stored ? JSON.parse(stored) : [];

      // Remove existing entry for this fleet number
      vehicles = vehicles.filter(v => v.fleetNumber !== fleetNumber);

      // Add new entry
      vehicles.unshift({
        fleetNumber,
        primeRego,
        lastUsed: Date.now(),
      });

      // Keep only MAX_RECENT vehicles
      vehicles = vehicles.slice(0, MAX_RECENT);

      localStorage.setItem(RECENT_VEHICLES_KEY, JSON.stringify(vehicles));
      setRecentVehicles(vehicles);
    } catch (error) {
      console.error('Failed to save recent vehicle:', error);
    }
  }, []);

  const clearRecent = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(RECENT_VEHICLES_KEY);
      setRecentVehicles([]);
    } catch (error) {
      console.error('Failed to clear recent vehicles:', error);
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  return {
    recentVehicles,
    addRecent,
    clearRecent,
  };
}
