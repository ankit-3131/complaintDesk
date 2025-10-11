import axios from 'axios';
import Ticket from '../models/ticket.js'

const fastAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:5000'; 

export async function handleCreateTicket(req,res) {
    try {
  const { title, description, category, priority, citizenId, evidence, location } = req.body;

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
      location: location || undefined,
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
    const { search, status, category, citizenId, sortBy, order } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'Resolved' };
    }
    if (category) filter.category = category;
    if (citizenId) filter.citizenId = citizenId;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    let sort = { createdAt: -1 };
    const sortOrder = order === 'asc' ? 1 : -1;
    if (sortBy === 'createdAt') sort = { createdAt: sortOrder };
    else if (sortBy === 'title') sort = { title: sortOrder };
    else if (sortBy === 'priority') {
      const agg = [
  { $match: filter },
  {
    $addFields: {
      priorityRank: {
        $switch: {
          branches: [
            { case: { $eq: ['$priority', 'High'] }, then: 3 },
            { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
            { case: { $eq: ['$priority', 'Low'] }, then: 1 }
          ],
          default: 0
        }
      }
    }
  },
  { $sort: { priorityRank: sortOrder, createdAt: -1 } },
  {
    $lookup: {
      from: 'users',
      localField: 'citizenId',
      foreignField: '_id',
      as: 'citizen'
    }
  },
  { $unwind: { path: '$citizen', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1,
      title: 1,
      description: 1,
      priority: 1,
      status: 1,
      category: 1,
          location: 1,
      createdAt: 1,
      citizenId: {
        _id: '$citizen._id',
        name: '$citizen.name',
        email: '$citizen.email'
      }
    }
  }
];

      const tickets = await Ticket.aggregate(agg);
      return res.status(200).json({ tickets });
    }

    const tickets = await Ticket.find(filter).sort(sort).populate('citizenId', 'name email');
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

    const updatedBy = req.userData?.id;
    if (!updatedBy) return res.status(401).json({ message: "Unauthorized" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.timeLine.push({
      status: status || ticket.status,
      updatedBy,
      notes: notes || ""
    });

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

    if (updates.status !== undefined) {
      if (updates.status === 'In Progress') {
        ticket.inProgressSince = new Date();
        ticket.inProgressBy = req.userData?.id;
        ticket.inProgressWarningSent = false;
        ticket.timeLine.push({ status: 'In Progress', updatedBy: req.userData?.id, notes: 'Marked In Progress by staff' });
      } else {
        ticket.inProgressSince = undefined;
        ticket.inProgressBy = undefined;
        ticket.inProgressWarningSent = false;
      }
    }

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

    ticket.pendingConfirmation = {
      pending: true,
      requestedAt: new Date(),
      requestedBy: req.userData.id
    };
    ticket.timeLine.push({ status: ticket.status, updatedBy: req.userData.id, notes: 'Staff requested resolution confirmation' });
    await ticket.save();

    try {
      const { emitToUser } = await import('../services/socketService.js');
      const creatorId = ticket.citizenId?.toString();
      emitToUser(creatorId, 'resolutionRequested', { ticketId: ticket._id, title: ticket.title });
    } catch (e) {
      console.error('socket notify error', e.message || e);
    }

    res.status(200).json({ message: 'Resolution confirmation requested', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function confirmResolution(req, res) {
  try {
    const ticketId = req.params.id;
    const { confirm, note } = req.body;
    if (!ticketId) return res.status(400).json({ message: 'Ticket ID is required' });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const userId = req.userData?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (ticket.citizenId && ticket.citizenId.toString() !== userId && req.userData?.role !== 'Staff') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!ticket.pendingConfirmation || !ticket.pendingConfirmation.pending) {
      return res.status(400).json({ message: 'No pending confirmation' });
    }

    if (confirm) {
      ticket.status = 'Resolved';
      ticket.resolvedBy = ticket.pendingConfirmation.requestedBy;
      ticket.resolvedAt = new Date();
      ticket.pendingConfirmation = { pending: false };
      ticket.timeLine.push({ status: 'Resolved', updatedBy: userId, notes: note || 'Creator confirmed resolution' });
      await ticket.save();
      return res.status(200).json({ message: 'Ticket resolved', ticket });
    } else {
      ticket.status = 'Open';
      ticket.pendingConfirmation = { pending: false };
      ticket.timeLine.push({ status: 'Open', updatedBy: userId, notes: note || 'Creator denied resolution' });
      await ticket.save();
      return res.status(200).json({ message: 'Ticket reopened', ticket });
    }
  } catch (err) {
    console.error(err);
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
    const categories = await Ticket.distinct('category');
    console.log(title);


    if (!title) {
      return res.status(400).json({ error: "Title query parameter is required" });
    }

    const response = await axios.post(`${fastAPI_URL}/get_category/`, { title, categories });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from Python API:", error.message);
    res.status(500).json({ error: "Failed to connect to Python API" });
  }
}

export async function getTicketById(req, res) {
  try {
    const ticketId = req.params.id;
    if (!ticketId) return res.status(400).json({ message: 'Ticket ID is required' });

    const ticket = await Ticket.findById(ticketId)
      .populate('citizenId', 'name email')
      .populate({ path: 'timeLine.updatedBy', select: 'name email' });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    
    const viewer = req.userData;
    // if (viewer) {
    //   if (viewer.role !== 'Staff' && ticket.citizenId && ticket.citizenId._id.toString() !== viewer.id) {
    //     return res.status(403).json({ message: 'Forbidden' });
    //   }
    // }

    res.status(200).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllCategories(req,res){
  try {
    const categories = await Ticket.distinct('category');
    res.status(200).json({ categories });
  } catch (error) {
    console.log(error);    
  }
}