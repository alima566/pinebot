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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gambling_1 = require("../../utils/gambling");
const utils_1 = require("../../utils/utils");
const gamblingSchema_1 = __importDefault(require("../../models/gamblingSchema"));
exports.default = {
    name: "points",
    aliases: ["bal", "balance"],
    category: "Gambling",
    cooldown: 15,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mentions, member, guild, channel } = message;
            const target = mentions.members.first() || guild.members.cache.get(args[0]) || member;
            const guildInfo = yield utils_1.getGuildInfo(client, guild.id);
            const gamblingChannel = guildInfo.gambling.gamblingChannel;
            if (gamblingChannel) {
                if (channel.id !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `Pina coladas can only be checked in <#${gamblingChannel}>!`
                    });
                    setTimeout(() => {
                        msg.delete();
                    }, 1000 * 3);
                    return message.delete();
                }
            }
            else {
                const msg = yield message.reply({
                    content: "A gambling channel needs to be set first in order for this command to be used."
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
            if (target.user.bot) {
                return message.reply({
                    content: "Bots don't have any pina coladas, so you can't check them."
                });
            }
            utils_1.setCooldown(client, this, message);
            const points = yield gambling_1.getPoints(guild.id, target.id);
            const ranking = yield getRanking(guild.id, target.id);
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setColor("#85bb65")
                .setAuthor(target.user.tag, target.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                name: `**Pina Coladas**`,
                value: `\`${utils_1.formatNumber(points)}\``,
                inline: true
            }, {
                name: `**Ranking**`,
                value: ranking,
                inline: true
            });
            return channel.send({ embeds: [msgEmbed] });
        });
    }
};
const getRanking = (guildID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield gamblingSchema_1.default.find({ guildID }).sort({ points: -1 });
    const rank = results.findIndex((i) => i.userID == userID);
    return `${rank + 1}/${results.length}`;
});
