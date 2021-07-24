import { Command } from "../../interfaces/Command";
import { MessageEmbed, Snowflake } from "discord.js";
import { getPoints } from "../../utils/gambling";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import gamblingSchema from "../../models/gamblingSchema";

export default {
    name: "points",
    aliases: ["bal", "balance"],
    category: "Gambling",
    cooldown: 15,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    async execute({ client, message, args }) {
        const { mentions, member, guild, channel } = message;
        const target =
            mentions.members!.first() || guild!.members.cache.get(args[0] as Snowflake) || member;
        const guildInfo = await getGuildInfo(client, guild!.id);
        const gamblingChannel = guildInfo.gambling.gamblingChannel;

        if (gamblingChannel) {
            if (channel.id !== gamblingChannel) {
                const msg = await message.reply({
                    content: `Pina coladas can only be checked in <#${gamblingChannel}>!`
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

        if (target!.user.bot) {
            return message.reply({
                content: "Bots don't have any pina coladas, so you can't check them."
            });
        }

        setCooldown(client, this, message);
        const points = await getPoints(guild!.id, target!.id);
        const ranking = await getRanking(guild!.id, target!.id);

        const msgEmbed = new MessageEmbed()
            .setColor("#85bb65")
            .setAuthor(target!.user.tag, target!.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: `**Pina Coladas**`,
                    value: `\`${formatNumber(points)}\``,
                    inline: true
                },
                {
                    name: `**Ranking**`,
                    value: ranking,
                    inline: true
                }
            );
        return channel.send({ embeds: [msgEmbed] });
    }
} as Command;

const getRanking = async (guildID: Snowflake, userID: Snowflake) => {
    const results = await gamblingSchema.find({ guildID }).sort({ points: -1 });
    const rank = results.findIndex((i: { userID: Snowflake }) => i.userID == userID);
    return `${rank + 1}/${results.length}`;
};
