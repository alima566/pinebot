import { Command } from "../../interfaces/Command";
import { setCooldown, getGuildInfo, CustomEmbed } from "../../utils/utils";

const prefixRegExp = /^[a-zA-Z0-9!@#\$%\^\&*\)\(?+=._-]{1,15}$/;

export default {
    name: "setprefix",
    category: "Admin",
    aliases: ["prefix"],
    arguments: [
        {
            type: "SOMETHING",
            prompt: "Please enter a new prefix to use."
        }
    ],
    perms: ["MANAGE_GUILD"],
    clientPerms: ["SEND_MESSAGES"],
    async execute({ client, message, args }) {
        const msgEmbed = (await CustomEmbed({ client, userID: message.author.id })).setTitle(
            "Custom Prefix"
        );

        if (!prefixRegExp.test(args[0])) {
            msgEmbed.setDescription(
                `${message.author}, cannot set prefix to that. Please try again.`
            );
            return message.channel.send({ embeds: [msgEmbed] });
        }

        const guildInfo = await getGuildInfo(client, message.guild!.id);
        if (guildInfo!.prefix === args[0]) {
            msgEmbed.setDescription(`${message.author}, please make sure to enter a *new* prefix.`);
            return message.channel.send({ embeds: [msgEmbed] });
        }

        setCooldown(client, this, message);
        await client.DBGuild.findByIdAndUpdate(
            message.guild!.id,
            {
                $set: {
                    prefix: args[0]
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        guildInfo!.prefix = args[0];
        client.guildInfoCache.set(message.guild!.id, guildInfo!);

        msgEmbed.setDescription(
            `${message.author}, the new prefix has successfully been set to \`${args[0]}\`.`
        );
        return message.channel.send({ embeds: [msgEmbed] });
    }
} as Command;
