import { Snowflake } from "discord.js";
import gamblingSchema from "../models/gamblingSchema";
import { Client } from "../Client";

const pointsCache: any = {};

export const addPoints = async (guildID: Snowflake, userID: Snowflake, points: number) => {
    const result = await gamblingSchema.findOneAndUpdate(
        {
            guildID,
            userID
        },
        {
            guildID,
            userID,
            $inc: {
                points
            }
        },
        {
            upsert: true,
            new: true
        }
    );
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
};

export const setPoints = async (guildID: Snowflake, userID: Snowflake, points: number) => {
    const result = await gamblingSchema.findOneAndUpdate(
        {
            guildID,
            userID
        },
        {
            guildID,
            userID,
            $set: {
                points
            }
        },
        {
            upsert: true,
            new: true
        }
    );
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
};

export const getPoints = async (guildID: Snowflake, userID: Snowflake) => {
    const cachedValue = pointsCache[`${guildID}-${userID}`];
    if (cachedValue) {
        return cachedValue;
    }
    const result = await gamblingSchema.findOne({
        guildID,
        userID
    });

    let points = 0;
    if (result) {
        points = result.points;
    } else {
        await new gamblingSchema({
            guildID,
            userID,
            points
        }).save();
    }
    pointsCache[`${guildID}-${userID}`] = points;
    return points;
};

export const updateJackpotAmount = async (client: Client, guildID: Snowflake, amount: number) => {
    let guildInfo = await client.DBGuild.findByIdAndUpdate(
        guildID,
        { $inc: { "gambling.jackpotAmount": amount } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    client.guildInfoCache.set(guildID, guildInfo);
};

export const resetJackpotAmount = async (client: Client, guildID: Snowflake) => {
    let guildInfo = await client.DBGuild.findByIdAndUpdate(
        guildID,
        { $set: { "gambling.jackpotAmount": 10000 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    client.guildInfoCache.set(guildID, guildInfo);
};
