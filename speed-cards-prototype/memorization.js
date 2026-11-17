
// 개별 카드의 HTML 요소 생성
function createCardElement(card, zIndex) {

    const cardElement = document.createElement("div");

    cardElement.classList.add(
        "playing-card",
        card.color
    );

    cardElement.style.zIndex = zIndex;

    // 오른쪽 상단의 숫자와 무늬
    const indexElement = document.createElement("div");
    indexElement.classList.add("card-index");

    const rankElement = document.createElement("span");
    rankElement.textContent = card.rank;

    const suitElement = document.createElement("span");
    suitElement.textContent = card.symbol;

    indexElement.appendChild(rankElement);
    indexElement.appendChild(suitElement);

    // 카드 중앙의 무늬
    const centerElement = document.createElement("div");
    centerElement.classList.add("card-center");

    centerElement.textContent = card.symbol;

    // 완성된 카드 구성
    cardElement.appendChild(indexElement);
    cardElement.appendChild(centerElement);

    return cardElement;
}


// 현재 위치에 해당하는 카드들을 화면에 표시
function renderMemorizationCards(
    deck,
    startIndex,
    visibleCount
) {

    const cardArea = document.getElementById("card-area");

    // 기존 카드 제거
    cardArea.replaceChildren();

    // 현재 화면에 표시할 카드 추출
    const visibleCards = deck.slice(
        startIndex,
        startIndex + visibleCount
    );

    // 카드 생성 및 화면 배치
    visibleCards.forEach((card, index) => {

        const cardElement = createCardElement(
            card,
            visibleCards.length - index
        );

        cardArea.appendChild(cardElement);
    });

    // 카드 위치 표시
    const endPosition = startIndex + visibleCards.length;

    document.getElementById("position-info").textContent =
        `현재 표시: ${startIndex + 1}~${endPosition} / ${deck.length}`;
}


// 화면에 표시된 카드 제거
function clearMemorizationCards() {
    document.getElementById("card-area").replaceChildren();
}
