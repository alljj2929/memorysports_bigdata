
// 정답 배열과 회상 배열 비교 및 채점
function scoreRecall(targetDeck, recalledCards) {

    const deckSize = targetDeck.length;

    // 배열 길이 검증
    if (
        deckSize === 0 ||
        deckSize !== recalledCards.length
    ) {
        throw new Error("채점할 카드 배열의 길이가 올바르지 않습니다.");
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    let firstErrorPosition = null;

    // 카드별 채점 결과
    const cardResults = [];


    // 각 위치의 정답 카드와 회상 카드 비교
    for (let i = 0; i < deckSize; i++) {

        const targetCard = targetDeck[i].id;
        const recalledCard = recalledCards[i];

        const isCorrect = targetCard === recalledCard;

        let answerStatus;


        // 정답, 오답, 미입력 구분
        if (isCorrect) {

            correctCount++;

            answerStatus = "correct";

        } else if (recalledCard === null) {

            unansweredCount++;

            answerStatus = "empty";

        } else {

            wrongCount++;

            answerStatus = "wrong";
        }


        // 최초 오류 위치 기록
        if (
            !isCorrect &&
            firstErrorPosition === null
        ) {

            firstErrorPosition = i + 1;
        }


        // 개별 카드 채점 결과 저장
        cardResults.push({

            position: i + 1,

            target_card: targetCard,

            recalled_card: recalledCard,

            is_correct: isCorrect,

            answer_status: answerStatus
        });
    }


    // 정확도 계산 (0~1)
    const accuracy = correctCount / deckSize;


    // 처음부터 연속으로 맞힌 카드 수
    const consecutiveCorrectCount =
        firstErrorPosition === null
            ? deckSize
            : firstErrorPosition - 1;


    // 전체 카드 암기 성공 여부
    const isPerfect = correctCount === deckSize;


    // 최종 채점 결과 반환
    return {

        deck_size: deckSize,

        correct_count: correctCount,

        wrong_count: wrongCount,

        unanswered_count: unansweredCount,

        accuracy: accuracy,

        first_error_position: firstErrorPosition,

        consecutive_correct_count:
            consecutiveCorrectCount,

        is_perfect: isPerfect,

        card_results: cardResults
    };
}


// 카드 ID를 화면 표시용 문자열로 변환
function formatScoreCard(cardId) {

    if (cardId === null) {
        return "–";
    }

    const card = recallCardMap.get(cardId);

    return card.rank + card.symbol;
}


// 채점 결과 화면 표시
function renderScoringResult(
    score,
    memorization,
    recall
) {

    const summaryArea =
        document.getElementById("score-summary");

    const detailsArea =
        document.getElementById("score-details");


    // 이전 채점 결과 제거
    summaryArea.replaceChildren();
    detailsArea.replaceChildren();


    // 화면에 표시할 주요 결과
    const summaryItems = [

        [
            "정답 카드 수",
            `${score.correct_count} / ${score.deck_size}`
        ],

        [
            "오답 카드 수",
            `${score.wrong_count}장`
        ],

        [
            "미입력 카드 수",
            `${score.unanswered_count}장`
        ],

        [
            "정확도",
            `${(score.accuracy * 100).toFixed(2)}%`
        ],

        [
            "최초 오류 위치",
            score.first_error_position === null
                ? "없음"
                : `${score.first_error_position}번`
        ],

        [
            "연속 정답 수",
            `${score.consecutive_correct_count}장`
        ],

        [
            "암기 시간",
            `${(memorization.memorization_time_ms / 1000).toFixed(3)}초`
        ],

        [
            "회상 시간",
            `${(recall.recall_time_ms / 1000).toFixed(3)}초`
        ],

        [
            "전체 암기 성공",
            score.is_perfect ? "성공" : "실패"
        ]
    ];


    // 전체 채점 결과 표시
    summaryItems.forEach(([label, value]) => {

        const item = document.createElement("div");
        item.classList.add("score-item");

        const labelElement = document.createElement("div");
        labelElement.classList.add("score-label");
        labelElement.textContent = label;

        const valueElement = document.createElement("div");
        valueElement.classList.add("score-value");
        valueElement.textContent = value;

        item.appendChild(labelElement);
        item.appendChild(valueElement);

        summaryArea.appendChild(item);
    });


    // 채점 상태에 대응하는 표시 문구
    const statusLabels = {

        correct: "정답",
        wrong: "오답",
        empty: "미입력"
    };


    // 카드별 상세 채점 결과 표시
    score.card_results.forEach(result => {

        const row = document.createElement("tr");

        const values = [

            result.position,

            formatScoreCard(result.target_card),

            formatScoreCard(result.recalled_card),

            statusLabels[result.answer_status]
        ];


        
        values.forEach((value, index) => {

            const cell = document.createElement("td");

            cell.textContent = value;

            // 정답 카드 및 회상 카드에 무늬별 색상 적용
            if (index === 1 || index === 2) {

                const cardId = index === 1
                    ? result.target_card
                    : result.recalled_card;

                const card = recallCardMap.get(cardId);

                if (card) {

                    cell.classList.add(card.color);
                }
            }

            // 채점 결과 열에 상태별 색상 적용
            if (index === 3) {

                cell.classList.add(
                    `score-${result.answer_status}`
                );
            }

            row.appendChild(cell);
        });


        detailsArea.appendChild(row);
    });
}


// 결과 화면 초기화
function clearScoringScreen() {

    document.getElementById(
        "score-summary"
    ).replaceChildren();

    document.getElementById(
        "score-details"
    ).replaceChildren();
}
