import React, { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";
import LiquidCard from "../components/LiquidCard";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
import { useUser } from "../contexts/UserContext";
import { useSearchParams } from 'react-router-dom';

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
    // respect current search params when refreshing
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

  return (
    <div className="w-[90vw] grid grid-cols-1 gap-4 p-6">
      <div className="h-64 rounded overflow-hidden border border-white/10">
        {/* Map showing tickets */}
        <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
