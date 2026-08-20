import React from 'react';

export default function MapView({ lat, lng }) {
  // Placeholder for real map implementation like Leaflet or Google Maps
  return (
    <div className="bg-surface-muted border border-border rounded-lg p-4 flex flex-col items-center justify-center h-48">
      <span className="text-sm text-text-muted">Map View</span>
      <span className="text-xs text-text-muted mt-2">Coordinates: {lat}, {lng}</span>
    </div>
  );
}
