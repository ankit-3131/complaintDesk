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
import PublicIcon from '@mui/icons-material/Public';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TuneIcon from '@mui/icons-material/Tune';
import LayersIcon from '@mui/icons-material/Layers';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

function HeatmapLayer({ points = [], radius = 25, blur = 15 }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      if (!map) return;

      // remove previous layer if present
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { console.warn('remove previous heat layer failed', e); }
        layerRef.current = null;
      }

      if (!points || points.length === 0) {
        return;
      }

      // Ensure plugin is loaded
      if (!L.heatLayer) {
        try {
          await import('leaflet.heat');
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

function MapResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [searchParams] = useSearchParams();

  // Map expansion state
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Heatmap state
  const [heatEnabled, setHeatEnabled] = useState(true);
  const [radius, setRadius] = useState(25);
  const [blur, setBlur] = useState(15);

  const fetchTickets = async () => {
    setLoading(true);
    try {
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
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [searchParams]);

  const refresh = async () => {
    fetchTickets();
  };

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

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Interactive Earth / Heatmap Section */}
      {!isMapExpanded ? (
        /* Collapsed Earth Icon Banner */
        <div
          onClick={() => setIsMapExpanded(true)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-800/80 to-slate-900/95 border border-slate-700/60 p-4 sm:p-5 flex items-center justify-between cursor-pointer shadow-lg shadow-black/25 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
        >
          {/* Ambient background glow on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-5 z-10">
            {/* Medium Earth Icon with scaling on hover */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-115">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center overflow-hidden">
                  <PublicIcon className="text-cyan-400 !text-2xl sm:!text-3xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            {/* Banner Labels */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Geographic Incident Heatmap
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {heatPoints.length} Geotagged
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
                Click to expand the interactive live radar & density mapping for reported incidents.
              </p>
            </div>
          </div>

          {/* Enlarge CTA */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 group-hover:scale-105 transition-all duration-200 z-10 shadow-sm">
            <span>Open Map Radar</span>
            <OpenInFullIcon className="!text-xs" />
          </div>
        </div>
      ) : (
        /* Enlarged Interactive Heatmap View */
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col transition-all duration-300">
          
          {/* Expanded Map Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <PublicIcon className="!text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-tight">Live Incident Heatmap Radar</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {heatPoints.length} Points
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Interactive GIS cluster and density overview</span>
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Heatmap Toggle */}
              <button
                onClick={() => setHeatEnabled(!heatEnabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  heatEnabled
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <WhatshotIcon className={`!text-sm ${heatEnabled ? 'text-rose-400 animate-pulse' : ''}`} />
                <span>Heatmap {heatEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Adjust Parameters Dropdown Button */}
              <button
                onClick={() => setShowControls(!showControls)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  showControls
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                }`}
                title="Adjust Heatmap Radius and Blur"
              >
                <TuneIcon className="!text-xs" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* Monthly Report PDF Button */}
              <ReportButton defaultYear={new Date().getFullYear()} defaultMonth={new Date().getMonth() + 1} />

              {/* Collapse Map Button */}
              <button
                onClick={() => setIsMapExpanded(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <CloseFullscreenIcon className="!text-xs text-slate-400" />
                <span>Minimize</span>
              </button>
            </div>
          </div>

          {/* Settings Drawer if toggled */}
          {showControls && (
            <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Radius:</span>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="font-mono text-cyan-400">{radius}px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Blur:</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="font-mono text-cyan-400">{blur}px</span>
              </div>
            </div>
          )}

          {/* Leaflet Map Body */}
          <div className="h-80 sm:h-96 md:h-[430px] w-full relative dark-leaflet-map">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <MapResizeWatcher />
              {/* Dark Styled OpenStreetMap Tiles (Reliable, No Watermark, No API Key needed) */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Heatmap Layer */}
              {heatEnabled && <HeatmapLayer points={heatPoints} radius={radius} blur={blur} />}

              {/* Fallback Circles */}
              {heatEnabled && heatPoints.length > 0 && (
                <>
                  {heatPoints.map((p, idx) => {
                    const [lat, lng, intensity] = p;
                    const r = 40 + intensity * 60;
                    const fill = `rgba(244, 63, 94, ${0.15 + intensity * 0.35})`;
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

              {/* Individual Incident Markers with Popup */}
              {tickets.map((t) => t.location && t.location.coordinates && (
                <Marker key={t._id} position={[t.location.coordinates[1], t.location.coordinates[0]]}>
                  <Popup>
                    <div className="p-1 min-w-[160px] text-slate-900">
                      <div className="font-bold text-sm leading-snug">{t.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <span>{t.category}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          t.priority === 'High' ? 'text-rose-600' : 'text-amber-600'
                        }`}>{t.priority}</span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200">
                        <Link to={`/ticket/${t._id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline">
                          Open Incident Report →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Tickets Feed Section */}
      <div className="flex flex-col gap-4">
        {loading ? (
          /* Loading Skeletons */
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 w-full rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse p-6 flex flex-col justify-between">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-slate-800 rounded-lg"></div>
                  <div className="h-6 w-24 bg-slate-800 rounded-lg"></div>
                </div>
                <div className="h-6 w-1/2 bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-3/4 bg-slate-800/60 rounded"></div>
                <div className="h-9 w-28 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <LiquidCard
              key={ticket._id}
              title={ticket.title}
              description={ticket.description}
              description2={ticket.category + " •  " + ticket.priority + " • " + ticket.status}
              imageUrl={ticket.evidence?.[0]?.url}
              onClick={() => {}}
              role={user?.role}
              ticket={{ ...ticket, onRefresh: refresh }}
            />
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <InboxOutlinedIcon className="!text-3xl text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Tickets Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
              There are currently no tickets matching your selected filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketList;
