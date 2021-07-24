import { model, Schema } from "mongoose";
import { prefix } from "../config/config.json";

const guildSchema = new Schema({
    _id: String,
    prefix: {
        default: prefix,
        type: String
    },
    announcementsChannel: {
        type: String
    },
    botLoggingChannel: {
        type: String
    },
    botChatChannel: {
        type: String
    },
    gambling: {
        gamblingChannel: String,
        gamblingLeaderboardChannel: String,
        monthlyPrize: String,
        dailyReward: Number,
        raffleChannel: String,
        rafflePoints: Number,
        nitroLink: String,
        jackpotAmount: {
            default: 10000,
            type: Number
        }
    },
    genshinUID: {
        type: String
    },
    friendCode: {
        type: String
    },
    dreamAddress: {
        type: String
    },
    welcome: {
        channelID: String,
        text: String
    },
    disabledCommands: Array,
    disabledChannels: Array,
    commandPerms: {},
    commandCooldowns: {},
    commandAlias: {}
});

export default model("guildSchema", guildSchema);
