import React, { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";
import LiquidCard from "../components/LiquidCard";
import { useUser } from "../contexts/UserContext";

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchTickets = async () => {
      const data = await getAllTickets({});
      setTickets(data.tickets);
    };
    fetchTickets();
  }, []);

  const refresh = async () => {
    const data = await getAllTickets({});
    setTickets(data.tickets);
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
