
// 제한 시간이 있는 타이머 생성
function createTimer(limitMs, onTick, onTimeout) {

    let startedAt = null;
    let stoppedElapsed = null;
    let intervalId = null;

    // 실제 경과 시간 계산
    function getElapsed() {
        if (stoppedElapsed !== null) {
            return stoppedElapsed;
        }

        if (startedAt === null) {
            return 0;
        }

        return Math.min(
            performance.now() - startedAt,
            limitMs
        );
    }

    // 화면 갱신 및 시간 초과 확인
    function tick() {
        const elapsed = getElapsed();
        const remaining = limitMs - elapsed;

        onTick(remaining);

        if (remaining <= 0) {
            onTimeout();
        }
    }

    // 타이머 시작
    function start() {
        if (startedAt !== null) {
            return;
        }

        startedAt = performance.now();

        intervalId = setInterval(tick, 100);

        tick();
    }

    // 타이머 종료
    function stop() {
        stoppedElapsed = getElapsed();

        clearInterval(intervalId);
        intervalId = null;

        return stoppedElapsed;
    }

    return {
        start,
        stop,
        getElapsed
    };
}


// 밀리초를 분:초 형태로 변환
function formatRemaining(ms) {
    const totalSeconds = Math.ceil(
        Math.max(0, ms) / 1000
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}
