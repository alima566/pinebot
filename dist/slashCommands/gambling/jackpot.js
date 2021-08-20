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
const builders_1 = require("@discordjs/builders");
const utils_1 = require("../../utils/utils");
const discord_js_1 = require("discord.js");
exports.default = {
    data: new builders_1.SlashCommandBuilder()
        .setName("jackpot")
        .setDescription("Check the current jackpot amount."),
    cooldown: 30,
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = yield utils_1.getGuildInfo(client, interaction.guild.id);
            const { gamblingChannel, jackpotAmount } = guildInfo.gambling;
            if (gamblingChannel) {
                if (interaction.channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `You can only check the jackpot in <#${gamblingChannel}>!`,
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
            const msgEmbed = new discord_js_1.MessageEmbed()
                .setColor("#85bb65")
                .setTitle("Current Jackpot Amount")
                .setThumbnail("https://i.imgur.com/VwbWTOn.png")
                .setDescription(`The current jackpot amount is \`${utils_1.formatNumber(jackpotAmount)}\`.`)
                .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            return yield interaction.reply({ embeds: [msgEmbed] });
        });
    }
};
