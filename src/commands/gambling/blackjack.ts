import { Command } from "../../interfaces/Command";
import { addPoints, getPoints, updateJackpotAmount } from "../../utils/gambling";
import {
    getGuildInfo,
    randomRange,
    formatNumber,
    removeCommas,
    isValidNumber
} from "../../utils/utils";
import Card from "../../interfaces/Card";
import {
    Message,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Snowflake,
    ButtonInteraction
} from "discord.js";
import { Client } from "../../Client";

const suits = ["♥", "♠", "♦", "♣"];
const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "K", "Q", "J"];
const hit = "👍";
const stand = "👎";

let deck: Card[] = [],
    playerCards: Card[] = [],
    playerPoints = 0,
    playerCardString = "",
    dealerCards: Card[] = [],
    dealerCardString = "",
    dealerPoints = 0,
    gameOver: boolean,
    playerWon: boolean,
    inProgress = false;

export default {
    name: "blackjack",
    category: "Gambling",
    clientPerms: ["SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS"],
    arguments: [
        {
            type: "SOMETHING",
            prompt: "Please enter an amount (or all) to gamble."
        }
    ],
    async execute({ client, message, args }) {
        const { author, channel, guild } = message;
        const guildInfo = await getGuildInfo(client, guild!.id);
        const gamblingChannel = guildInfo.gambling.gamblingChannel;

        if (gamblingChannel) {
            if (channel.id !== gamblingChannel) {
                const msg = await message.reply({
                    content: `Blackjack can only be played in <#${gamblingChannel}>!`
                });
                setTimeout(() => {
                    msg.delete();
                }, 1000 * 3);
                return message.delete();
            }
        } else {
            const msg = await message.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used."
            });
            setTimeout(() => {
                msg.delete();
            }, 1000 * 3);
            return message.delete();
        }

        if (inProgress) {
            return message.reply({
                content:
                    "A blackjack game is already in progress. Please wait for that one to complete first before starting another game."
            });
        }

        gameOver = false; // Reset game status back to false each time command is ran
        playerWon = false; // Reset playerWon status back to false each time command is ran
        inProgress = true; // Make sure only one blackjack game can be played at once

        const actualPoints = await getPoints(guild!.id, author.id);
        if (args[0].toLowerCase() !== "all") {
            if (!isValidNumber(args[0].trim())) {
                return message.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
        }

        let pointsToGamble = removeCommas(args[0].trim());
        if (actualPoints == 0) {
            return message.reply({ content: "You don't have any pina coladas to gamble." });
        }

        if (pointsToGamble == "all") {
            pointsToGamble = actualPoints;
        }

        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (+pointsToGamble < 1) {
            return message.reply({ content: "You must gamble at least 1 pina colada!" });
        }

        if (+pointsToGamble > actualPoints) {
            return message.reply({
                content: `You don't have enough pina coladas! You only have ${formatNumber(
                    actualPoints
                )} pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }
        return playGame(client, message, +pointsToGamble, guild!.id, author.id, args[0]);
    }
} as Command;

const playGame = async (
    client: Client,
    message: Message,
    pointsToGamble: number,
    guildID: Snowflake,
    userID: Snowflake,
    text: string
) => {
    deck = createDeck();
    shuffleDeck(deck);
    playerCards = [getNextCard()!, getNextCard()!];
    dealerCards = [getNextCard()!, getNextCard()!];
    showStatus();

    const msgEmbed = createEmbed(pointsToGamble);
    const buttons = new MessageActionRow().addComponents(
        new MessageButton().setCustomId(hit).setLabel(hit).setStyle("SUCCESS"),
        new MessageButton().setCustomId(stand).setLabel(stand).setStyle("DANGER")
    );

    const msg = await message.channel.send({
        embeds: [msgEmbed],
        components: [buttons]
    });
    if (msg) {
        const filter = (i: ButtonInteraction) => {
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
                playerCards.push(getNextCard()!);
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
            } else {
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
                addPoints(guildID, userID, pointsToGamble * -1).then(() => {
                    return msg.edit({
                        content: `<@${userID}>, you did not react in time and have forfeited \`${formatNumber(
                            pointsToGamble
                        )}\` point${pointsToGamble != 1 ? "s" : ""}.`,
                        embeds: [editEmbed(msgEmbed, pointsToGamble, text)],
                        components: []
                    });
                });
            }
        });
    }
};

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

const shuffleDeck = (deck: Card[]) => {
    for (let i = 0; i < deck.length; i++) {
        let swapIndex = randomRange(0, deck.length - 1);
        let tmp = deck[swapIndex];

        deck[swapIndex] = deck[i];
        deck[i] = tmp;
    }
};

const getNextCard = () => {
    return deck.shift();
};

const getScore = (cardArray: Card[]) => {
    let score = 0;

    for (let i = 0; i < cardArray.length; i++) {
        let card = cardArray[i];
        score += card.weight;
    }
    return score;
};

const getCardString = (card: Card) => {
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

const getWinMsg = (pointsGambled: number, text: string) => {
    return playerWon
        ? `You won \`${formatNumber(pointsGambled)}\` pina colada${pointsGambled != 1 ? "s" : ""}!`
        : `The dealer won and you lost ${
              text.toLowerCase() === "all" ? "all your" : `\`${formatNumber(pointsGambled)}\``
          } pina colada${pointsGambled != 1 ? "s" : ""}!`;
};

const checkForEndOfGame = (
    client: Client,
    guildID: Snowflake,
    userID: Snowflake,
    pointsGambled: number
) => {
    updateScores();
    if (gameOver) {
        while (dealerPoints < playerPoints && playerPoints <= 21 && dealerPoints <= 21) {
            dealerCards.push(getNextCard()!);
            updateScores();
        }
    }

    if (playerPoints > 21) {
        playerWon = false;
        gameOver = true;
    } else if (dealerPoints > 21) {
        playerWon = true;
        gameOver = true;
    } else if (gameOver) {
        playerWon = playerPoints > dealerPoints ? true : false;
    }

    addRemovePoints(client, guildID!, userID, +pointsGambled);
};

const addRemovePoints = async (
    client: Client,
    guildID: Snowflake,
    userID: Snowflake,
    pointsGambled: number
) => {
    if (gameOver) {
        if (!playerWon) {
            await updateJackpotAmount(client, guildID!, Math.ceil(pointsGambled / 2));
        }
        await addPoints(guildID!, userID, playerWon ? pointsGambled : pointsGambled * -1);
    }
};

const createEmbed = (points: number) => {
    const msgEmbed = new MessageEmbed()
        .setTitle(
            `Playing Blackjack for \`${formatNumber(points)}\` Point${points !== 1 ? "s" : ""}`
        )
        .addFields(
            {
                name: "**Your Hand**",
                value: `${playerCardString}\nScore: ${playerPoints}`,
                inline: true
            },
            {
                name: `**Dealer's Hand**`,
                value: `${dealerCardString}\nScore: ${dealerPoints}`,
                inline: true
            }
        )
        .setFooter(`${hit} to Hit, ${stand} to Stand`);
    return msgEmbed;
};

const editEmbed = (oldEmbed: MessageEmbed, pointsGambled: number, args: string) => {
    const embed = new MessageEmbed()
        .setTitle(gameOver ? `Game Over` : `${oldEmbed.title}`)
        .setDescription(gameOver ? getWinMsg(pointsGambled, args) : "")
        .setFooter(gameOver ? "" : `${oldEmbed.footer!.text}`)
        .addFields(
            {
                name: `**Your Hand**`,
                value: `${playerCardString}\nScore: ${playerPoints}`,
                inline: true
            },
            {
                name: `**Dealer's Hand**`,
                value: `${dealerCardString}\nScore: ${dealerPoints}`,
                inline: true
            }
        );
    return embed;
};
