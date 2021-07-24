import { Command } from "../../interfaces/Command";
import { getGuildInfo, formatNumber, setCooldown } from "../../utils/utils";
import { MessageEmbed } from "discord.js";

export default {
    name: "jackpot",
    category: "Gambling",
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    async execute({ client, message }) {
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const { gamblingChannel, jackpotAmount } = guildInfo.gambling;
        if (gamblingChannel) {
            if (message.channel.id !== gamblingChannel) {
                const msg = await message.reply({
                    content: `You can only check the jackpot in <#${gamblingChannel}>!`
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
        const msgEmbed = new MessageEmbed()
            .setColor("#85bb65")
            .setTitle("Current Jackpot Amount")
            .setThumbnail("https://i.imgur.com/VwbWTOn.png")
            .setDescription(`The current jackpot amount is \`${formatNumber(jackpotAmount!)}\`.`)
            .setFooter(
                `Requested by ${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();
        return message.channel.send({ embeds: [msgEmbed] });
    }
} as Command;
