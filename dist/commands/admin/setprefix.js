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
const prefixRegExp = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{1,15}$/;
exports.default = {
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
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgEmbed = (yield utils_1.CustomEmbed({ client, userID: message.author.id })).setTitle("Custom Prefix");
            if (!prefixRegExp.test(args[0])) {
                msgEmbed.setDescription(`${message.author}, cannot set prefix to that. Please try again.`);
                return message.channel.send({ embeds: [msgEmbed] });
            }
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            if (guildInfo.prefix === args[0]) {
                msgEmbed.setDescription(`${message.author}, please make sure to enter a *new* prefix.`);
                return message.channel.send({ embeds: [msgEmbed] });
            }
            utils_1.setCooldown(client, this, message);
            yield client.DBGuild.findByIdAndUpdate(message.guild.id, {
                $set: {
                    prefix: args[0]
                }
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            guildInfo.prefix = args[0];
            client.guildInfoCache.set(message.guild.id, guildInfo);
            msgEmbed.setDescription(`${message.author}, the new prefix has successfully been set to \`${args[0]}\`.`);
            return message.channel.send({ embeds: [msgEmbed] });
        });
    }
};
