import React, { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";
import LiquidCard from "../components/LiquidCard";

function TicketList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const data = await getAllTickets({});
      setTickets(data.tickets);
    };
    fetchTickets();
  }, []);

  return (
    <div className="w-[90vw] grid grid-cols-1 gap-4 p-6">
      {tickets.map((ticket) => (
        <LiquidCard
          key={ticket._id}
          title={ticket.title}
          description={ticket.category + " | " + ticket.priority}
          imageUrl={ticket.evidence?.[0]?.url}
          onClick={() => console.log("View ticket:", ticket._id)}
        />
      ))}
    </div>
  );
}

export default TicketList;
