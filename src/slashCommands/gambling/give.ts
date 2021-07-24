import { SlashCommand } from "../../interfaces/SlashCommand";
import { formatNumber, removeCommas, isValidNumber, getGuildInfo } from "../../utils/utils";
import { addPoints, getPoints } from "../../utils/gambling";
import { MessageEmbed } from "discord.js";

export default {
    name: "give",
    description: "Gives another user your pina coladas.",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "user",
            description: "The user you want to give your pina coladas to.",
            type: "USER",
            required: true
        },
        {
            name: "points",
            description: "The user you want to give your pina coladas to.",
            type: "STRING",
            required: true
        }
    ],
    async execute({ client, interaction }) {
        const { guildId, channel } = interaction;
        const { user } = interaction.options.get("user")!;
        let { value: points } = interaction.options.get("points")!;
        points = points as string;

        const guildInfo = await getGuildInfo(client, guildId!);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `You can only give pina coladas in <#${gamblingChannel}>!`,
                    ephemeral: true
                });
            }
        } else {
            return await interaction.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used.",
                ephemeral: true
            });
        }

        if (user!.id == interaction.user.id) {
            return interaction.reply({
                content: "You cannot give yourself pina coladas.",
                ephemeral: true
            });
        }

        if (!isValidNumber(points.trim())) {
            return interaction.reply({ content: "Please provide a valid number of pina coladas." });
        }

        const pointsToGive = removeCommas(points.trim());
        const actualPoints = await getPoints(guildId!, interaction.user.id);
        if (actualPoints == 0) {
            return interaction.reply({ content: "You have no pina coladas to give!" });
        }

        if (isNaN(+pointsToGive) || !Number.isInteger(+pointsToGive)) {
            return interaction.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (+pointsToGive < 1) {
            return interaction.reply({ content: "You must give at least 1 pina colada." });
        }

        if (+pointsToGive > actualPoints) {
            return interaction.reply({
                content: `You don't have enough pina coladas! You only have \`${formatNumber(
                    actualPoints
                )}\` pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }

        if (user!.bot) {
            return interaction.reply({ content: "You can not give pina coladas to bots!" });
        }

        const targetID = user!.id;
        const userPoints = await addPoints(guildId!, interaction.user.id, +pointsToGive * -1);
        const targetPoints = await addPoints(guildId!, targetID, +pointsToGive);

        const msgEmbed = new MessageEmbed()
            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor("#85bb65")
            .setDescription(
                `**${interaction.user.tag}** has given **${user!.tag}** \`${formatNumber(
                    +pointsToGive
                )}\` pina colada${+pointsToGive != 1 ? "s" : ""}.`
            )
            .addFields(
                {
                    name: `**${interaction.user.tag}**`,
                    value: `Pina Coladas: \`${formatNumber(userPoints)}\``,
                    inline: true
                },
                {
                    name: "**→**",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: `**${user!.tag}**`,
                    value: `Pina Coladas: \`${formatNumber(targetPoints)}\``,
                    inline: true
                }
            );
        return interaction.reply({ embeds: [msgEmbed] });
    }
} as SlashCommand;
