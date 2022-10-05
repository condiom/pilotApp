const cardSuits = ["hearts", "diamonds", "spades", "clubs"];
const cardValues = ["7", "8", "9", "10", "J", "Q", "K", "A"];

function renderCard(val, suit, position, total, player) {
    if (val != -1) {
        val = cardValues.indexOf(val) + 5;
        suit = cardSuits.indexOf(suit);
    }
    else {
        val = 0;
        suit = 4;
    }
    $(`.player${player + 1}`).append(`
        <div class="card" style="--cardCol: ${val};--cardRow: ${suit};--position: ${position};--total: ${total};"></div>
    `);
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
    $(".card").remove();
    for (let i = 0; i < players[0].cards.length; i++) {
        renderCard(players[0].cards[i].val, players[0].cards[i].suit, i, players[0].cards.length, 0);
    }
    for (let i = 1; i < 4; i++) {
        for (let j = 0; j < players[i].cards.length; j++) {
            renderCard(-1, 0, j, players[0].cards.length, i);
        }
    }
}

function newRound() {
    for (let i = 0; i < 4; i++) {
        players[i].cards = [];
    }
    deck = createDeck();
    for (let i = 0; i < deck.length; i++) {
        players[i % 4].cards.push(deck[i]);
    }
    renderCards();
}
var players = [];
$(document).ready(function () {
    for (let i = 0; i < 4; i++) {
        players[i] = {
            name: "Player " + (i + 1)
        };
    }
    newRound();
});