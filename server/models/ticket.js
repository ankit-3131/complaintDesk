import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    evidence: [
        {
            url: String
        }
    ],
    timeLine: [
        {
            status: { 
                type: String, 
                enum: ['Open', 'In Progress', 'Resolved']
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            notes: String,
            timeStamp: {type: Date, default: Date.now}
        }
    ]
}, { timestamps: true });

const ticketModel = mongoose.model('Ticket', ticketSchema)
export default ticketModel