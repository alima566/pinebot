"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils/utils");
exports.default = {
    name: "slash",
    hideCommand: true,
    devOnly: true,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    execute({ client, message, args }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const msgEmbed = (yield utils_1.CustomEmbed({ client, userID: message.author.id })).setTitle(`${client.user.username} Slash Commands`);
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const guildCommands = yield ((_a = client.guilds.cache.get(message.guild.id)) === null || _a === void 0 ? void 0 : _a.commands.fetch());
            const globalCommands = yield client.application.commands.fetch();
            if (!args[0]) {
                msgEmbed.addFields({
                    name: `❯ Global [${!globalCommands ? "0" : globalCommands.size}]:`,
                    value: !globalCommands || globalCommands.size == 0
                        ? "None"
                        : globalCommands
                            .map((cmd) => `• ${cmd.name}: \`${cmd.id}\``)
                            .sort()
                            .join("\n")
                }, {
                    name: `❯ ${message.guild.name} Only [${!guildCommands ? "0" : guildCommands.size}]:`,
                    value: !guildCommands || guildCommands.size == 0
                        ? "None"
                        : guildCommands
                            .map((cmd) => `• ${cmd.name}: \`${cmd.id}\``)
                            .sort()
                            .join("\n")
                });
                return message.channel.send({ embeds: [msgEmbed] });
            }
            switch (args[0].toLowerCase()) {
                case "delete":
                    const targetCommand = args[1];
                    if (!targetCommand) {
                        msgEmbed.setDescription("Please specify a slash command ID.");
                        return message.reply({ embeds: [msgEmbed] });
                    }
                    const isGuild = guildCommands.filter((cmd) => cmd.id == targetCommand).size != 0;
                    const slashCmd = isGuild
                        ? guildCommands === null || guildCommands === void 0 ? void 0 : guildCommands.get(targetCommand)
                        : globalCommands === null || globalCommands === void 0 ? void 0 : globalCommands.get(targetCommand);
                    if (!slashCmd) {
                        msgEmbed.setDescription("A slash command with that ID could not be found.");
                        return message.reply({ embeds: [msgEmbed] });
                    }
                    msgEmbed.setDescription(`Slash command \`${slashCmd.name}\` has successfully been deleted${isGuild
                        ? ` from \`${message.guild.name}\`.`
                        : ". Global commands can take up to one hour to delete."}`);
                    message.channel.send({ embeds: [msgEmbed] });
                    slashCmd.delete();
                    client.slashCommands.delete(targetCommand);
                    break;
                default:
                    msgEmbed.setDescription(`Incorrect usage. Please use \`${guildInfo.prefix}slash delete <Command ID>\``);
                    message.channel.send({ embeds: [msgEmbed] });
                    break;
            }
            return;
        });
    }
};
