import { Snowflake } from "discord-api-types";
import { Command } from "../../interfaces/Command";
import { CustomEmbed, getGuildInfo } from "../../utils/utils";

export default {
    name: "slash",
    hideCommand: true,
    devOnly: true,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, message, args }) {
        const msgEmbed = (await CustomEmbed({ client, userID: message.author.id })).setTitle(
            `${client.user!.username} Slash Commands`
        );
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const guildCommands = await client.guilds.cache.get(message.guild!.id)?.commands.fetch();
        const globalCommands = await client.application!.commands.fetch();

        if (!args[0]) {
            msgEmbed.addFields(
                {
                    name: `❯ Global [${!globalCommands ? "0" : globalCommands.size}]:`,
                    value:
                        !globalCommands || globalCommands.size == 0
                            ? "None"
                            : globalCommands
                                  .map((cmd) => `• ${cmd.name}: \`${cmd.id}\``)
                                  .sort()
                                  .join("\n")
                },
                {
                    name: `❯ ${message.guild!.name} Only [${
                        !guildCommands ? "0" : guildCommands!.size
                    }]:`,
                    value:
                        !guildCommands || guildCommands.size == 0
                            ? "None"
                            : guildCommands
                                  .map((cmd) => `• ${cmd.name}: \`${cmd.id}\``)
                                  .sort()
                                  .join("\n")
                }
            );
            return message.channel.send({ embeds: [msgEmbed] });
        }

        switch (args[0].toLowerCase()) {
            case "delete":
                const targetCommand = args[1];
                if (!targetCommand) {
                    msgEmbed.setDescription("Please specify a slash command ID.");
                    return message.reply({ embeds: [msgEmbed] });
                }

                const isGuild = guildCommands!.filter((cmd) => cmd.id == targetCommand).size != 0;

                const slashCmd = isGuild
                    ? guildCommands?.get(targetCommand as Snowflake)
                    : globalCommands?.get(targetCommand as Snowflake);

                if (!slashCmd) {
                    msgEmbed.setDescription("A slash command with that ID could not be found.");
                    return message.reply({ embeds: [msgEmbed] });
                }

                msgEmbed.setDescription(
                    `Slash command \`${slashCmd.name}\` has successfully been deleted${
                        isGuild
                            ? ` from \`${message.guild!.name}\`.`
                            : ". Global commands can take up to one hour to delete."
                    }`
                );
                message.channel.send({ embeds: [msgEmbed] });

                slashCmd.delete();
                client.slashCommands.delete(targetCommand);
                break;
            default:
                msgEmbed.setDescription(
                    `Incorrect usage. Please use \`${guildInfo.prefix}slash delete <Command ID>\``
                );
                message.channel.send({ embeds: [msgEmbed] });
                break;
        }
        return;
    }
} as Command;
