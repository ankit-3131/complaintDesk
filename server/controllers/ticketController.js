import axios from 'axios';
import Ticket from '../models/ticket.js'

export async function handleCreateTicket(req,res) {
    try {
    const { title, description, category, priority, citizenId, evidence } = req.body;

    if (!title || !category || !citizenId) {
      return res.status(400).json({ message: "Title, category, and citizenId are required" });
    }

    const newTicket = new Ticket({
      title,
      description,
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
    const { status, notes } = req.body;

    if (!ticketId)
      return res.status(400).json({ message: "Ticket ID is required" });

    // require authentication
    const updatedBy = req.userData?.id;
    if (!updatedBy) return res.status(401).json({ message: "Unauthorized" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.timeLine.push({
      status: status || ticket.status,
      updatedBy,
      notes: notes || ""
    });

    // if status provided, update ticket.status
    if (status) ticket.status = status;

    await ticket.save();

    res.status(200).json({ message: "Timeline updated", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function updateTicket(req, res) {
  try {
    const ticketId = req.params.id;
    const updates = req.body;

    if (!ticketId) return res.status(400).json({ message: "Ticket ID is required" });

    if (req.userData?.role !== 'Staff') return res.status(403).json({ message: 'Forbidden' });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const allowed = ['title', 'description', 'category', 'priority', 'status'];
    allowed.forEach((k) => {
      if (updates[k] !== undefined) ticket[k] = updates[k];
    });

    await ticket.save();
    res.status(200).json({ message: 'Ticket updated', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function markTicketResolved(req, res) {
  try {
    const ticketId = req.params.id;
    if (!ticketId) return res.status(400).json({ message: 'Ticket ID is required' });

    // only staff
    if (req.userData?.role !== 'Staff') return res.status(403).json({ message: 'Forbidden' });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = 'Resolved';
    ticket.timeLine.push({ status: 'Resolved', updatedBy: req.userData.id, notes: 'Marked resolved by staff' });
    await ticket.save();

    res.status(200).json({ message: 'Ticket marked resolved', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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

export async function handleGetCategory(req, res) {
  try {
    
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title query parameter is required" });
    }

    // Send title inside a JSON object
    const response = await axios.post("http://127.0.0.1:5000/get_category/", { title });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from Python API:", error.message);
    res.status(500).json({ error: "Failed to connect to Python API" });
  }
}