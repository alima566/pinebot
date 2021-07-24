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
const utils_1 = require("../../utils/utils");
const discord_js_1 = require("discord.js");
const gamblingSchema_1 = __importDefault(require("../../models/gamblingSchema"));
exports.default = {
    name: "top",
    aliases: ["leaderboard"],
    category: "Gambling",
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS"],
    execute({ client, message }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (message.channel.id !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `Leaderboard can only be checked in <#${gamblingChannel}>!`
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
            utils_1.setCooldown(client, this, message);
            let text = "";
            const results = yield gamblingSchema_1.default
                .find({ guildID: message.guild.id })
                .sort({ points: -1 })
                .limit(10);
            if (results.length) {
                for (let count = 0; count < results.length; count++) {
                    const { userID, points } = results[count];
                    if (points != 0) {
                        text += `${count + 1}. <@${userID}> has \`${utils_1.formatNumber(points)}\` pina colada${points !== 1 ? "s" : ""}.\n`;
                    }
                }
            }
            else {
                text = "No gamblers yet.";
            }
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setColor("#85bb65")
                .setTitle("Gambling Leaderboard")
                .setThumbnail("https://i.imgur.com/VwbWTOn.png")
                .setDescription(text)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            return message.channel.send({ embeds: [msgEmbed] });
        });
    }
};
