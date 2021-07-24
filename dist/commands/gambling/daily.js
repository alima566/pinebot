"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils/utils");
const gambling_1 = require("../../utils/gambling");
const dailyRewardsSchema_1 = __importDefault(require("../../models/dailyRewardsSchema"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(duration_1.default);
let claimedCache = [];
const clearCache = () => {
    claimedCache = [];
    setTimeout(clearCache, 1000 * 60 * 10); // Clear the cache every 10 mins
};
clearCache();
exports.default = {
    name: "daily",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    execute({ client, message }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guild, author, channel } = message;
            const guildInfo = yield utils_1.getGuildInfo(client, guild.id);
            const { dailyReward, gamblingChannel } = guildInfo.gambling;
            let alreadyClaimed = "❌ | You have already claimed your daily reward within the last day. Please try again in {REMAINING}";
            const claimed = `✅ | You have claimed your daily reward of \`${utils_1.formatNumber(dailyReward)}\` pina coladas!`;
            if (gamblingChannel) {
                if (channel.id !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `Daily can only be redeemed in <#${gamblingChannel}>!`
                    });
                    setTimeout(() => {
                        msg.delete();
                    }, 1000 * 3);
                    return message.delete();
                }
            }
            else {
                const msg = yield message.reply({
                    content: "A gambling channel needs to be set first in order for this command to be used."
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
            const inCache = claimedCache.find((cache) => cache.userID == author.id && cache.guildID == guild.id);
            const index = claimedCache.findIndex((cache) => cache.userID == author.id && cache.guildID == guild.id);
            if (inCache) {
                if (getHours(claimedCache[index].updatedAt) == 24) {
                    claimedCache.splice(index, 1); // Remove from cache if time expired before the cache can be cleared
                }
                else {
                    console.log("Returning from cache");
                    const remaining = getTimeRemaining(claimedCache[index].updatedAt);
                    alreadyClaimed = alreadyClaimed.replace(/{REMAINING}/g, remaining);
                    return message.reply({ content: alreadyClaimed });
                }
            }
            console.log("Fetching from Mongo");
            const obj = {
                guildID: guild.id,
                userID: author.id
            };
            const results = yield dailyRewardsSchema_1.default.findOne(obj);
            const updatedAt = results ? results.updatedAt : dayjs_1.default.utc();
            if (results) {
                const remaining = getTimeRemaining(updatedAt);
                if (getHours(updatedAt) < 24) {
                    claimedCache.push({
                        guildID: guild.id,
                        userID: author.id,
                        updatedAt
                    });
                    alreadyClaimed = alreadyClaimed.replace(/{REMAINING}/g, remaining);
                    return message.reply({ content: alreadyClaimed });
                }
            }
            yield dailyRewardsSchema_1.default.findOneAndUpdate(obj, obj, { upsert: true });
            claimedCache.push({
                guildID: guild.id,
                userID: author.id,
                updatedAt: dayjs_1.default.utc()
            });
            yield gambling_1.addPoints(guild.id, author.id, dailyReward);
            return message.reply({ content: claimed });
        });
    }
};
const getTimeRemaining = (updatedAt) => {
    const thenUTC = dayjs_1.default.utc(updatedAt);
    const nowUTC = dayjs_1.default.utc();
    const oneDay = thenUTC.add(1, "days");
    const timeRemaining = oneDay.diff(nowUTC);
    const duration = dayjs_1.default.duration(timeRemaining);
    const hoursDuration = duration.hours();
    const minsDuration = duration.minutes();
    const secsDuration = duration.seconds();
    const hoursText = hoursDuration !== 1 ? "hours" : "hour";
    const minsText = minsDuration !== 1 ? "minutes" : "minute";
    const secsText = secsDuration !== 1 ? "seconds" : "second";
    if (hoursDuration === 0 && minsDuration === 0) {
        return `**${secsDuration} ${secsText}**.`;
    }
    else if (hoursDuration === 0) {
        return `**${minsDuration} ${minsText} and ${secsDuration} ${secsText}**.`;
    }
    else {
        return `**${hoursDuration} ${hoursText}, ${minsDuration} ${minsText}, and ${secsDuration} ${secsText}**.`;
    }
};
const getHours = (updatedAt) => {
    const thenUTC = dayjs_1.default.utc(updatedAt);
    const nowUTC = dayjs_1.default.utc();
    return nowUTC.diff(thenUTC, "hours");
};
