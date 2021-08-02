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
    description: "See your points or another user's.",
    cooldown: 15,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "user",
            description: "The other user's points to check.",
            type: "USER"
        }
    ],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = !interaction.options.getUser("user")
                ? interaction.user
                : interaction.options.getUser("user");
            const guildInfo = yield utils_1.getGuildInfo(client, interaction.guild.id);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (interaction.channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `Pina coladas can only be checked in <#${gamblingChannel}>!`,
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
            const points = yield gambling_1.getPoints(interaction.guild.id, target.id);
            const ranking = yield getRanking(interaction.guild.id, target.id);
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setColor("#85bb65")
                .setAuthor(target.tag, target.displayAvatarURL({ dynamic: true }))
                .addFields({
                name: `**Pina Coladas**`,
                value: `\`${utils_1.formatNumber(points)}\``,
                inline: true
            }, {
                name: `**Ranking**`,
                value: ranking,
                inline: true
            });
            return yield interaction.reply({ embeds: [msgEmbed] });
        });
    }
};
const getRanking = (guildID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield gamblingSchema_1.default.find({ guildID }).sort({ points: -1 });
    const rank = results.findIndex((i) => i.userID == userID);
    return `${rank + 1}/${results.length}`;
});
