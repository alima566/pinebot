import Discord, { Snowflake } from "discord.js";
import { Client } from "../../Client";
import { devs, testServer } from "../../config/config.json";
import {
    msToTime,
    processArguments,
    missingPermissions,
    getCooldown,
    CustomEmbed,
    getGuildInfo
} from "../../utils/utils";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (client: Client, message: Discord.Message) => {
    try {
        const msgEmbed = await CustomEmbed({ client, userID: message.author.id });

        if (
            message.author.bot ||
            message.channel.type === "DM" ||
            client.blacklistCache.has(message.author.id) ||
            message.webhookId
        )
            return;

        let guildInfo = await getGuildInfo(client, message.guild!.id);

        const prefixRegex = new RegExp(
            `^(<@!?${client.user!.id}>|${escapeRegex(guildInfo.prefix)})\\s*`
        );

        if (!prefixRegex.test(message.content)) return;

        //@ts-ignore
        const [, matchedPrefix] = message.content.match(prefixRegex);
        let msgArgs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        let cmdName = msgArgs.shift()!.toLowerCase();

        if (message.mentions.has(client.user!) && !cmdName) {
            msgEmbed.setDescription(
                `My prefix for this server is \`${guildInfo.prefix}\` or ${
                    client.user
                }.\n\nTo view a list of my commands, type either \`${
                    guildInfo.prefix
                }help\` or \`@${client.user!.tag} help\`.`
            );
            return message.channel.send({ embeds: [msgEmbed] });
        }

        const command =
            client.commands.get(cmdName) ||
            (guildInfo.commandAlias ? client.commands.get(guildInfo.commandAlias[cmdName]) : false);

        if (!command) return;

        if (command.devOnly && !devs.includes(message.author.id)) return;

        if (command.testOnly && !testServer.includes(message.guild!.id)) return;

        if (command.serverOwnerOnly && message.guild!.ownerId !== message.author.id) return;

        if (guildInfo.disabledCommands.includes(command.name)) return;

        if (
            guildInfo.disabledChannels.includes(message.channel.id) &&
            !command.ignoreDisabledChannels
        ) {
            return;
        }

        if (
            command.clientPerms &&
            !message.channel.permissionsFor(message.guild!.me!)!.has(command.clientPerms)
        ) {
            return message.reply({
                content: `${
                    message.author.username
                }, I am missing the following permissions: ${missingPermissions(
                    message.member!,
                    guildInfo.commandPerms![command.name]
                )}.`
            });
        }

        if (
            guildInfo.commandPerms &&
            guildInfo.commandPerms[command.name] &&
            !message.member!.permissions.has(guildInfo.commandPerms[command.name])
        ) {
            msgEmbed
                .setColor("RED")
                .setDescription(
                    `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${missingPermissions(
                        message.member!,
                        guildInfo.commandPerms[command.name]
                    )}.`
                );
            return message.channel.send({ embeds: [msgEmbed] });
        }

        if (command.perms && !message.member!.permissions.has(command.perms)) {
            msgEmbed
                .setColor("RED")
                .setDescription(
                    `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${missingPermissions(
                        message.member!,
                        command.perms
                    )}.`
                );
            return message.channel.send({ embeds: [msgEmbed] });
        }

        const cd = getCooldown(client, command, message);
        let cooldowns;
        if (cd) {
            if (typeof command.globalCooldown === "undefined" || command.globalCooldown) {
                if (!client.globalCooldowns.has(command.name)) {
                    client.globalCooldowns.set(
                        command.name,
                        new Discord.Collection<Snowflake, number>()
                    );
                }
                cooldowns = client.globalCooldowns;
            } else {
                if (!client.serverCooldowns.has(message.guild!.id)) {
                    client.serverCooldowns.set(
                        message.guild!.id,
                        new Discord.Collection<Snowflake, Discord.Collection<Snowflake, number>>()
                    );
                }
                cooldowns = client.serverCooldowns.get(message.guild!.id);
                if (!cooldowns!.has(command.name)) {
                    cooldowns!.set(command.name, new Discord.Collection<Snowflake, number>());
                }
            }

            const now = Date.now();
            const timestamps = cooldowns!.get(command.name)!;
            const cooldownAmount = cd * 1000;
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;
                if (now < expirationTime) {
                    msgEmbed
                        .setColor("RED")
                        .setDescription(
                            `Command on ${
                                command.globalCooldown ? "global" : ""
                            } cooldown. Please wait \`${msToTime(
                                expirationTime - now
                            )}\` before using this command again.`
                        );
                    return message.channel.send({ embeds: [msgEmbed] });
                }
            }
        }

        let flags;
        if (command.arguments) {
            flags = processArguments(message, msgArgs, command.arguments);
        }
        if (flags && flags.invalid) {
            if (flags.prompt) {
                return message.reply({
                    //@ts-ignore
                    content: flags.prompt
                });
            }
        }

        return command.execute({
            client,
            message,
            args: msgArgs,
            //@ts-ignore
            flags
        });
    } catch (e) {
        console.error(e);
    }
};
