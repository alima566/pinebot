import { SlashCommand } from "../../interfaces/SlashCommand";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import { MessageEmbed } from "discord.js";
import gamblingSchema from "../../models/gamblingSchema";

export default {
    name: "top",
    description: "See the top 10 gamblers with the most pina coladas.",
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, interaction }) {
        const guildInfo = await getGuildInfo(client, interaction.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (interaction.channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `Leaderboard can only be checked in <#${gamblingChannel}>!`,
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

        setCooldown(client, this, interaction);
        let text = "";
        const results = await gamblingSchema
            .find({ guildID: interaction.guild!.id })
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
                `Requested by ${interaction.user.tag}`,
                interaction.user.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();
        return await interaction.reply({ embeds: [msgEmbed] });
    }
} as SlashCommand;
