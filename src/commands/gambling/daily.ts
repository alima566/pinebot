import { Command } from "../../interfaces/Command";
import { getGuildInfo, formatNumber } from "../../utils/utils";
import { addPoints } from "../../utils/gambling";
import dailyRewardsSchema from "../../models/dailyRewardsSchema";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(duration);

let claimedCache: any[] = [];

const clearCache = () => {
    claimedCache = [];
    setTimeout(clearCache, 1000 * 60 * 10); // Clear the cache every 10 mins
};
clearCache();

export default {
    name: "daily",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    async execute({ client, message }) {
        const { guild, author, channel } = message;
        const guildInfo = await getGuildInfo(client, guild!.id);
        const { dailyReward, gamblingChannel } = guildInfo.gambling;
        let alreadyClaimed =
            "❌ | You have already claimed your daily reward within the last day. Please try again in {REMAINING}";
        const claimed = `✅ | You have claimed your daily reward of \`${formatNumber(
            dailyReward
        )}\` pina coladas!`;

        if (gamblingChannel) {
            if (channel.id !== gamblingChannel) {
                const msg = await message.reply({
                    content: `Daily can only be redeemed in <#${gamblingChannel}>!`
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
        } else {
            const msg = await message.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used."
            });
            setTimeout(() => {
                msg.delete();
            }, 1000 * 3);
            return message.delete();
        }

        const inCache = claimedCache.find(
            (cache) => cache.userID == author.id && cache.guildID == guild!.id
        );
        const index = claimedCache.findIndex(
            (cache) => cache.userID == author.id && cache.guildID == guild!.id
        );
        if (inCache) {
            if (getHours(claimedCache[index].updatedAt) == 24) {
                claimedCache.splice(index, 1); // Remove from cache if time expired before the cache can be cleared
            } else {
                console.log("Returning from cache");
                const remaining = getTimeRemaining(claimedCache[index].updatedAt);
                alreadyClaimed = alreadyClaimed.replace(/{REMAINING}/g, remaining);
                return message.reply({ content: alreadyClaimed });
            }
        }

        console.log("Fetching from Mongo");
        const obj = {
            guildID: guild!.id,
            userID: author.id
        };

        const results = await dailyRewardsSchema.findOne(obj);
        const updatedAt = results ? results.updatedAt : dayjs.utc();
        if (results) {
            const remaining = getTimeRemaining(updatedAt);
            if (getHours(updatedAt) < 24) {
                claimedCache.push({
                    guildID: guild!.id,
                    userID: author.id,
                    updatedAt
                });
                alreadyClaimed = alreadyClaimed.replace(/{REMAINING}/g, remaining);
                return message.reply({ content: alreadyClaimed });
            }
        }

        await dailyRewardsSchema.findOneAndUpdate(obj, obj, { upsert: true });
        claimedCache.push({
            guildID: guild!.id,
            userID: author.id,
            updatedAt: dayjs.utc()
        });

        await addPoints(guild!.id, author.id, dailyReward);
        return message.reply({ content: claimed });
    }
} as Command;

const getTimeRemaining = (updatedAt: Date) => {
    const thenUTC = dayjs.utc(updatedAt);
    const nowUTC = dayjs.utc();

    const oneDay = thenUTC.add(1, "days");
    const timeRemaining = oneDay.diff(nowUTC);
    const duration = dayjs.duration(timeRemaining);

    const hoursDuration = duration.hours();
    const minsDuration = duration.minutes();
    const secsDuration = duration.seconds();

    const hoursText = hoursDuration !== 1 ? "hours" : "hour";
    const minsText = minsDuration !== 1 ? "minutes" : "minute";
    const secsText = secsDuration !== 1 ? "seconds" : "second";

    if (hoursDuration === 0 && minsDuration === 0) {
        return `**${secsDuration} ${secsText}**.`;
    } else if (hoursDuration === 0) {
        return `**${minsDuration} ${minsText} and ${secsDuration} ${secsText}**.`;
    } else {
        return `**${hoursDuration} ${hoursText}, ${minsDuration} ${minsText}, and ${secsDuration} ${secsText}**.`;
    }
};

const getHours = (updatedAt: Date) => {
    const thenUTC = dayjs.utc(updatedAt);
    const nowUTC = dayjs.utc();
    return nowUTC.diff(thenUTC, "hours");
};
