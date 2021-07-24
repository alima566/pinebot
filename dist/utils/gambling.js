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
exports.resetJackpotAmount = exports.updateJackpotAmount = exports.getPoints = exports.setPoints = exports.addPoints = void 0;
const gamblingSchema_1 = __importDefault(require("../models/gamblingSchema"));
const pointsCache = {};
const addPoints = (guildID, userID, points) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gamblingSchema_1.default.findOneAndUpdate({
        guildID,
        userID
    }, {
        guildID,
        userID,
        $inc: {
            points
        }
    }, {
        upsert: true,
        new: true
    });
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
});
exports.addPoints = addPoints;
const setPoints = (guildID, userID, points) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gamblingSchema_1.default.findOneAndUpdate({
        guildID,
        userID
    }, {
        guildID,
        userID,
        $set: {
            points
        }
    }, {
        upsert: true,
        new: true
    });
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
});
exports.setPoints = setPoints;
const getPoints = (guildID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedValue = pointsCache[`${guildID}-${userID}`];
    if (cachedValue) {
        return cachedValue;
    }
    const result = yield gamblingSchema_1.default.findOne({
        guildID,
        userID
    });
    let points = 0;
    if (result) {
        points = result.points;
    }
    else {
        yield new gamblingSchema_1.default({
            guildID,
            userID,
            points
        }).save();
    }
    pointsCache[`${guildID}-${userID}`] = points;
    return points;
});
exports.getPoints = getPoints;
const updateJackpotAmount = (client, guildID, amount) => __awaiter(void 0, void 0, void 0, function* () {
    let guildInfo = yield client.DBGuild.findByIdAndUpdate(guildID, { $inc: { "gambling.jackpotAmount": amount } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    client.guildInfoCache.set(guildID, guildInfo);
});
exports.updateJackpotAmount = updateJackpotAmount;
const resetJackpotAmount = (client, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    let guildInfo = yield client.DBGuild.findByIdAndUpdate(guildID, { $set: { "gambling.jackpotAmount": 10000 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    client.guildInfoCache.set(guildID, guildInfo);
});
exports.resetJackpotAmount = resetJackpotAmount;
