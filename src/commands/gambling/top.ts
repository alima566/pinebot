import { Command } from "../../interfaces/Command";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import { MessageEmbed } from "discord.js";
import gamblingSchema from "../../models/gamblingSchema";

export default {
    name: "top",
    aliases: ["leaderboard"],
    category: "Gambling",
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS"],
    async execute({ client, message }) {
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (message.channel.id !== gamblingChannel) {
                const msg = await message.reply({
                    content: `Leaderboard can only be checked in <#${gamblingChannel}>!`
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

        setCooldown(client, this, message);
        let text = "";
        const results = await gamblingSchema
            .find({ guildID: message.guild!.id })
            .sort({ points: -1 })
            .limit(10);
        if (results.length) {
            for (let count = 0; count < results.length; count++) {
                const { userID, points } = results[count];
                if (points != 0) {
                    text += `${count + 1}. <@${userID}> has \`${formatNumber(
                        points
                    )}\` pina colada${points !== 1 ? "s" : ""}.\n`;
                }
            }
        } else {
            text = "No gamblers yet.";
        }

        const msgEmbed = new MessageEmbed()
            .setColor("#85bb65")
            .setTitle("Gambling Leaderboard")
            .setThumbnail("https://i.imgur.com/VwbWTOn.png")
            .setDescription(text)
            .setFooter(
                `Requested by ${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();

        return message.channel.send({ embeds: [msgEmbed] });
    }
} as Command;
