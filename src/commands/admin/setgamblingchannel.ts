import { Command } from "../../interfaces/Command";
import { getGuildInfo } from "../../utils/utils";

export default {
    name: "setgamblingchannel",
    category: "Admin",
    aliases: ["setgambling", "setgamblingchan"],
    perms: ["MANAGE_GUILD"],
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
    async execute({ client, message }) {
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const channel = message.mentions.channels.first() || message.channel;

        if (channel.isThread() || channel.type != "GUILD_TEXT") {
            return message.reply({
                content: "Only text channels can be set as gambling channel."
            });
        }

        await client.DBGuild.findByIdAndUpdate(
            message.guild!.id,
            {
                "gambling.gamblingChannel": channel.id
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        guildInfo!.gambling.gamblingChannel = channel.id;
        client.guildInfoCache.set(message.guild!.id, guildInfo!);
        const msg = await message.channel.send({
            content: `Gambling channel has successfully been set to ${channel}.`
        });
        setTimeout(() => {
            msg.delete();
        }, 1000 * 3);
        return message.delete();
    }
} as Command;
//1045454545486151
