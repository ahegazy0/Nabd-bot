import cron from "node-cron";
import mongoose from "mongoose";
import User from "../models/User.js";
import BroadLog from "../models/BroadLog.js";
import { getHijriDate, isAyyamAlBid } from "./hijriService.js";
import {getRandomMessageForUser} from "./message.js";
import {broadcastMessage} from "./broadcast.js";
import logger from "../utils/logger.js";

const scheduleDailyBroadcast = () => {

    // Fasting reminders (Sunday + Wednesday at 8 PM)
    cron.schedule("45 20 * * 0,3", async () => {
        try {
            const users = await User.find({ isActive: true });

            const message = await getRandomMessageForUser("fasting_reminder");

            if (!message) return logger.warn("No fasting reminder messages found");

            await broadcastMessage(users, message, "fasting_reminder");

        } catch (err) {

            logger.error("Error in weekly fasting reminder broadcast", err);
        }
    },{timezone:'Africa/Cairo'});

    //Azkar reminder
    cron.schedule("0 6,18 * * *", async () => {
        try {
            const users = await User.find({ isActive: true });

           const message = {content : " `لا تنسَ وردك اليومي من الأذكار.\nاجعل لسانك رطبًا بذكر الله.\nألا بذكر الله تطمئن القلوب..\n\n#وذكر`"};

            await broadcastMessage(users, message, "public");

        } catch (err) {

            logger.error("Error in public broadcast", err);
        }
    },{timezone:'Africa/Cairo'});

    // Ayyam Al-Bid (12th, 13th, 14th hijri)
    cron.schedule("0 21 * * *", async () => {
        try {
            const users = await User.find({ isActive: true });

            const hijri = await getHijriDate();

            if (!hijri) return;

            if (isAyyamAlBid()) {
                const message = await getRandomMessageForUser("albid");

                if (!message) return logger.warn("No ayyam al-bid reminder messages found");

                await broadcastMessage(users, message, "albid");
            }
        } catch (err) {

            logger.error("Error in ayyam al-bid broadcast", err);
        }
    },{timezone:'Africa/Cairo'});

    // Motivational every day at 8 AM
    cron.schedule("30 11 * * *", async () => {
        try {
            const users = await User.find({ isActive: true });

            const message = await getRandomMessageForUser("motivational");

            if (!message) return logger.warn("No motivational messages found");

            await broadcastMessage(users, message, "motivational");

        } catch (err) {
            
            logger.error("Error in motivational broadcast", err);
        }
    },{timezone:'Africa/Cairo'});

    // Delete Logs 
    cron.schedule('0 0 * * 0', async () => {
        try {
            const sevenDaysAgo = new Date();

            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const result = await BroadLog.deleteMany({ sentAt: { $lt: sevenDaysAgo } });

            console.log(`✅ Deleted ${result.deletedCount} broadcast logs older than 7 days.`);
        } catch (err) {
            console.error('❌ Error deleting old broadcast logs:', err);
        }
    });
};

export default scheduleDailyBroadcast;
