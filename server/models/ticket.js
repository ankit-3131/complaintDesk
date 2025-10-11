import { url } from "inspector";
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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0,0]
        }
    },
    pendingConfirmation: {
        pending: { type: Boolean, default: false },
        requestedAt: Date,
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,

    inProgressSince: Date,
    inProgressBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inProgressWarningSent: { type: Boolean, default: false },
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

ticketSchema.index({ location: '2dsphere' });

const ticketModel = mongoose.model('Ticket', ticketSchema)
export default ticketModel