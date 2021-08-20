import { SlashCommand } from "../../interfaces/SlashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    getGuildInfo,
    formatNumber,
    randomRange,
    isValidNumber,
    removeCommas
} from "../../utils/utils";
import Card from "../../interfaces/Card";
import { getPoints, addPoints, updateJackpotAmount } from "../../utils/gambling";
import { Client } from "../../Client";
import {
    ButtonInteraction,
    CommandInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Snowflake
} from "discord.js";

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
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play blackjack with the bot.")
        .addStringOption((option) =>
            option
                .setName("points")
                .setDescription("The amount of pina coladas (or all) to gamble.")
                .setRequired(true)
        ),
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    async execute({ client, interaction }) {
        const { guildId, user, channel } = interaction;
        const points = interaction.options.getString("points")!;

        const guildInfo = await getGuildInfo(client, guildId!);
        const { gamblingChannel } = guildInfo.gambling;
        if (gamblingChannel) {
            if (channel!.id !== gamblingChannel) {
                return await interaction.reply({
                    content: `Gambling is only allowed in <#${gamblingChannel}>!`,
                    ephemeral: true
                });
            }
        } else {
            return await interaction.reply({
                content:
                    "A gambling channel needs to be set first in order for this command to be used.",
                ephemeral: true
            });
        }

        if (inProgress) {
            return interaction.reply({
                content:
                    "A blackjack game is already in progress. Please wait for that one to complete first before starting another game.",
                ephemeral: true
            });
        }

        gameOver = false; // Reset game status back to false each time command is ran
        playerWon = false; // Reset playerWon status back to false each time command is ran
        inProgress = true; // Make sure only one blackjack game can be played at once

        const actualPoints = await getPoints(guildId!, user.id);
        if (points.toLowerCase() !== "all") {
            if (!isValidNumber(points.trim())) {
                return interaction.reply({
                    content: "Please provide a valid number of pina coladas."
                });
            }
        }

        let pointsToGamble = removeCommas(points.trim());
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
                content: `You don't have enough pina coladas! You only have ${formatNumber(
                    actualPoints
                )} pina colada${actualPoints !== 1 ? "s" : ""}!`
            });
        }

        return playGame(client, interaction, +pointsToGamble, guildId!, user.id, points);
    }
} as SlashCommand;

const playGame = async (
    client: Client,
    interaction: CommandInteraction,
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

    const msg = (await interaction.reply({
        embeds: [msgEmbed],
        components: [buttons],
        fetchReply: true
    })) as Message;

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
