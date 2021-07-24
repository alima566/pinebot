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
const discord_js_1 = require("discord.js");
exports.default = {
    name: "jackpot",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
    execute({ client, message }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const { gamblingChannel, jackpotAmount } = guildInfo.gambling;
            if (gamblingChannel) {
                if (message.channel.id !== gamblingChannel) {
                    const msg = yield message.reply({
                        content: `You can only check the jackpot in <#${gamblingChannel}>!`
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
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setColor("#85bb65")
                .setTitle("Current Jackpot Amount")
                .setThumbnail("https://i.imgur.com/VwbWTOn.png")
                .setDescription(`The current jackpot amount is \`${utils_1.formatNumber(jackpotAmount)}\`.`)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            return message.channel.send({ embeds: [msgEmbed] });
        });
    }
};
