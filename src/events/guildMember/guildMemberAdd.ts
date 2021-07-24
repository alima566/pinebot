import { GuildMember } from "discord.js";
import { Client } from "../../Client";
import { addPoints } from "../../utils/gambling";
import { getGuildInfo } from "../../utils/utils";
import gamblingSchema from "../../models/gamblingSchema";

export default async (client: Client, member: GuildMember) => {
    const { guild, user } = member;
    const result = await gamblingSchema.findOne({
        guildID: guild.id,
        userID: user.id
    });

    const guildInfo = await getGuildInfo(client, guild.id);
    const { gamblingChannel, dailyReward } = guildInfo.gambling;
    if (!result && !user.bot && gamblingChannel) {
        await addPoints(guild.id, user.id, dailyReward);
    }
};
