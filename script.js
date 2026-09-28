// 卡片翻面功能、搜尋、收藏與隨機抽取
const cards = Array.from(document.querySelectorAll(".card"));
const randomBtn = document.getElementById("random-btn");
const searchInput = document.getElementById("card-search");
const favoritesFilter = document.getElementById("favorites-filter");
let drawnCards = [];
let showFavoritesOnly = false;

const pageName = location.pathname.split("/").pop().replace(/\.html?$/i, "") || "home";
const storageKey = "jianghu-favorites-v1";

function getFavoriteSet() {
    try {
        return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch (error) {
        return new Set();
    }
}

let favorites = getFavoriteSet();

function cardSignature(card) {
    const sender = card.querySelector(".sender")?.textContent.trim() || "";
    const message = card.querySelector(".message-text")?.textContent.trim() || "";
    return pageName + "|" + sender + "|" + message;
}

function saveFavorites() {
    try {
        localStorage.setItem(storageKey, JSON.stringify([...favorites]));
    } catch (error) {
        console.warn("無法儲存收藏：", error);
    }
}

function addFavoriteButtons() {
    document.querySelectorAll(".card-item").forEach(item => {
        const card = item.querySelector(".card");
        if (!card || item.querySelector(".favorite-btn")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-btn";
        button.setAttribute("aria-label", "收藏留言");
        button.addEventListener("click", event => {
            event.stopPropagation();
            const key = cardSignature(card);
            if (favorites.has(key)) favorites.delete(key);
            else favorites.add(key);
            saveFavorites();
            updateFavoriteButton(button, key);
            applyFilters();
        });
        item.appendChild(button);
        updateFavoriteButton(button, cardSignature(card));
    });
}

function updateFavoriteButton(button, key) {
    const saved = favorites.has(key);
    button.textContent = saved ? "♥" : "♡";
    button.classList.toggle("is-favorite", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "取消收藏" : "收藏留言");
    button.title = saved ? "取消收藏" : "收藏留言";
}

function applyFilters() {
    const keyword = (searchInput?.value || "").trim().toLocaleLowerCase();
    document.querySelectorAll(".card-item").forEach(item => {
        const card = item.querySelector(".card");
        if (!card) return;
        const sender = card.querySelector(".sender")?.textContent || "";
        const message = card.querySelector(".message-text")?.textContent || "";
        const matchesSearch = (sender + " " + message).toLocaleLowerCase().includes(keyword);
        const isFavorite = favorites.has(cardSignature(card));
        item.hidden = !(matchesSearch && (!showFavoritesOnly || isFavorite));
    });
    // 避免篩選後抽到被隱藏的卡片
    drawnCards = drawnCards.filter(card => !card.closest(".card-item")?.hidden);
    if (randomBtn) {
        randomBtn.textContent = "✦ 隨機抽取一張留言 ✦";
    }
    document.querySelectorAll(".card-item.selected").forEach(item => item.classList.remove("selected"));
}

cards.forEach(card => {
    card.addEventListener("click", () => {
        const item = card.closest(".card-item");

        // 點擊卡片時，放大目前卡片並收起其他卡片
        document.querySelectorAll(".card-item.selected").forEach(selected => {
            if (selected !== item) selected.classList.remove("selected");
        });

        item?.classList.add("selected");
        card.classList.toggle("flipped");
    });
});

if (searchInput) searchInput.addEventListener("input", applyFilters);

if (favoritesFilter) {
    favoritesFilter.addEventListener("click", () => {
        showFavoritesOnly = !showFavoritesOnly;
        favoritesFilter.setAttribute("aria-pressed", String(showFavoritesOnly));
        favoritesFilter.textContent = showFavoritesOnly ? "♥ 顯示全部" : "♡ 只看收藏";
        applyFilters();
    });
}


addFavoriteButtons();
applyFilters();

// 隨機抽取留言，不重複；篩選時只抽取目前顯示的卡片
if (randomBtn) {
    randomBtn.addEventListener("click", () => {
        const availableCards = Array.from(document.querySelectorAll(".card"))
            .filter(card => !card.closest(".card-item")?.hidden);

        if (availableCards.length === 0) {
            randomBtn.textContent = "✦ 沒有符合的留言 ✦";
            return;
        }

        if (drawnCards.length >= availableCards.length) {
            drawnCards = [];
            randomBtn.textContent = "✦ 隨機抽取一張留言 ✦";
            availableCards.forEach(card => {
                card.classList.remove("flipped");
                card.closest(".card-item")?.classList.remove("selected");
            });
            return;
        }

        const remainingCards = availableCards.filter(card => !drawnCards.includes(card));
        const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        drawnCards.push(randomCard);

        availableCards.forEach(card => {
            if (card !== randomCard) card.closest(".card-item")?.classList.remove("selected");
        });
        randomCard.classList.add("flipped");

        // 留言逐字浮現
        const message = randomCard.querySelector(".message-text");
        if (message) {
            if (message._typingTimer) clearInterval(message._typingTimer);
            const text = message.textContent;
            message.textContent = "";
            let index = 0;
            message._typingTimer = setInterval(() => {
                message.textContent += text[index];
                index++;
                if (index >= text.length) {
                    clearInterval(message._typingTimer);
                    message._typingTimer = null;
                }
            }, 50);
        }

        const item = randomCard.closest(".card-item");
        item.classList.add("selected");
        randomCard.scrollIntoView({ behavior: "smooth", block: "center" });

        if (drawnCards.length >= availableCards.length) {
            randomBtn.textContent = "✦ 已抽完，點擊重新抽取 ✦";
        }
    });
}

// 音樂播放器
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("play-btn");
const volume = document.getElementById("volume");
const progress = document.getElementById("music-progress");
const currentTimeLabel = document.getElementById("current-time");
const durationLabel = document.getElementById("duration");

function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

if (bgm && playBtn && volume) {
    bgm.volume = 0.2;
    playBtn.addEventListener("click", () => {
        if (bgm.paused) {
            bgm.play().then(() => {
                playBtn.textContent = "Ⅱ";
            }).catch(error => console.log("無法播放音樂：", error));
        } else {
            bgm.pause();
            playBtn.textContent = "▶";
        }
    });
    volume.addEventListener("input", () => {
        bgm.volume = Number(volume.value);
    });
    if (progress) {
        bgm.addEventListener("loadedmetadata", () => {
            progress.max = Number.isFinite(bgm.duration) ? bgm.duration : 0;
            if (durationLabel) durationLabel.textContent = formatMusicTime(bgm.duration);
        });
        bgm.addEventListener("timeupdate", () => {
            if (!progress.matches(":active")) progress.value = bgm.currentTime;
            if (currentTimeLabel) currentTimeLabel.textContent = formatMusicTime(bgm.currentTime);
        });
        progress.addEventListener("input", () => {
            bgm.currentTime = Number(progress.value);
            if (currentTimeLabel) currentTimeLabel.textContent = formatMusicTime(bgm.currentTime);
        });
    }
    bgm.addEventListener("play", () => { playBtn.textContent = "Ⅱ"; });
    bgm.addEventListener("pause", () => { playBtn.textContent = "▶"; });
    bgm.addEventListener("ended", () => { playBtn.textContent = "▶"; });
}

// 點擊放大卡片外的空白處，收起卡片
 document.querySelectorAll(".card-item").forEach(item => {
    item.addEventListener("click", event => {
        if (item.classList.contains("selected") && event.target === item) {
            item.classList.remove("selected");
        }
    });
});
