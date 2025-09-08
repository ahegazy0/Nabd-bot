import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    type:{ 
        type:String,
        enum:['hadith','motivational','fasting_reminder','albid','public'],
        required:true
    },
    content:{
        type:String,
        required:true
    },
    hijriDay: {
        type: [Number],
        default: undefined,
    },
    weekday: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: undefined,
    },
    sent:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

const Message = mongoose.model('Message',messageSchema,'messages');

export default Message;