
// 카드 숫자 및 문자
const RANKS = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

// 카드 무늬
const SUITS = [
    { code: "S", symbol: "♠", color: "black" },
    { code: "H", symbol: "♥", color: "red" },
    { code: "C", symbol: "♣", color: "black" },
    { code: "D", symbol: "♦", color: "red" }
];

// 52장의 카드 생성
function createDeck() {
    const deck = [];

    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                id: rank + suit.code,
                rank: rank,
                suit: suit.code,
                symbol: suit.symbol,
                color: suit.color
            });
        }
    }

    return deck;
}

// Fisher–Yates 셔플
function shuffleDeck(deck) {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // i는 배열이 0부터라서 현재 바꾸려는 카드 위치n에서 1을 뺀 값
        // 즉, i+1 = n이 현재 바꾸려는 카드 위치
        // Math.random() 0이상 1미만의 균등분포된 의사난수
        // Math.random() * (i + 1)은 난수의 범위를 0이상 n-1미만으로 확장함.
        // floor는 소수인 난수를 인덱스 용 정수로 변환하기 위함.
        // i가 아닌 i+1을 쓴 이유는 현재 바꾸려는 카드도 무작위 교체 선택 대상에 포함하기 위함.
        // j===i가 나오면 바꾸려던 카드가 자기 자리에 남아 있는 경우를 뜻한다.
        // j===i===n-1===0부터 시작하는 shuffled 배열에 맞는 현재 위치의 카드.

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
