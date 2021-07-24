import { SlashCommand } from "../../interfaces/SlashCommand";
import { MessageEmbed, Snowflake } from "discord.js";
import { getPoints } from "../../utils/gambling";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import gamblingSchema from "../../models/gamblingSchema";

export default {
    name: "points",
    description: "See your points or another user's.",
    cooldown: 15,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "user",
            description: "The other user's points to check.",
            type: "USER"
        }
    ],
    async execute({ client, interaction }) {
        let target;
        if (!interaction.options.get("user")) {
            target = interaction.user;
        } else {
            const { user } = interaction.options.get("user")!;
            target = user;
        }

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
