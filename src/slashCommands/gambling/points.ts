import { SlashCommand } from "../../interfaces/SlashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Snowflake } from "discord.js";
import { getPoints } from "../../utils/gambling";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import gamblingSchema from "../../models/gamblingSchema";

export default {
    data: new SlashCommandBuilder()
        .setName("points")
        .setDescription("See the amount of pina coladas you have or another member's.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The other member's pina coladas to check.")
        ),
    cooldown: 15,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, interaction }) {
        const target = !interaction.options.getUser("user")
            ? interaction.user
            : interaction.options.getUser("user");

        const guildInfo = await getGuildInfo(client, interaction.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (interaction.channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `Pina coladas can only be checked in <#${gamblingChannel}>!`,
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
        const points = await getPoints(interaction.guild!.id, target!.id);
        const ranking = await getRanking(interaction.guild!.id, target!.id);

        const msgEmbed = new MessageEmbed()
            .setColor("#85bb65")
            .setAuthor(target!.tag, target!.displayAvatarURL({ dynamic: true }))
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
        return await interaction.reply({ embeds: [msgEmbed] });
    }
} as SlashCommand;

const getRanking = async (guildID: Snowflake, userID: Snowflake) => {
    const results = await gamblingSchema.find({ guildID }).sort({ points: -1 });
    const rank = results.findIndex((i: { userID: Snowflake }) => i.userID == userID);
    return `${rank + 1}/${results.length}`;
};
