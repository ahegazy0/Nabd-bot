import mongoose from "mongoose";

const broadSchema = mongoose.Schema({
    broadcastId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    messageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: false
    },
    content: {
        type: String,
        required: false 
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    telegramId: {
        type: Number,
        required: false
    },
    telegramMessageId: {
        type: Number,
        required: false
    },
    sentBy: {
        type: Number, 
        required: false
    },
    userCount: {
        type: Number,
        required: false
    }
},{
    timestamps: true
});

const BroadLog = mongoose.model('BroadLog',broadSchema,'broadLogs');

export default BroadLog;

