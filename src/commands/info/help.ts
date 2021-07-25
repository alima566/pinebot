import { Command } from "../../interfaces/Command";
import { Client } from "../../Client";
import { msToTime, CustomEmbed, getGuildInfo, getUserInfo, getCooldown } from "../../utils/utils";
import languages from "../../config/languages.json";
import { Message, Collection, Snowflake } from "discord.js";

const replacePrefix = (string: string, guildPrefix: string): string => {
    return string.replace(/{PREFIX}/g, guildPrefix);
};

export default {
    name: "help",
    category: "Info",
    aliases: ["h"],
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, message, args }) {
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const guildPrefix = guildInfo!.prefix;

        let userInfo = await getUserInfo(client, message.author.id);

        const language = userInfo.language;
        //@ts-ignore
        const languageHelp = languages[language].help.names;
        if (!args.length) {
            return defaultHelp(client, message, guildPrefix, languageHelp);
        }

        const queryName = args.join(" ").toLowerCase();
        const command =
            client.commands.get(queryName) ||
            (guildInfo!.commandAlias
                ? client.commands.get(guildInfo!.commandAlias[queryName])
                : false);

        const category = client.categories.get(queryName);
        const helpEmbed = await CustomEmbed({ client, userID: message.author.id });

        if (command && !command.hideCommand) {
            //@ts-ignore
            let commandHelp = languages[language][command.name];
            helpEmbed
                .setTitle(command.name)
                .setAuthor(command.category ? command.category : languageHelp.noCategory)
                .setTimestamp()
                .setFooter(
                    `Requested by ${message.author.tag}`,
                    message.author.displayAvatarURL({ dynamic: true })
                );

            if (commandHelp.description) {
                helpEmbed.setDescription(replacePrefix(commandHelp.description, guildPrefix));
            }

            if (commandHelp.usage) {
                helpEmbed.addField(
                    languageHelp.usage,
                    replacePrefix(commandHelp.usage, guildPrefix)
                );
            }

            const customAliases = getCustomAliases(client, message.guild!.id, command.name);
            let aliases: string[] = [];
            if (command.aliases && command.aliases.length !== 0) {
                aliases = aliases.concat(command.aliases);
            }

            if (customAliases && customAliases.length !== 0) {
                aliases = aliases.concat(customAliases);
            }

            if (aliases.length > 0) {
                helpEmbed.addField(languageHelp.aliases, "`" + aliases.join("`, `") + "`");
            }

            if (commandHelp.examples) {
                helpEmbed.addField(
                    languageHelp.examples,
                    replacePrefix(commandHelp.examples, guildPrefix)
                );
            }

            let cd = getCooldown(client, command, message);
            if (cd) {
                helpEmbed.addField(languageHelp.cooldown, `${msToTime(cd * 1000)}`);
            }

            if (
                client.guildInfoCache
                    .get(message.guild!.id)!
                    .disabledCommands.includes(command.name)
            ) {
                helpEmbed.setAuthor(languageHelp.isDisabled);
            }
            return message.channel.send({ embeds: [helpEmbed] });
        }

        if (category) {
            helpEmbed
                .setTitle(`${category[0]} [${category.length - 1}]`)
                .setTimestamp()
                .setFooter(
                    `Requested by ${message.author.tag}`,
                    message.author.displayAvatarURL({ dynamic: true })
                )
                .setDescription("`" + category.slice(1).join("`, `") + "`");
            return message.channel.send({ embeds: [helpEmbed] });
        }
        return defaultHelp(client, message, guildPrefix, languageHelp);
    }
} as Command;

const defaultHelp = async (
    client: Client,
    message: Message,
    guildPrefix: string,
    languageHelp: any
) => {
    const helpEmbed = (await CustomEmbed({ client, userID: message.author.id }))
        .setTitle(languageHelp.commandCategories)
        .setDescription(replacePrefix(languageHelp.categoriesHelp, guildPrefix))
        .setTimestamp()
        .setFooter(
            `Requested by ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(client.user!.displayAvatarURL({ dynamic: true }))
        .addField(
            languageHelp.categoriesName,
            client.categories.map((c) => `\`${c[0]}\``).join(", ")
        );
    message.channel.send({ embeds: [helpEmbed] });
};

const getCustomAliases = (client: Client, guildID: Snowflake, commandName: string) => {
    const guildInfo = client.guildInfoCache.get(guildID);
    const commandAlias = guildInfo!.commandAlias ? Object.entries(guildInfo!.commandAlias) : [];

    const commands = new Collection<string, string[]>();
    for (let [alias, command] of commandAlias) {
        //@ts-ignore
        let aliases = commands.get(command);

        if (!aliases || aliases.length == 0) {
            aliases = [alias];
        } else {
            aliases.push(alias);
        }
        //@ts-ignore
        commands.set(command, aliases);
    }
    return commands.get(commandName);
};
