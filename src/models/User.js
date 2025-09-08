import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
    }, {
    timestamps: true
});

userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema, 'users')

export default User;