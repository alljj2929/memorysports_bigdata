
// // 기본 카드 덱 생성
// const originalDeck = createDeck();

// // 카드 무작위 배열 생성
// const shuffledDeck = shuffleDeck(originalDeck);

// // 카드 개수 및 중복 검증
// const uniqueCards = new Set(
//     shuffledDeck.map(card => card.id)
// );

// const isValid =
//     shuffledDeck.length === 52 &&
//     uniqueCards.size === 52;

// // 콘솔에 결과 출력
// console.log("원본 카드 배열:", originalDeck);
// console.log("셔플된 카드 배열:", shuffledDeck);

// // console.table(shuffledDeck);

// // console.log("전체 카드 수:", shuffledDeck.length);
// console.log("고유 카드 수:", uniqueCards.size);
// console.log("카드 무결성 검증:", isValid);

// // 웹페이지에 결과 표시
// document.getElementById("status").textContent =
//     isValid
//         ? "52장의 카드가 정상적으로 생성되었습니다."
//         : "카드 생성 과정에서 오류가 발생했습니다.";



// 암기 제한 시간: 5분
// const MEMORIZATION_LIMIT_MS = 5 * 60 * 1000;
// 개발 테스트용 짧은 시간 코드
const MEMORIZATION_LIMIT_MS = 20 * 1000;

// 회상 제한 시간: 5분
// const RECALL_LIMIT_MS = 5 * 60 * 1000;
// 개발 테스트용 짧은 시간 코드
const RECALL_LIMIT_MS = 20 * 1000;

// 프로그램 진행 상태
let phase = "ready";

let activeDeck = [];
let startIndex = 0;
let visibleCount = 3;

let timer = null;
let memorizationResult = null;
let recallResult = null;
let scoringResult = null;

let wasHidden = false;

// 회상 타이머
let recallTimer = null;

// 회상 중 페이지 이탈 여부
let recallWasHidden = false;


// HTML 요소 가져오기
const statusElement = document.getElementById("status");
const timerElement = document.getElementById("timer");
const positionElement = document.getElementById("position-info");
const timerLabelElement =
    document.getElementById("timer-label");

const visibleCountSelect =
    document.getElementById("visible-count");

const startButton = document.getElementById("start-button");
const finishButton = document.getElementById("finish-button");
const resetButton = document.getElementById("reset-button");

const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

const recallSection =
    document.getElementById("recall-section");

const recallStartButton =
    document.getElementById("recall-start-button");

const recallSubmitButton =
    document.getElementById("recall-submit-button");

const resultSection =
    document.getElementById("result-section");


// 프로그램 상태에 따른 버튼 및 화면 변경
function updateControls() {

    startButton.hidden = phase !== "ready";

    finishButton.hidden = phase !== "memorizing";

    recallStartButton.hidden =
        phase !== "recall-ready";

    recallSubmitButton.hidden =
        phase !== "recalling";

    resetButton.hidden = phase !== "finished";

    visibleCountSelect.disabled =
        phase !== "ready";

    prevButton.disabled =
        phase !== "memorizing" ||
        startIndex === 0;

    nextButton.disabled =
        phase !== "memorizing" ||
        startIndex >= activeDeck.length - 1;

    // 회상 화면은 회상 진행 중에만 표시
    recallSection.hidden = phase !== "recalling";

    // 암기 카드 영역 표시 여부
    document.getElementById("card-area").hidden =
        phase !== "ready" &&
        phase !== "memorizing";

    // 암기 카드 이동 버튼 영역
    prevButton.parentElement.hidden =
        phase !== "ready" &&
        phase !== "memorizing";

    // 전체 시행 종료 후에만 타이머 숨김
    document.querySelector(".timer-section").hidden =
        phase === "finished";

    // 현재 단계에 따라 타이머 제목 변경
    timerLabelElement.textContent =
        phase === "recalling"
            ? "남은 회상 시간"
            : "남은 암기 시간";

    // 전체 시행 종료 후 채점 결과 표시
    resultSection.hidden =
        phase !== "finished" ||
        scoringResult === null;
}



// 암기 카드 화면 갱신
function updateCards() {

    renderMemorizationCards(
        activeDeck,
        startIndex,
        visibleCount
    );

    // 개발용 현재 표시 카드 확인
    // console.log(
    //     "현재 표시 카드:",
    //     activeDeck
    //         .slice(startIndex, startIndex + visibleCount)
    //         .map(card => card.id)
    // );

    updateControls();
}


// 암기 시작
function startMemorization() {

    if (phase !== "ready") {
        return;
    }

    // 새로운 무작위 카드 배열 생성
    activeDeck = shuffleDeck(createDeck());

    // 개발용 실제 셔플 배열 확인
    // console.clear();
    // console.log("현재 암기에 사용되는 카드 배열:");
    // console.table(activeDeck);

    startIndex = 0;
    visibleCount = Number(visibleCountSelect.value);

    wasHidden = false;
    memorizationResult = null;

    phase = "memorizing";

    statusElement.textContent = "카드를 암기하세요.";

    // 카드 화면 표시
    updateCards();

    // 타이머 생성
    timer = createTimer(

        MEMORIZATION_LIMIT_MS,

        // 화면 갱신
        remaining => {
            timerElement.textContent =
                formatRemaining(remaining);
        },

        // 시간 초과 처리
        () => {
            finishMemorization("timeout");
        }
    );

    timer.start();
}


// 암기 시간 초과 여부 확인
function checkTimeLimit() {

    if (phase !== "memorizing") {
        return false;
    }

    if (timer.getElapsed() >= MEMORIZATION_LIMIT_MS) {

        finishMemorization("timeout");

        return false;
    }

    return true;
}


// 이전 또는 다음 카드로 이동
function moveCards(direction) {

    if (!checkTimeLimit()) {
        return;
    }

    const nextIndex = startIndex + direction;

    if (
        nextIndex >= 0 &&
        nextIndex < activeDeck.length
    ) {
        startIndex = nextIndex;

        updateCards();
    }
}


// 암기 종료
function finishMemorization(reason = "manual") {

    if (phase !== "memorizing") {
        return;
    }

    // 타이머 종료 및 실제 경과 시간 획득
    const elapsed = timer.stop();

    if (elapsed >= MEMORIZATION_LIMIT_MS) {
        reason = "timeout";
    }

    // 암기 결과 임시 저장
    memorizationResult = {
        deck_size: activeDeck.length,
        visible_card_count: visibleCount,
        memorization_limit_ms: MEMORIZATION_LIMIT_MS,
        memorization_time_ms: elapsed,
        memorization_end_reason: reason,
        page_hidden_during_memorization: wasHidden
    };

    phase = "recall-ready";

    // 암기 카드 제거
    clearMemorizationCards();

    timerElement.textContent = formatRemaining(
        MEMORIZATION_LIMIT_MS - elapsed
    );

    if (reason === "timeout") {
        statusElement.textContent =
            "제한 시간이 초과되었습니다.";
    } else {
        statusElement.textContent =
            "암기가 종료되었습니다.";
    }

    // 실제 암기 시간 표시
    positionElement.textContent =
        `암기 시간: ${(elapsed / 1000).toFixed(3)}초`;

    if (wasHidden) {
        statusElement.textContent +=
            " (암기 중 페이지 이탈 감지)";
    }

    updateControls();

    console.log("암기 결과:", memorizationResult);
}


// 회상 시작
function startRecall() {

    if (phase !== "recall-ready") {
        return;
    }

    // 회상 데이터 및 화면 초기화
    initializeRecall(activeDeck.length);

    // 회상 관련 변수 초기화
    recallWasHidden = document.hidden;
    recallResult = null;

    phase = "recalling";

    statusElement.textContent =
        "기억한 카드의 순서를 입력하세요.";

    positionElement.textContent = "";

    // 회상 타이머 생성
    recallTimer = createTimer(

        RECALL_LIMIT_MS,

        // 타이머 화면 갱신
        remaining => {
            timerElement.textContent =
                formatRemaining(remaining);
        },

        // 시간 초과 시 자동 제출
        () => {
            finishRecall("timeout");
        }
    );

    updateControls();

    // 회상 타이머 시작
    recallTimer.start();
}


// 회상 시간 초과 여부 확인
function checkRecallTimeLimit() {

    if (phase !== "recalling") {
        return false;
    }

    if (recallTimer.getElapsed() >= RECALL_LIMIT_MS) {

        finishRecall("timeout");

        return false;
    }

    return true;
}



// 회상 종료
function finishRecall(reason = "manual") {

    if (phase !== "recalling") {
        return;
    }

    // 타이머 종료 및 경과 시간 획득
    const elapsed = recallTimer.stop();

    // 제한 시간에 도달한 경우
    if (elapsed >= RECALL_LIMIT_MS) {
        reason = "timeout";
    }

    // 사용자가 입력한 회상 배열
    const answers = getRecallAnswers();

    // 입력한 카드 수 계산
    const answeredCount = answers.filter(
        cardId => cardId !== null
    ).length;

    // 회상 결과 임시 저장
    recallResult = {

        recalled_cards: answers,

        answered_count: answeredCount,

        unanswered_count:
            answers.length - answeredCount,

        recall_limit_ms: RECALL_LIMIT_MS,

        recall_time_ms: elapsed,

        recall_end_reason: reason,

        page_hidden_during_recall: recallWasHidden
    };

    // 자동 채점
    scoringResult = scoreRecall(
        activeDeck,
        answers
    );

    phase = "finished";

    // 종료 사유 표시
    if (reason === "timeout") {

        statusElement.textContent =
            "회상 제한 시간이 초과되었습니다.";

    } else {

        statusElement.textContent =
            "회상 입력이 종료되었습니다.";
    }

    // 페이지 이탈 여부 표시
    if (recallWasHidden) {

        statusElement.textContent +=
            " (회상 중 페이지 이탈 감지)";
    }

    // 회상 결과 표시
    positionElement.textContent =
        `입력한 카드: ${answeredCount} / ${answers.length}` +
        ` | 회상 시간: ${(elapsed / 1000).toFixed(3)}초`;

    // 채점 결과 화면 생성
    renderScoringResult(
        scoringResult,
        memorizationResult,
        recallResult
    );

    updateControls();

    console.log("회상 결과:", recallResult);
    console.log("채점 결과:", scoringResult);
}




// 초기 상태로 복귀
function resetScreen() {

    recallTimer = null;
    recallWasHidden = false;

    phase = "ready";

    activeDeck = [];
    startIndex = 0;

    timer = null;
    memorizationResult = null;
    wasHidden = false;

    recallResult = null;

    scoringResult = null;

    clearMemorizationCards();
    //회상화면 초기화
    clearRecallScreen();
    //채점화면 초기화
    clearScoringScreen();

    statusElement.textContent =
        "암기 시작을 눌러주세요.";

    positionElement.textContent =
        "암기 시작 전";

    timerElement.textContent =
        formatRemaining(MEMORIZATION_LIMIT_MS);

    updateControls();
}


// 버튼 이벤트 연결
startButton.addEventListener(
    "click",
    startMemorization
);

finishButton.addEventListener(
    "click",
    () => finishMemorization("manual")
);

resetButton.addEventListener(
    "click",
    resetScreen
);

prevButton.addEventListener(
    "click",
    () => moveCards(-1)
);

nextButton.addEventListener(
    "click",
    () => moveCards(1)
);

recallStartButton.addEventListener(
    "click",
    startRecall
);

recallSubmitButton.addEventListener(
    "click",
    () => finishRecall("manual")
);


// 키보드 이벤트 처리
document.addEventListener("keydown", event => {

    // 선택 메뉴 조작 중에는 단축키 사용 안 함
    if (event.target instanceof HTMLSelectElement) {
        return;
    }

    // 회상 중에는 전역 단축키 사용 안 함
    if (phase === "recalling") {
        return;
    }

    // Space: 암기 시작, 종료, 다시 준비
    if (event.code === "Space") {

        event.preventDefault();

        // Space 키의 반복 입력 방지
        if (event.repeat) {
            return;
        }

        if (phase === "ready") {

            startMemorization();

        } else if (phase === "memorizing") {

            finishMemorization("manual");

        } else if (phase === "recall-ready") {

            startRecall();

        } else if (phase === "finished") {

            resetScreen();
        }

        return;
    }

    // 암기 중 방향키 조작
    // 처음엔 꾹 누르면 넘어가게 했지만
    // 현실의 카드는 손가락으로 하나하나 넘기므로 
    // 버튼을 눌렀다 떼야 넘어가도록함.

    if (phase === "memorizing") {

        // 오른쪽 방향키: 다음 카드
        if (event.key === "ArrowRight") {

            event.preventDefault();

            if (!event.repeat) {
                moveCards(1);
            }
        }

        // 왼쪽 방향키: 이전 카드
        if (event.key === "ArrowLeft") {

            event.preventDefault();

            if (!event.repeat) {
                moveCards(-1);
            }
        }
    }
});



// 암기 및 회상 도중 페이지 이탈 감지
document.addEventListener("visibilitychange", () => {

    // 암기 단계
    if (phase === "memorizing") {

        if (document.hidden) {

            wasHidden = true;

        } else {

            checkTimeLimit();
        }

    // 회상 단계
    } else if (phase === "recalling") {

        if (!checkRecallTimeLimit()) {
            return;
        }

        if (document.hidden) {

            recallWasHidden = true;
        }
    }
});



// 최초 실행 시 초기 화면 표시
resetScreen();
