import { SlashCommand } from "../../interfaces/SlashCommand";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import { MessageEmbed } from "discord.js";

export default {
    name: "jackpot",
    description: "Check the current jackpot amount.",
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, interaction }) {
        const guildInfo = await getGuildInfo(client, interaction.guild!.id);
        const { gamblingChannel, jackpotAmount } = guildInfo.gambling;
        if (gamblingChannel) {
            if (interaction.channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `You can only check the jackpot in <#${gamblingChannel}>!`,
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
        const msgEmbed = new MessageEmbed()
            .setColor("#85bb65")
            .setTitle("Current Jackpot Amount")
            .setThumbnail("https://i.imgur.com/VwbWTOn.png")
            .setDescription(`The current jackpot amount is \`${formatNumber(jackpotAmount!)}\`.`)
            .setFooter(
                `Requested by ${interaction.user.tag}`,
                interaction.user.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();
        return await interaction.reply({ embeds: [msgEmbed] });
    }
} as SlashCommand;
