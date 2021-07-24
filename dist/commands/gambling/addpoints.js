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
const gambling_1 = require("../../utils/gambling");
const utils_1 = require("../../utils/utils");
exports.default = {
    name: "addpoints",
    aliases: ["add"],
    category: "Gambling",
    perms: ["MANAGE_GUILD"],
    clientPerms: ["SEND_MESSAGES"],
    execute({ client, message, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, message.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (!gamblingChannel) {
                return message.reply({
                    content: "Can't add pina coladas to members as no gambling channel has been set yet."
                });
            }
            const mention = args[0].toLowerCase() == "all" ? "all" : message.mentions.members.first();
            if (!mention) {
                return message.reply({
                    content: "Please tag a member or type `all` to add pina coladas to."
                });
            }
            if (!args[1]) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (!utils_1.isValidNumber(args[1].trim())) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            const points = utils_1.removeCommas(args[1].trim());
            if (isNaN(+points) || !Number.isInteger(+points)) {
                return message.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+points < 0) {
                return message.reply({
                    content: "Please enter a positive number greater than 0."
                });
            }
            if (mention == "all") {
                const members = yield message.guild.members.fetch();
                members.forEach((mem) => __awaiter(this, void 0, void 0, function* () {
                    if (!mem.user.bot) {
                        yield gambling_1.addPoints(message.guild.id, mem.id, +points);
                    }
                }));
                const memberCount = members.filter((mem) => !mem.user.bot).size;
                return message.channel.send({
                    content: `You have added \`${utils_1.formatNumber(+points)}\` pina colada${+points != 1 ? "s" : ""} to **${memberCount}** member${memberCount != 1 ? "s" : ""}.`
                });
            }
            if (mention.user.bot) {
                return message.reply({ content: "You can not give pina coladas to bots." });
            }
            const newPoints = yield gambling_1.addPoints(message.guild.id, mention.id, +points);
            return message.channel.send({
                content: `You have given **${mention.user.tag}** \`${utils_1.formatNumber(+points)}\` pina colada${+points != 1 ? "s" : ""}. They now have \`${utils_1.formatNumber(newPoints)}\` pina colada${newPoints != 1 ? "s" : ""}.`
            });
        });
    }
};
