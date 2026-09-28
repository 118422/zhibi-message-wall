
// 卡片翻面功能
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
    });
});


// 隨機抽取留言，不重複
const randomBtn = document.getElementById("random-btn");
let drawnCards = [];

if (randomBtn) {
    randomBtn.addEventListener("click", () => {
        const cards = Array.from(document.querySelectorAll(".card"));

        // 如果全部抽完，重新開始
        if (drawnCards.length >= cards.length) {
            drawnCards = [];
            randomBtn.textContent = "✦ 隨機抽取一張留言 ✦";
            cards.forEach(card => {
    card.classList.remove("flipped");
    card.closest(".card-item").classList.remove("selected");
});
            return;
        }

        // 只從尚未抽過的卡片中選擇
        const remainingCards = cards.filter(
            card => !drawnCards.includes(card)
        );

        const randomIndex = Math.floor(
            Math.random() * remainingCards.length
        );

        const randomCard = remainingCards[randomIndex];
        drawnCards.push(randomCard);

        randomCard.classList.add("flipped");
       // 留言逐字浮現
const message = randomCard.querySelector(".message-text");

if (message) {
    const text = message.textContent;
    message.textContent = "";

    let index = 0;

    const typing = setInterval(() => {
        message.textContent += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(typing);
        }
    }, 50);
}

        // 先讓上一張卡片縮回原位
        document.querySelectorAll(".card-item.selected").forEach(item => {
            item.classList.remove("selected");
        });

        // 放大目前抽中的卡片
        randomCard.closest(".card-item").classList.add("selected");

        randomCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // 全部抽完後更改按鈕文字
        if (drawnCards.length >= cards.length) {
            randomBtn.textContent = "✦ 已抽完，點擊重新抽取 ✦";
        }
    });
}

// 音樂播放器
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("play-btn");
const volume = document.getElementById("volume");

if (bgm && playBtn && volume) {
    // 預設音量 20%
    bgm.volume = 0.2;

    // 播放／暫停
    playBtn.addEventListener("click", () => {
        if (bgm.paused) {
            bgm.play().then(() => {
                playBtn.textContent = "Ⅱ";
            }).catch(error => {
                console.log("無法播放音樂：", error);
            });
        } else {
            bgm.pause();
            playBtn.textContent = "▶";
        }
    });

    // 調整音量
    volume.addEventListener("input", () => {
        bgm.volume = Number(volume.value);
    });

    // 音樂結束後恢復播放圖示
    bgm.addEventListener("ended", () => {
        playBtn.textContent = "▶";
    });
}
// 點擊空白處，收起放大的卡片
document.querySelectorAll(".card-item").forEach(item => {
    item.addEventListener("click", (event) => {
        if (
            item.classList.contains("selected") &&
            event.target === item
        ) {
            item.classList.remove("selected");
        }
    });
});