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
const gambling_1 = require("../../utils/gambling");
const utils_1 = require("../../utils/utils");
const gamblingSchema_1 = __importDefault(require("../../models/gamblingSchema"));
exports.default = (client, member) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild, user } = member;
    const result = yield gamblingSchema_1.default.findOne({
        guildID: guild.id,
        userID: user.id
    });
    const guildInfo = yield utils_1.getGuildInfo(client, guild.id);
    const { gamblingChannel, dailyReward } = guildInfo.gambling;
    if (!result && !user.bot && gamblingChannel) {
        yield gambling_1.addPoints(guild.id, user.id, dailyReward);
    }
});
