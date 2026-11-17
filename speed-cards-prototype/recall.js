
// 회상 화면에서 사용할 전체 카드
const recallSourceDeck = createDeck();

// 카드 ID를 이용하여 카드 객체를 찾기 위한 Map
const recallCardMap = new Map(
    recallSourceDeck.map(card => [card.id, card])
);


// 회상 데이터
let recallAnswers = [];

// 현재 선택된 회상 위치
let selectedRecallIndex = 0;

// 회상 입력 칸의 HTML 요소
let recallSlotButtons = [];

// 선택 가능한 카드의 HTML 요소
let recallChoiceButtons = [];


// 회상 화면 초기화
function initializeRecall(deckSize) {

    clearRecallScreen();

    // 모든 회상 위치를 빈 상태로 초기화
    recallAnswers = Array(deckSize).fill(null);

    selectedRecallIndex = 0;

    createRecallSlots();
    createRecallPool();

    updateRecallScreen();
}


// 회상 순서 입력 칸 생성
function createRecallSlots() {

    const slotArea =
        document.getElementById("recall-slots");

    recallAnswers.forEach((answer, index) => {

        const button = document.createElement("button");

        button.classList.add("recall-slot");

        // 카드 순서 번호
        const numberElement = document.createElement("span");

        numberElement.classList.add("slot-number");
        numberElement.textContent = index + 1;

        // 입력한 카드 표시 영역
        const valueElement = document.createElement("span");

        valueElement.classList.add("slot-value");
        valueElement.textContent = "–";

        button.appendChild(numberElement);
        button.appendChild(valueElement);

        // 선택한 입력 위치 변경
        button.addEventListener("click", () => {

            // 회상 시간 초과 여부 확인
            if (!checkRecallTimeLimit()) {
                return;
            }

            selectedRecallIndex = index;

            updateRecallScreen();
        });

        slotArea.appendChild(button);

        recallSlotButtons.push(button);
    });
}


// 선택 가능한 전체 카드 생성
function createRecallPool() {

    const poolArea =
        document.getElementById("recall-pool");

    // 무늬별로 카드를 구분하여 배치
    SUITS.forEach(suit => {

        const row = document.createElement("div");

        row.classList.add("recall-suit-row");

        const suitCards = recallSourceDeck.filter(
            card => card.suit === suit.code
        );

        suitCards.forEach(card => {

            const button =
                document.createElement("button");

            button.classList.add(
                "recall-choice",
                card.color
            );

            const rankElement =
                document.createElement("span");

            rankElement.textContent = card.rank;

            const suitElement =
                document.createElement("span");

            suitElement.textContent = card.symbol;

            button.appendChild(rankElement);
            button.appendChild(suitElement);

            // 카드 선택 이벤트
            button.addEventListener("click", () => {

                selectRecallCard(card.id);
            });

            row.appendChild(button);

            recallChoiceButtons.push({
                id: card.id,
                element: button
            });
        });

        poolArea.appendChild(row);
    });
}


// 선택한 카드를 현재 위치에 입력
function selectRecallCard(cardId) {

    // 회상 시간 초과 여부 확인
    if (!checkRecallTimeLimit()) {
        return;
    }

    // 유효한 회상 위치인지 확인
    if (
        selectedRecallIndex < 0 ||
        selectedRecallIndex >= recallAnswers.length
    ) {
        return;
    }

    // 유효한 카드인지 확인
    if (!recallCardMap.has(cardId)) {
        return;
    }

    // 중복 입력 방지
    if (recallAnswers.includes(cardId)) {
        return;
    }

    // 현재 위치에 선택한 카드 저장
    recallAnswers[selectedRecallIndex] = cardId;

    // 다음 빈 입력 칸 탐색
    moveToNextEmptySlot();

    updateRecallScreen();
}


// 다음 빈 입력 위치로 이동
function moveToNextEmptySlot() {

    for (
        let offset = 1;
        offset <= recallAnswers.length;
        offset++
    ) {

        const nextIndex =
            (selectedRecallIndex + offset)
            % recallAnswers.length;

        if (recallAnswers[nextIndex] === null) {

            selectedRecallIndex = nextIndex;

            return;
        }
    }
}


// 현재 선택한 위치의 카드 삭제
function deleteRecallCard() {

    // 회상 시간 초과 여부 확인
    if (!checkRecallTimeLimit()) {
        return;
    }

    if (recallAnswers.length === 0) {
        return;
    }

    recallAnswers[selectedRecallIndex] = null;

    updateRecallScreen();
}


// 회상 화면 갱신
function updateRecallScreen() {

    // 이미 입력한 카드들의 집합
    const usedCards = new Set(
        recallAnswers.filter(id => id !== null)
    );

    // 회상 입력 칸 갱신
    recallSlotButtons.forEach((button, index) => {

        const cardId = recallAnswers[index];

        const card = recallCardMap.get(cardId);

        const valueElement = button.querySelector(
            ".slot-value"
        );

        valueElement.textContent = card
            ? card.rank + card.symbol
            : "–";

        valueElement.classList.toggle(
            "red",
            card?.color === "red"
        );

        valueElement.classList.toggle(
            "black",
            card?.color === "black"
        );

        button.classList.toggle(
            "selected",
            index === selectedRecallIndex
        );
    });

    // 이미 입력한 카드의 선택 버튼 비활성화
    recallChoiceButtons.forEach(cardButton => {

        cardButton.element.disabled =
            usedCards.has(cardButton.id);
    });

    // 현재 입력한 카드 수 표시
    document.getElementById("recall-count").textContent =
        `입력한 카드: ${usedCards.size} / ${recallAnswers.length}`;

    // 현재 선택 위치 표시
    document.getElementById("selected-position").textContent =
        `현재 선택 위치: ${selectedRecallIndex + 1}번`;

    // 선택 위치가 비어 있으면 삭제 버튼 비활성화
    document.getElementById("recall-delete").disabled =
        recallAnswers[selectedRecallIndex] === null;
}


// 회상 결과 반환
function getRecallAnswers() {

    return [...recallAnswers];
}


// 회상 데이터 및 화면 초기화
function clearRecallScreen() {

    recallAnswers = [];

    selectedRecallIndex = 0;

    recallSlotButtons = [];
    recallChoiceButtons = [];

    document.getElementById(
        "recall-slots"
    ).replaceChildren();

    document.getElementById(
        "recall-pool"
    ).replaceChildren();
}


// 카드 삭제 버튼 이벤트
document.getElementById(
    "recall-delete"
).addEventListener(
    "click",
    deleteRecallCard
);
