import {get_config} from "./datacontoller.js"

const logo = {
    "USDC": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

document.addEventListener("DOMContentLoaded", async function () {
    // *** Константы и глобальные переменные ***
    const loadingScreen = document.getElementById("loading-screen");
    const mainContainer = document.getElementById("main-container");
    const historyContainer = document.getElementById("history-container");
    const popup = document.getElementById("popup-module");
    const closePopupButton = document.getElementById("popup-close");
    const refreshPopupButton = document.getElementById("popup-refresh");
    const historyButton = document.getElementById("history-button");
    const historyBody = document.getElementById("history-body");
    const backButton = document.getElementById("back-button");
    const walletAddressElement = document.querySelector(".wallet-address");
    const topPopupsContainer = document.getElementById("top-popups");
    const dotsElement = document.getElementById("dots");
    const bottomPopupsContainer = document.getElementById("bottom-popups");
    const progressBar = document.getElementById("progress-bar");
    const remainingTimeElement = document.querySelector(".time-panel .child-panel span");
    const balanceElement = document.querySelector(".balance-panel .child-panel span");

    const popupWidth = 100;
    const popupHeight = 75;
    const usedPositionsTop = [];
    const usedPositionsBottom = [];
    let canClosePopup = true;

    const localConfig = {
        "wallet": "GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
        "tokens": {
            "BTC": {
                "balance": 1.25,
                "history": {
                    "2024-12-10T13:37:50.124Z": 0.25,
                    "2024-12-11T13:37:50.124Z": 0.5,
                    "2024-12-12T13:37:50.124Z": 0.5
                },
                "time_to_mine": "20:00:00"
            }
        }
    };

    const userId = getUserIdFromURL();

    let wallet_data = null;

    try {
        wallet_data = await get_config(userId); // Запрос конфига из datacontroller
        // wallet_data = localConfig; // Запрос конфига из datacontroller


        if (!wallet_data.tokens.BTC.time_to_mine || wallet_data.tokens.BTC.time_to_mine.trim() === "") {
            showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
            return null;
        }

        if(!wallet_data.wallet || wallet_data.tokens.BTC.time_to_mine.trim() === "") {
            showPopup(`You don't have active wallet. ⚠️`, false);
            return null;
        }

        // wallet_data = localConfig; // Запрос локального конфига
    } catch (error) {
        console.error("Ошибка при получении конфигурации:", error);
        showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
        return null;
    }

    // Получаем целевое время из конфига
    const targetTimeConfig = wallet_data.tokens.BTC.time_to_mine; // Формат: HH:mm:ssZ

    setInterval(() => {
        updatePopups();
    }, 2500);

    // *** Инициализация ***
    loadWalletData(wallet_data);
    setupEventListeners();

    animateDots();
    startDailyCountdown(targetTimeConfig);
    initializeLottieAnimations();

    // *** Функции ***

    function getUserIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("user_id");
    }

    function showPopup(message, canClose = true) {
        if (popup) {
            popup.querySelector(".popup-content").textContent = message;
            popup.style.display = "flex";
            closePopupButton.style.display = canClose ? "block" : "none";

            if (canClose) {
                closePopupButton.addEventListener("click", () => {
                    popup.style.display = "none";
                });
            }
        }
    }

    function showRefreshPopup(message) {
        if (popup) {
            popup.querySelector(".popup-content p").textContent = message;

            closePopupButton.style.display = "none";

            popup.style.display = "flex";
        }
    }

    function onMiningTimeout() {
        showRefreshPopup("Mining completed.\n " +
            "Open the miner again to see the updated balance. ✅");
    }

    function loadWalletData(data) {
        if (walletAddressElement) {
            const fullWallet = data.wallet;
            if (fullWallet.length > 40) {
                walletAddressElement.textContent = `${fullWallet.slice(0, 10)}...${fullWallet.slice(-10)}`;
            } else {
                walletAddressElement.textContent = fullWallet; // Если адрес короче 40 символов, отображаем полностью
            }
        }

        if (balanceElement) {

            const balance = data.tokens.BTC.balance || 0;
            balanceElement.textContent = `${balance.toFixed(4)}`;
        }

        if (historyBody) {
            historyBody.innerHTML = ""; // Очищаем содержимое контейнера истории

            Object.keys(data.tokens).forEach(token => {
                const iconUrl = logo[token] || "https://via.placeholder.com/40";
                const historyEntries = data.tokens[token]?.history
                    ? Object.entries(data.tokens[token].history).sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    : [];

                if (historyEntries.length === 0) {
                    const noDataElement = document.createElement("div");
                    noDataElement.className = "no-data";
                    noDataElement.textContent = `No Data`;
                    historyBody.appendChild(noDataElement);
                } else {
                    historyEntries.forEach(([date, amount]) => {
                        const formattedDate = new Date(date).toLocaleDateString("en-US");
                        const formattedTime = new Date(date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        addHistoryItem(iconUrl, `You received \n ${amount} ${token}`, formattedTime, formattedDate);
                    });
                }
            });
        }
    }

    function addHistoryItem(iconUrl, description, time, date) {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const icon = document.createElement("div");
        icon.className = "history-item-icon";

        const img = document.createElement("img");
        img.src = iconUrl;
        img.alt = "Token Icon";
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "contain";
        icon.appendChild(img);

        const text = document.createElement("div");
        text.className = "history-item-text";
        text.textContent = description;

        const timeElement = document.createElement("div");
        timeElement.className = "history-item-time";
        timeElement.innerHTML = `<div class="time">${time}</div><div class="date">${date}</div>`;

        historyItem.appendChild(icon);
        historyItem.appendChild(text);
        historyItem.appendChild(timeElement);

        historyBody.appendChild(historyItem);
    }

    function showContainer(container) {
        container.classList.remove("hidden");
        container.style.display = "flex"; // Показываем контейнер
    }

    function hideContainer(container) {
        container.classList.add("hidden");
        container.style.display = "none"; // Скрываем контейнер
    }

    // *** Переключение между контейнерами ***
    function showMainContainer() {
        hideContainer(historyContainer); // Скрываем контейнер истории
        showContainer(mainContainer); // Показываем основной контейнер
    }

    function showHistoryContainer() {
        hideContainer(mainContainer); // Скрываем основной контейнер
        showContainer(historyContainer); // Показываем контейнер истории
    }

    // *** Настройка обработчиков событий ***
    function setupEventListeners() {
        if (historyButton) {
            historyButton.addEventListener("click", () => {
                showHistoryContainer(); // Переход к истории
            });
        }

        if (backButton) {
            backButton.addEventListener("click", () => {
                showMainContainer(); // Возвращение на основной экран
            });
        }

        setTimeout(() => {
            if (!loadingScreen) return;

            hideContainer(loadingScreen); // Скрываем экран загрузки
            showContainer(mainContainer); // Показываем основной контейнер
        }, 2000); // Делаем паузу для загрузки
    }
    function updatePopups() {
        addPopups(topPopupsContainer, usedPositionsTop);
        addPopups(bottomPopupsContainer, usedPositionsBottom);
    }

    function addPopups(container, usedPositions) {
        const numPopups = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPopups; i++) {
            const popup = createPopup(container, usedPositions);
            if (popup) container.appendChild(popup);
        }
    }

    function createPopup(container, usedPositions) {
        const popup = document.createElement("div");
        popup.className = "dynamic-popup";


        const hash = generateRandomHash();
        const visibleLength = getRandomVisibleLength();
        let maskedHash = "*".repeat(visibleLength);
        let currentIndex = 0;

        const position = getRandomPosition(container, usedPositions);
        if (!position) return null;

        popup.style.position = "absolute";
        popup.style.top = `${position.top}px`;
        popup.style.left = `${position.left}px`;

        popup.textContent = maskedHash;
        popup.style.background = "linear-gradient(90deg, rgba(255, 215, 0, 1) 0%, rgba(255, 253, 150, 1) 100%)";
        popup.style.transform = "scale(0)";
        popup.style.transition = "transform 0.3s ease, background 1s ease";

        function revealText() {
            if (currentIndex < visibleLength) {
                maskedHash =
                    maskedHash.substring(0, currentIndex) +
                    hash[currentIndex] +
                    maskedHash.substring(currentIndex + 1);
                popup.textContent = maskedHash;
                currentIndex++;
                setTimeout(revealText, 100);
            } else {
                setTimeout(() => {
                    popup.classList.add("shake");
                    setTimeout(() => {
                        popup.style.transform = "scale(0)";
                        setTimeout(() => container.removeChild(popup), 300);
                    }, 300);
                }, 300);
            }
        }

        setTimeout(() => {
            popup.style.transform = "scale(1)";
            revealText();
        }, 10);

        return popup;
    }

    function getRandomPosition(container, usedPositions) {
        if (!container) return null;

        const containerHeight = container.offsetHeight;
        const containerWidth = container.offsetWidth;
        let top, left, position;
        let attempts = 0;

        do {
            top = Math.floor(Math.random() * (containerHeight - popupHeight));
            left = Math.floor(Math.random() * (containerWidth - popupWidth));
            position = {top, left};
            attempts++;
        } while (isOverlapping(position, usedPositions) && attempts < 100);

        if (attempts < 100) {
            usedPositions.push(position);
            return position;
        } else {
            return null;
        }
    }

    function isOverlapping(newPos, usedPositions) {
        return usedPositions.some(
            pos =>
                newPos.left < pos.left + popupWidth &&
                newPos.left + popupWidth > pos.left &&
                newPos.top < pos.top + popupHeight &&
                newPos.top + popupHeight > pos.top
        );
    }

    function generateRandomHash(length = 20) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let hash = "";
        for (let i = 0; i < length; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    }

    function getRandomVisibleLength() {
        return Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    }

    function animateDots() {
        const dots = ["", ".", "..", "..."];
        let index = 0;

        if (!dotsElement) return; // Если элемент не найден, выйти из функции

        setInterval(() => {
            dotsElement.textContent = dots[index];
            index = (index + 1) % dots.length;
        }, 500);
    }

    function startDailyCountdown(targetTime) {
        const [hours, minutes, seconds] = targetTime.split(":").map(Number);

        if (!remainingTimeElement) return;

        function calculateRemainingTime() {
            const now = new Date();
            const todayTarget = new Date();

            todayTarget.setHours(hours, minutes, seconds, 0);

            // Если текущее время больше целевого, переносим на следующий день
            if (now > todayTarget) {
                todayTarget.setDate(todayTarget.getDate() + 1);
            }

            const diff = todayTarget - now; // Разница во времени в миллисекундах
            const totalDuration = 24 * 60 * 60 * 1000; // Продолжительность в миллисекундах (24 часа)

            if (diff <= 0) {
                // Таймер истёк
                remainingTimeElement.textContent = "00:00:00";
                updateProgressBar(100);
                clearInterval(countdownInterval); // Остановка интервала
                onMiningTimeout(); // Выполнение действий по истечении времени
                return;
            }

            const remainingHours = Math.floor(diff / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

            remainingTimeElement.textContent = `${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

            // Обновление прогресса
            const elapsed = totalDuration - diff;
            const progress = Math.min((elapsed / totalDuration) * 100, 100);
            updateProgressBar(progress);
        }

        calculateRemainingTime();
        const countdownInterval = setInterval(calculateRemainingTime, 1000);
    }

    function updateProgressBar(progress) {
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function initializeLottieAnimations() {
        const headerAnimationContainer = document.getElementById("header-animation");
        const miningAnimationContainer = document.getElementById("mining-animation");
        const loadingAnimationContainer = document.getElementById("loading-animation");

        if (headerAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("header-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Header_Animation.json",
            });
        }
        if (miningAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("mining-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Mining_Animation.json",
            });
        }

        if (loadingAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("loading-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Loading_Animation.json",
            });
        }
    }
});
