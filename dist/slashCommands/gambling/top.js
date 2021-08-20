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
const builders_1 = require("@discordjs/builders");
const utils_1 = require("../../utils/utils");
const discord_js_1 = require("discord.js");
const gamblingSchema_1 = __importDefault(require("../../models/gamblingSchema"));
exports.default = {
    data: new builders_1.SlashCommandBuilder()
        .setName("top")
        .setDescription("See the top 10 gamblers with the most pina coladas."),
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, interaction.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (interaction.channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `Leaderboard can only be checked in <#${gamblingChannel}>!`,
                        ephemeral: true
                    });
                }
            }
            else {
                return yield interaction.reply({
                    content: "A gambling channel needs to be set first in order for this command to be used.",
                    ephemeral: true
                });
            }
            utils_1.setCooldown(client, this, interaction);
            let text = "";
            const results = yield gamblingSchema_1.default
                .find({ guildID: interaction.guild.id })
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
                .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            return yield interaction.reply({ embeds: [msgEmbed] });
        });
    }
};
