"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_json_1 = require("../config/config.json");
const guildSchema = new mongoose_1.Schema({
    _id: String,
    prefix: {
        default: config_json_1.prefix,
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
exports.default = mongoose_1.model("guildSchema", guildSchema);
