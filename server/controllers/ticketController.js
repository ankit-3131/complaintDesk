import Ticket from '../models/ticket.js'

export async function handleCreateTicket(req,res) {
    try {
    const { title, category, priority, citizenId, evidence } = req.body;

    if (!title || !category || !citizenId) {
      return res.status(400).json({ message: "Title, category, and citizenId are required" });
    }

    const newTicket = new Ticket({
      title,
      category,
      priority: priority || "Low",
      citizenId,
      evidence: evidence || [],
      timeLine: [
        {
          status: "Open",
          updatedBy: citizenId,
          notes: "Ticket created",
        },
      ],
    });

    await newTicket.save();

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// export async function handleModifyTicket() {
    
// }


export async function getAllTickets(req, res) {
  try {
    const { status, category, citizenId } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "Resolved" };
    }
    if (category) filter.category = category;
    if (citizenId) filter.citizenId = citizenId;

    const tickets = await Ticket.find(filter).populate("citizenId", "name email");
    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}



export async function addTicketNote(req, res) {
  try {
    const ticketId = req.params.id;
    const { status, updatedBy, notes } = req.body;

    if (!ticketId || !updatedBy)
      return res.status(400).json({ message: "Ticket ID and updatedBy are required" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.timeLine.push({
      status: status || ticket.status,
      updatedBy,
      notes: notes || ""
    });

    await ticket.save();

    res.status(200).json({ message: "Timeline updated", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}




export async function handleDeleteTicket(req,res) {
    try {
    const ticketId = req.params.id;

    if (!ticketId) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Ticket.findByIdAndDelete(ticketId);

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}