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
    name: "setgamblingchannel",
    category: "Admin",
    aliases: ["setgambling", "setgamblingchan"],
    perms: ["MANAGE_GUILD"],
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
    execute({ client, message }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const channel = message.mentions.channels.first() || message.channel;
            if (channel.isThread() || channel.type != "GUILD_TEXT") {
                return message.reply({
                    content: "Only text channels can be set as gambling channel."
                });
            }
            yield client.DBGuild.findByIdAndUpdate(message.guild.id, {
                "gambling.gamblingChannel": channel.id
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            guildInfo.gambling.gamblingChannel = channel.id;
            client.guildInfoCache.set(message.guild.id, guildInfo);
            const msg = yield message.channel.send({
                content: `Gambling channel has successfully been set to ${channel}.`
            });
            setTimeout(() => {
                msg.delete();
            }, 1000 * 3);
            return message.delete();
        });
    }
};
//1045454545486151
