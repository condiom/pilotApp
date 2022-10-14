const cardSuits = ["hearts", "diamonds", "spades", "clubs"];
const cardValues = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const cardSuitsOrder = ["hearts", "spades", "diamonds", "clubs"];
const cardValsOrder = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const cardPowerKozia = ["7", "8", "Q", "K", "10", "A", "9", "J"];
const koziPoints = [0, 0, 3, 4, 10, 11, 14, 20];
const cardPowerNormal = ["7", "8", "9", "J", "Q", "K", "10", "A"];
const normalPoints = [0, 0, 0, 2, 3, 4, 10, 11];
const PLAYERS_NUM = 4;
const NO_SUIT_CODE = -1;
const NO_NUM_CODE = -1;
const NO_TEAM_CODE = -1;
var lastPaza = -1;
var currentPlayerTurn = -1;
var currentPot = [];
var currentKozi = "hearts";
var currentSuit = "hearts";
var round = 0;
var players = [];
var currentSelectedAnimaSuit = NO_SUIT_CODE;
var currentSelectedAnimaNum = NO_NUM_CODE;
var currentStrongestAnimaSuit = NO_SUIT_CODE;
var currentStrongestAnimaNum = NO_NUM_CODE;
var currentStrongestAnimaTeam = NO_TEAM_CODE;
var currentPass = 0;

var debug = {
    seeAllCards: false
}
function renderCard(val, suit, position, total, player, played, disabled) {
    if (val != -1) {
        val = cardValues.indexOf(val) + 5;
        suit = cardSuits.indexOf(suit);
    }
    else {
        val = 0;
        suit = 4;
    }
    if (played) {
        $(`.player${player + 1}`).append(`
            <div class="card played" style="--cardCol: ${val};--cardRow: ${suit};"></div>
        `);
    }
    else {
        $(`.player${player + 1}`).append(`
            <div class="card${disabled ? " disabled" : ""}"${disabled ? "" : ` onclick="cardSelected(${player}, ${position})"`} style="--cardCol: ${val};--cardRow: ${suit};--position: ${position};--total: ${total};"></div>
        `);

    }
}

function cardSelected(player, position) {
    if (player == currentPlayerTurn) {
        var playedCard = players[currentPlayerTurn].cards.splice(position, 1)[0];
        currentPot.push({ player, playedCard });
        if (currentPot.length == PLAYERS_NUM) {
            var winner = findWinner();
            for (let i = 0; i < PLAYERS_NUM; i++) {
                players[winner % 2].cardsWon.push(currentPot[i].playedCard);
            }
            currentPlayerTurn = winner;
            currentPlayerTurn--;
            currentPlayerTurn = currentPlayerTurn < 0 ? 3 : currentPlayerTurn;
            currentPot = [];
            round++;
            if (round == 8) {
                lastPaza = winner % 2;
            }
            calculatePoints();
            currentSuit = NO_SUIT_CODE;
        }
        else if (currentPot.length == 1) {
            currentSuit = playedCard.suit;
            $(`.card.played`).remove();
        }
        renderCard(playedCard.val, playedCard.suit, 0, 0, player, true, false);
        nextPlayer();
    }
}

function calculatePoints() {
    for (let i = 0; i < 2; i++) {
        var points = 0;
        for (let j = 0; j < players[i].cardsWon.length; j++) {
            var card = players[i].cardsWon[j];
            if (card.suit == currentKozi) {
                points += koziPoints[cardPowerKozia.indexOf(card.val)];
            } else {
                points += normalPoints[cardPowerNormal.indexOf(card.val)];
            }
        }
        if (lastPaza == i) {
            points += 10;
        }
        players[i].points = points;
    }
    console.log("Round", round);
    console.log("Team 1", players[0].points);
    console.log("Team 2", players[1].points);
}
function findWinner() {
    currentPot.sort((a, b) => {
        a = a.playedCard;
        b = b.playedCard;
        if (a.suit == currentKozi && b.suit != currentKozi) {
            return 1;
        }
        if (b.suit == currentKozi && a.suit != currentKozi) {
            return -1;
        }
        if (a.suit == currentSuit && b.suit != currentSuit) {
            return 1;
        }
        if (b.suit == currentSuit && a.suit != currentSuit) {
            return -1;
        }
        if (a.suit == currentKozi) {
            return cardPowerKozia.indexOf(a.val) - cardPowerKozia.indexOf(b.val);
        }
        else {
            return cardPowerNormal.indexOf(a.val) - cardPowerNormal.indexOf(b.val);
        }
    });
    // console.log(currentSuit);
    // for (let i = 0; i < PLAYERS_NUM; i++) {
    //     console.log(currentPot[3-i].player, currentPot[3-i].playedCard);
    // }
    var winner = currentPot[3].player;
    console.log("Winner is: " + winner);
    return winner;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function createDeck() {
    var cards = [];
    for (var i = 0; i < cardSuits.length; i++) {
        for (var j = 0; j < cardValues.length; j++) {
            var val = cardValues[j];
            var suit = cardSuits[i];
            cards.push({
                val: val,
                suit: suit,
            });
        }
    }
    shuffle(cards);
    return cards;
}

function renderCards() {
    $(".card:not(.played)").remove();
    for (let i = 0; i < PLAYERS_NUM; i++) {
        var hasKozi = false;
        var hasMorePowerKozi = false;
        var hasCurrent = false;
        var playedKozia = currentPot.filter((a) => {
            return a.playedCard.suit == currentKozi;
        });
        playedKozia = playedKozia.sort((a, b) => {
            return cardPowerKozia.indexOf(b.suit) - cardPowerKozia.indexOf(a.suit);
        });

        for (let j = 0; j < players[i].cards.length; j++) {
            var card = players[i].cards[j];
            if (card.suit == currentKozi) {
                hasKozi = true;
            }
            if (card.suit == currentSuit) {
                hasCurrent = true;
            }
            if (card.suit == currentKozi && playedKozia.length > 0 && cardPowerKozia.indexOf(card.val) > cardPowerKozia.indexOf(playedKozia[0].playedCard.val)) {
                hasMorePowerKozi = true;
            };

        }
        for (let j = 0; j < players[i].cards.length; j++) {
            if (debug.seeAllCards || i == currentPlayerTurn) {
                var card = players[i].cards[j];
                var disabled = false;
                if (currentSuit != NO_SUIT_CODE) {
                    if (card.suit != currentSuit) {
                        disabled = true;
                        if (!hasCurrent && card.suit == currentKozi) {
                            disabled = false;
                        }
                        if (!hasCurrent && !hasKozi) {
                            disabled = false;
                        }
                    }
                    if (card.suit == currentKozi && !disabled && hasMorePowerKozi) {
                        playedKozia = currentPot.filter((a) => {
                            return a.playedCard.suit == currentKozi;
                        });
                        for (let k = 0; k < playedKozia.length; k++) {
                            if (cardPowerKozia.indexOf(card.val) < cardPowerKozia.indexOf(playedKozia[k].playedCard.val)) {
                                disabled = true;
                            }
                        }
                    }
                }
                renderCard(card.val, card.suit, j, players[i].cards.length, i, false, disabled);
            } else {
                renderCard(-1, 0, j, players[0].cards.length, i, false, false);
            }
        }
    }
}

function nextPlayer() {
    currentPlayerTurn++;
    if (currentPlayerTurn == PLAYERS_NUM) {
        currentPlayerTurn = 0;
    }
    renderCards();
}

function newRound() {
    $(".anima .nums").html("");
    for (let i = 8; i < 65; i++) {
        $(".anima .nums").append(`
            <div class="num num-${i}"  onclick="numSelected('${i}', this)">${i}</div>
        `);
    }
    round = 0;
    currentSuit = NO_SUIT_CODE
    currentSelectedAnimaSuit = NO_SUIT_CODE;
    currentSelectedAnimaNum = NO_NUM_CODE;
    currentStrongestAnimaSuit = NO_SUIT_CODE;
    currentStrongestAnimaNum = NO_NUM_CODE;
    currentStrongestAnimaTeam = NO_TEAM_CODE;
    for (let i = 0; i < PLAYERS_NUM; i++) {
        players[i].cards = [];
        players[i].cardsWon = [];
    }
    deck = createDeck();
    for (let i = 0; i < deck.length; i++) {
        players[i % PLAYERS_NUM].cards.push(deck[i]);
    }
    for (let i = 0; i < PLAYERS_NUM; i++) {
        players[i].cards = players[i].cards.sort((a, b) => {
            if (a.suit == b.suit) {
                return cardValsOrder.indexOf(a.val) - cardValsOrder.indexOf(b.val);
            }
            return cardSuitsOrder.indexOf(a.suit) - cardSuitsOrder.indexOf(b.suit);
        });
    }
    $(`.anima`).show();
    $(`.card.played`).remove();
    nextPlayerAnima();
}

function nextPlayerAnima(){
    currentSelectedAnimaSuit = NO_SUIT_CODE;
    currentSelectedAnimaNum = NO_NUM_CODE;
    currentPlayerTurn++;
    if (currentPlayerTurn == PLAYERS_NUM) {
        currentPlayerTurn = 0;
    }
    $(".actions .action.open").addClass("disabled"); 
    numSelected(NO_NUM_CODE, this);
    suitSelected(NO_SUIT_CODE, this);
    renderCards();
}

function passAnima(){
    currentPass++;
    if(currentStrongestAnimaSuit != NO_SUIT_CODE && currentPass == 3){
        currentPass = 0;
        currentKozi = currentStrongestAnimaSuit;
        console.log(currentStrongestAnimaNum, currentStrongestAnimaSuit);
        $(".anima").hide();
        $(`.player .animaAction`).remove();
        return;
    }
    $(`.player${currentPlayerTurn + 1}`).append(`
        <div class="animaAction pass"><span>Pass</span></div>
    `);
    $(`.player${((currentPlayerTurn + 1) % 4) + 1} .animaAction`).remove();
    if(currentStrongestAnimaSuit == NO_SUIT_CODE && currentPass == 4){
        currentPass = 0;
        $(`.player .animaAction`).remove();
        newRound();
    }
    nextPlayerAnima();
}

function openAnima(){
    currentPass = 0;
    currentStrongestAnimaSuit = currentSelectedAnimaSuit;
    currentStrongestAnimaNum = parseInt(currentSelectedAnimaNum);
    
    currentSelectedAnimaSuit = NO_SUIT_CODE;
    currentSelectedAnimaNum = NO_NUM_CODE;
    
    currentStrongestAnimaTeam = currentPlayerTurn % 2;
    $(`.player${currentPlayerTurn + 1}`).append(`
        <div class="animaAction open ${currentStrongestAnimaSuit}"><span>${currentStrongestAnimaNum}</span></div>
    `);
    $(`.player${((currentPlayerTurn + 1) % 4) + 1} .animaAction`).remove();

    nextPlayerAnima();
}

function suitSelected(suit, e) {
    $(".anima .suit").removeClass("selected");
    if(suit == NO_SUIT_CODE){
        return;
    }
    currentSelectedAnimaSuit = suit;
    $(e).addClass("selected");
    if(currentSelectedAnimaNum != NO_NUM_CODE){
        $(".actions .action.open").removeClass("disabled");
    }
}

function numSelected(num, e) {
    if(num == NO_NUM_CODE){
        num = currentStrongestAnimaNum >= 8 ? currentStrongestAnimaNum + 1 : 8;
        e = $(`.anima .num-${num}`);
        for(var i = 8; i <= currentStrongestAnimaNum; i++){
            $(`.anima .num-${i}`).remove();
        }
    }
    currentSelectedAnimaNum = num;
    $(".anima .num").removeClass("selected");
    $(e).addClass("selected");
    if(currentSelectedAnimaSuit != NO_SUIT_CODE){
        $(".actions .action.open").removeClass("disabled");
    }
}

$(document).ready(function () {
    for (let i = 0; i < PLAYERS_NUM; i++) {
        players[i] = {
            name: "Player " + (i + 1)
        };
    }
    newRound();
    // currentSelectedAnimaSuit = cardSuits[0];
    // currentSelectedAnimaNum = 8;
    // openAnima();
    // currentSelectedAnimaSuit = cardSuits[1];
    // currentSelectedAnimaNum = 9;
    // openAnima();
    // currentSelectedAnimaSuit = cardSuits[2];
    // currentStrongestAnimaNum = 10;
    // openAnima();
    // currentSelectedAnimaSuit = cardSuits[3];
    // currentSelectedAnimaNum = 11;
    // openAnima();
    // currentSelectedAnimaSuit = cardSuits[0];
    // currentSelectedAnimaNum = 11;
    // // openAnima();
    // // cardSelected(0, 0);
    // cardSelected(1, 0);
    // cardSelected(2, 0);
    // cardSelected(3, 0);
});