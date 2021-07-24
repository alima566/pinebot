"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const discord_js_1 = __importStar(require("discord.js"));
const config_json_1 = require("../../config/config.json");
const utils_1 = require("../../utils/utils");
exports.default = (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const msgEmbed = new discord_js_1.MessageEmbed();
        if (!interaction.isCommand() || !interaction.inGuild())
            return;
        yield utils_1.getGuildInfo(client, interaction.guild.id);
        const slash = client.slashCommands.get(interaction.commandName);
        if (!slash)
            return;
        if (slash.devOnly && !config_json_1.devs.includes(interaction.user.id))
            return;
        //@ts-ignore
        if (slash.perms && !interaction.member.permissions.has(slash.perms)) {
            msgEmbed
                .setColor("RED")
                .setDescription(`Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${utils_1.missingPermissions(interaction.member, slash.perms)}.`);
            return yield interaction.reply({ embeds: [msgEmbed], ephemeral: true });
        }
        const cd = utils_1.getCooldown(client, slash, interaction);
        let cooldowns;
        if (cd) {
            if (typeof slash.globalCooldown === "undefined" || slash.globalCooldown) {
                if (!client.globalCooldowns.has(slash.name)) {
                    client.globalCooldowns.set(slash.name, new discord_js_1.default.Collection());
                }
                cooldowns = client.globalCooldowns;
            }
            else {
                if (!client.serverCooldowns.has(interaction.guild.id)) {
                    client.serverCooldowns.set(interaction.guild.id, new discord_js_1.default.Collection());
                }
                cooldowns = client.serverCooldowns.get(interaction.guild.id);
                if (!cooldowns.has(slash.name)) {
                    cooldowns.set(slash.name, new discord_js_1.default.Collection());
                }
            }
            const now = Date.now();
            const timestamps = cooldowns.get(slash.name);
            const cooldownAmount = cd * 1000;
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    msgEmbed
                        .setColor("RED")
                        .setDescription(`Command on ${slash.globalCooldown ? "global" : ""} cooldown. Please wait \`${utils_1.msToTime(expirationTime - now)}\` before using this command again.`);
                    return yield interaction.reply({
                        embeds: [msgEmbed],
                        ephemeral: true
                    });
                }
            }
        }
        return slash.execute({ client, interaction });
    }
    catch (e) {
        console.log(e);
    }
});
