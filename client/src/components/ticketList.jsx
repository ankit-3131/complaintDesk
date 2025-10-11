import React, { useEffect, useState, useRef } from "react";
import { getAllTickets } from "../api/ticketApi";
import LiquidCard from "../components/LiquidCard";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
import 'leaflet.heat';
import { useUser } from "../contexts/UserContext";
import { useSearchParams } from 'react-router-dom';
import ReportButton from './ReportButton';
function HeatmapLayer({ points = [], radius = 25, blur = 15 }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      if (!map) return;
      console.debug('HeatmapLayer setup', { pointsCount: points?.length, radius, blur, hasHeat: !!L.heatLayer });

      // remove previous layer if present
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { console.warn('remove previous heat layer failed', e); }
        layerRef.current = null;
      }

      if (!points || points.length === 0) {
        console.debug('HeatmapLayer: no points, skipping');
        return;
      }

      // Ensure plugin is loaded
      if (!L.heatLayer) {
        try {
          await import('leaflet.heat');
          console.debug('HeatmapLayer: loaded leaflet.heat dynamically', { hasHeat: !!L.heatLayer });
        } catch (err) {
          console.error('HeatmapLayer: failed to dynamically import leaflet.heat', err);
          return;
        }
      }

      if (cancelled) return;
      try {
        // @ts-ignore
        const heat = L.heatLayer(points, { radius, blur, maxZoom: 18 });
        heat.addTo(map);
        layerRef.current = heat;
        console.debug('HeatmapLayer: heat layer added');
      } catch (err) {
        console.error('HeatmapLayer: error creating heat layer', err);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { console.warn('cleanup remove layer failed', e); }
        layerRef.current = null;
      }
    };
  }, [map, JSON.stringify(points), radius, blur]);

  return null;
}

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const { user } = useUser();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchTickets = async () => {
      const params = {};
      const search = searchParams.get('q') || searchParams.get('search');
      if (search) params.search = search;
      const status = searchParams.get('status');
      if (status) params.status = status;
      const category = searchParams.get('category');
      if (category) params.category = category;
      const sortByRaw = searchParams.get('sortBy');
      if (sortByRaw) {
        if (sortByRaw === 'createdAt_asc') { params.sortBy = 'createdAt'; params.order = 'asc'; }
        else params.sortBy = sortByRaw;
      }
      const data = await getAllTickets(params);
      setTickets(data?.tickets ?? []);
    };
    fetchTickets();
  }, [searchParams]);

  const refresh = async () => {
    const params = {};
    const search = searchParams.get('q') || searchParams.get('search');
    if (search) params.search = search;
    const status = searchParams.get('status');
    if (status) params.status = status;
    const category = searchParams.get('category');
    if (category) params.category = category;
    const sortByRaw = searchParams.get('sortBy');
    if (sortByRaw) {
      if (sortByRaw === 'createdAt_asc') { params.sortBy = 'createdAt'; params.order = 'asc'; }
      else params.sortBy = sortByRaw;
    }
    const data = await getAllTickets(params);
    setTickets(data?.tickets ?? []);
  };

  // heatmap state
  const [heatEnabled, setHeatEnabled] = useState(false);
  const [radius, setRadius] = useState(25);
  const [blur, setBlur] = useState(15);

  const heatPoints = tickets
    .filter(t => t.location && t.location.coordinates && t.location.coordinates.length === 2)
    .map(t => {
      const lng = t.location.coordinates[0];
      const lat = t.location.coordinates[1];
      let intensity = 0.4;
      if (t.priority === 'High') intensity = 1;
      else if (t.priority === 'Medium') intensity = 0.7;
      else intensity = 0.4;
      return [lat, lng, intensity];
    });

  useEffect(() => {
    if (heatEnabled) console.debug('Heat enabled, heatPoints count:', heatPoints.length, heatPoints.slice(0,5));
  }, [heatEnabled, JSON.stringify(heatPoints)]);

  return (
    <div className="w-[90vw] grid grid-cols-1 gap-4 p-6">
      <div className="h-64 rounded overflow-hidden border border-white/10 relative">
        <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* map-native overlay: semi-transparent, above tiles */}
          <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 10000, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6, color: '#000', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={heatEnabled} onChange={(e)=>setHeatEnabled(e.target.checked)} /> Heatmap
              </label>
              <ReportButton defaultYear={new Date().getFullYear()} defaultMonth={new Date().getMonth()+1} />
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Radius: <input type="range" min="5" max="50" value={radius} onChange={(e)=>setRadius(Number(e.target.value))} /></div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Blur: <input type="range" min="1" max="30" value={blur} onChange={(e)=>setBlur(Number(e.target.value))} /></div>
          </div>
          {/* controls moved outside MapContainer for visibility */}
          {heatEnabled && <HeatmapLayer points={heatPoints} radius={radius} blur={blur} />}
          {heatEnabled && heatPoints.length > 0 && (
            <>
              {heatPoints.map((p, idx) => {
                const [lat, lng, intensity] = p;
                const r = 40 + intensity * 60; 
                const fill = `rgba(255,0,0,${0.12 + intensity * 0.3})`;
                return (
                  <Circle
                    key={`heat-fallback-${idx}`}
                    center={[lat, lng]}
                    radius={r}
                    pathOptions={{ color: null, fillColor: fill, fillOpacity: 0.6, stroke: false }}
                  />
                );
              })}
            </>
          )}
          {tickets.map(t => t.location && t.location.coordinates && (
            <Marker key={t._id} position={[t.location.coordinates[1], t.location.coordinates[0]]}>
              <Popup>
                <div className="text-black">
                  <div className="font-bold">{t.title}</div>
                  <div className="text-sm">{t.category} • {t.priority}</div>
                  <Link to={`/ticket/${t._id}`} className="text-blue-600 underline">View</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* overlay moved inside the map container for map-native positioning */}

      {tickets.map((ticket) => (
        <LiquidCard
          key={ticket._id}
          title={ticket.title}
          description={ticket.description}
          description2={ticket.category + " •  " + ticket.priority + " • " + ticket.status}
          imageUrl={ticket.evidence?.[0]?.url}
          onClick={() => console.log("View ticket:", ticket._id)}
          role={user?.role}
          ticket={{...ticket, onRefresh: refresh}}
        />
      ))}
    </div>
  );
}

export default TicketList;
