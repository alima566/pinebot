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
const gambling_1 = require("../../utils/gambling");
const discord_js_1 = require("discord.js");
const suits = ["♥", "♠", "♦", "♣"];
const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "K", "Q", "J"];
const hit = "👍";
const stand = "👎";
let deck = [], playerCards = [], playerPoints = 0, playerCardString = "", dealerCards = [], dealerCardString = "", dealerPoints = 0, gameOver, playerWon, inProgress = false;
exports.default = {
    name: "blackjack",
    description: "Play blackjack with the bot.",
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    options: [
        {
            name: "points",
            description: "The amount of pina coladas (or all) to gamble.",
            type: "STRING",
            required: true
        }
    ],
    execute({ client, interaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guildId, user, channel } = interaction;
            let { value: points } = interaction.options.get("points");
            points = points;
            const guildInfo = yield utils_1.getGuildInfo(client, guildId);
            const { gamblingChannel } = guildInfo.gambling;
            if (gamblingChannel) {
                if (channel.id !== gamblingChannel) {
                    return yield interaction.reply({
                        content: `Gambling is only allowed in <#${gamblingChannel}>!`,
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
            if (inProgress) {
                return interaction.reply({
                    content: "A blackjack game is already in progress. Please wait for that one to complete first before starting another game.",
                    ephemeral: true
                });
            }
            gameOver = false; // Reset game status back to false each time command is ran
            playerWon = false; // Reset playerWon status back to false each time command is ran
            inProgress = true; // Make sure only one blackjack game can be played at once
            const actualPoints = yield gambling_1.getPoints(guildId, user.id);
            if (points.toLowerCase() !== "all") {
                if (!utils_1.isValidNumber(points.trim())) {
                    return interaction.reply({
                        content: "Please provide a valid number of pina coladas."
                    });
                }
            }
            let pointsToGamble = utils_1.removeCommas(points.trim());
            if (actualPoints == 0) {
                return interaction.reply({ content: "You don't have any pina coladas to gamble." });
            }
            if (pointsToGamble == "all") {
                pointsToGamble = actualPoints;
            }
            if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
                return interaction.reply({ content: "Please provide a valid number of pina coladas." });
            }
            if (+pointsToGamble < 1) {
                return interaction.reply({ content: "You must gamble at least 1 pina colada!" });
            }
            if (+pointsToGamble > actualPoints) {
                return interaction.reply({
                    content: `You don't have enough pina coladas! You only have ${utils_1.formatNumber(actualPoints)} pina colada${actualPoints !== 1 ? "s" : ""}!`
                });
            }
            return playGame(client, interaction, +pointsToGamble, guildId, user.id, points);
        });
    }
};
const playGame = (client, interaction, pointsToGamble, guildID, userID, text) => __awaiter(void 0, void 0, void 0, function* () {
    deck = createDeck();
    shuffleDeck(deck);
    playerCards = [getNextCard(), getNextCard()];
    dealerCards = [getNextCard(), getNextCard()];
    showStatus();
    const msgEmbed = createEmbed(pointsToGamble);
    const buttons = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton().setCustomId(hit).setLabel(hit).setStyle("SUCCESS"), new discord_js_1.MessageButton().setCustomId(stand).setLabel(stand).setStyle("DANGER"));
    const msg = (yield interaction.reply({
        embeds: [msgEmbed],
        components: [buttons],
        fetchReply: true
    }));
    if (msg) {
        const filter = (i) => {
            i.deferUpdate();
            return (i.customId == hit || i.customId == stand) && i.user.id == userID;
        };
        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: "BUTTON",
            time: 1000 * 20
        });
        collector.on("collect", (i) => {
            if (i.customId == hit) {
                playerCards.push(getNextCard());
                checkForEndOfGame(client, guildID, userID, pointsToGamble);
                showStatus();
                msg.edit({
                    embeds: [editEmbed(msgEmbed, pointsToGamble, text)],
                    components: [buttons]
                });
                if (gameOver) {
                    inProgress = false;
                    collector.stop();
                    msg.edit({
                        components: []
                    });
                }
            }
            else {
                gameOver = true;
                inProgress = false;
                checkForEndOfGame(client, guildID, userID, pointsToGamble);
                showStatus();
                msg.edit({
                    embeds: [editEmbed(msgEmbed, pointsToGamble, text)],
                    components: []
                });
                collector.stop();
            }
        });
        collector.on("end", (_collected, reason) => {
            if (reason === "time") {
                gameOver = true;
                inProgress = false;
                gambling_1.addPoints(guildID, userID, pointsToGamble * -1).then(() => {
                    return msg.edit({
                        content: `<@${userID}>, you did not react in time and have forfeited \`${utils_1.formatNumber(pointsToGamble)}\` point${pointsToGamble != 1 ? "s" : ""}.`,
                        embeds: [editEmbed(msgEmbed, pointsToGamble, text)],
                        components: []
                    });
                });
            }
        });
    }
});
const createDeck = () => {
    let deck = [];
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < suits.length; j++) {
            let weight = +values[i];
            if (values[i] === "K" || values[i] === "Q" || values[i] === "J") {
                weight = 10;
            }
            if (values[i] === "A") {
                weight = 1;
            }
            let card = { value: values[i], suit: suits[j], weight };
            deck.push(card);
        }
    }
    return deck;
};
const shuffleDeck = (deck) => {
    for (let i = 0; i < deck.length; i++) {
        let swapIndex = utils_1.randomRange(0, deck.length - 1);
        let tmp = deck[swapIndex];
        deck[swapIndex] = deck[i];
        deck[i] = tmp;
    }
};
const getNextCard = () => {
    return deck.shift();
};
const getScore = (cardArray) => {
    let score = 0;
    for (let i = 0; i < cardArray.length; i++) {
        let card = cardArray[i];
        score += card.weight;
    }
    return score;
};
const getCardString = (card) => {
    return `\`${card.value} ${card.suit}\``;
};
const updateScores = () => {
    playerPoints = getScore(playerCards);
    dealerPoints = getScore(dealerCards);
};
const showStatus = () => {
    dealerCardString = "";
    for (let i = 0; i < dealerCards.length; i++) {
        dealerCardString += `${getCardString(dealerCards[i])} `;
    }
    playerCardString = "";
    for (let i = 0; i < playerCards.length; i++) {
        playerCardString += `${getCardString(playerCards[i])} `;
    }
    updateScores();
};
const getWinMsg = (pointsGambled, text) => {
    return playerWon
        ? `You won \`${utils_1.formatNumber(pointsGambled)}\` pina colada${pointsGambled != 1 ? "s" : ""}!`
        : `The dealer won and you lost ${text.toLowerCase() === "all" ? "all your" : `\`${utils_1.formatNumber(pointsGambled)}\``} pina colada${pointsGambled != 1 ? "s" : ""}!`;
};
const checkForEndOfGame = (client, guildID, userID, pointsGambled) => {
    updateScores();
    if (gameOver) {
        while (dealerPoints < playerPoints && playerPoints <= 21 && dealerPoints <= 21) {
            dealerCards.push(getNextCard());
            updateScores();
        }
    }
    if (playerPoints > 21) {
        playerWon = false;
        gameOver = true;
    }
    else if (dealerPoints > 21) {
        playerWon = true;
        gameOver = true;
    }
    else if (gameOver) {
        playerWon = playerPoints > dealerPoints ? true : false;
    }
    addRemovePoints(client, guildID, userID, +pointsGambled);
};
const addRemovePoints = (client, guildID, userID, pointsGambled) => __awaiter(void 0, void 0, void 0, function* () {
    if (gameOver) {
        if (!playerWon) {
            yield gambling_1.updateJackpotAmount(client, guildID, Math.ceil(pointsGambled / 2));
        }
        yield gambling_1.addPoints(guildID, userID, playerWon ? pointsGambled : pointsGambled * -1);
    }
});
const createEmbed = (points) => {
    const msgEmbed = new discord_js_1.MessageEmbed()
        .setTitle(`Playing Blackjack for \`${utils_1.formatNumber(points)}\` Point${points !== 1 ? "s" : ""}`)
        .addFields({
        name: "**Your Hand**",
        value: `${playerCardString}\nScore: ${playerPoints}`,
        inline: true
    }, {
        name: `**Dealer's Hand**`,
        value: `${dealerCardString}\nScore: ${dealerPoints}`,
        inline: true
    })
        .setFooter(`${hit} to Hit, ${stand} to Stand`);
    return msgEmbed;
};
const editEmbed = (oldEmbed, pointsGambled, args) => {
    const embed = new discord_js_1.MessageEmbed()
        .setTitle(gameOver ? `Game Over` : `${oldEmbed.title}`)
        .setDescription(gameOver ? getWinMsg(pointsGambled, args) : "")
        .setFooter(gameOver ? "" : `${oldEmbed.footer.text}`)
        .addFields({
        name: `**Your Hand**`,
        value: `${playerCardString}\nScore: ${playerPoints}`,
        inline: true
    }, {
        name: `**Dealer's Hand**`,
        value: `${dealerCardString}\nScore: ${dealerPoints}`,
        inline: true
    });
    return embed;
};
