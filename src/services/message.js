import Message from "../models/Message.js";
import BroadLog from "../models/BroadLog.js";
import { pickRandom } from "../utils/helpers.js";
import { getHijriDate } from "./hijriService.js";

const DEDUPLICATION_DAYS = 60; 

const getRandomMessageForUser = async (type, userId = null) => {
    let messages = await getMessagesByType(type);

    let unsentMessages = messages.filter(m => !m.sent);

    if (!unsentMessages.length) {
        await Message.updateMany({ type }, { sent: false });

        messages = await getMessagesByType(type);

        unsentMessages = messages.filter(m => !m.sent);
    }

    const todayMessages = await filterMessagesForToday(unsentMessages);

    if (!todayMessages.length) return null;

    const chosen = pickRandom(todayMessages);

    if (chosen) {

        await Message.findByIdAndUpdate(chosen._id, { sent: true });
    }

    return chosen;
};

const getMessagesByType = async (type) => {
    try {
        return await Message.find({ type });
    } catch (error) {
        console.error("Error fetching messages by type:", error.message);
        return [];
    }
};

const filterMessagesForToday = async (messages) => {
    if (!messages.length) return [];

    const hijri = await getHijriDate();
    
    if (!hijri) return messages;

    return messages.filter((msg) => {

        if (msg.hijriDay) return msg.hijriDay === hijri.hijriDay;

        if (msg.weekday) return msg.weekday === hijri.gregorianDayName;

        return true;
    });
};

export { getMessagesByType, getRandomMessageForUser };