import React, { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";
import LiquidCard from "../components/LiquidCard";
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
      {tickets.map((ticket) => (
        <LiquidCard
          key={ticket._id}
          title={ticket.title}
          description={ticket.description}
          description2={ticket.category + " | " + ticket.priority}
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
