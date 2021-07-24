import { Command } from "../../interfaces/Command";
import { formatNumber, removeCommas, isValidNumber, getGuildInfo } from "../../utils/utils";
import { addPoints, getPoints } from "../../utils/gambling";
import { MessageEmbed } from "discord.js";

export default {
    name: "give",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    async execute({ client, message, args }) {
        const { channel, guild, author } = message;
        const userID = author.id;
        const channelID = channel.id;
        const guildID = guild!.id;

        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (channelID !== gamblingChannel) {
                const msg = await message.reply({
                    content: `You can only give pina coladas in <#${gamblingChannel}>!`
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

        const mention = message.mentions.users.first();
        if (!mention) {
            return message.reply({
                content: "Please mention a user to give your pina coladas to."
            });
        }

        if (!isValidNumber(args[1].trim())) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        const pointsToGive = removeCommas(args[1].trim());
        const actualPoints = await getPoints(guildID!, userID);
        if (actualPoints == 0) {
            return message.reply({ content: "You have no pina coladas to give!" });
        }

        if (isNaN(+pointsToGive) || !Number.isInteger(+pointsToGive)) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (+pointsToGive < 1) {
            return message.reply({ content: "You must give at least 1 pina colada." });
        }

        if (+pointsToGive > actualPoints) {
            return message.reply({
                content: `You don't have enough pina coladas! You only have \`${formatNumber(
                    actualPoints
                )}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }

        if (mention.bot) {
            return message.reply({ content: "You can not give pina coladas to bots!" });
        }

        const targetID = mention.id;
        const userPoints = await addPoints(guildID!, userID, +pointsToGive * -1);
        const targetPoints = await addPoints(guildID!, targetID, +pointsToGive);

        const msgEmbed = new MessageEmbed()
            .setAuthor(author.tag, author.displayAvatarURL({ dynamic: true }))
            .setColor("#85bb65")
            .setDescription(
                `**${author.tag}** has given **${mention.tag}** \`${formatNumber(
                    +pointsToGive
                )}\` pina colada${+pointsToGive != 1 ? "s" : ""}.`
            )
            .addFields(
                {
                    name: `**${author.tag}**`,
                    value: `Pina Coladas: \`${formatNumber(userPoints)}\``,
                    inline: true
                },
                {
                    name: "**→**",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: `**${mention.tag}**`,
                    value: `Pina Coladas: \`${formatNumber(targetPoints)}\``,
                    inline: true
                }
            );
        return channel.send({ embeds: [msgEmbed] });
    }
} as Command;
