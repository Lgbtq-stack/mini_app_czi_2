import {get_config} from "./datacontoller.js"

const logo = {
    "USDC": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

document.addEventListener("DOMContentLoaded", async function () {
    Telegram.WebApp.expand();

    const tg = Telegram.WebApp;

    let isServerCardVisible = false;

    const timeToResfreshProgressBar = 2000;

    const loadingScreen = document.getElementById("loading-screen");
    const mainContainer = document.getElementById("main-container");
    const historyContainer = document.getElementById("history-container");
    const popup = document.getElementById("popup-module");
    const closePopupButton = document.getElementById("popup-close");
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

    const serverCardButton = document.getElementById('server-card-button');
    const backToMainButton = document.getElementById('back-to-main-button');
    const myServers = document.getElementById("my-servers");
    const serverShop = document.getElementById("servers-shop");

    const serverShopButton = document.getElementById("server-shop-button");
    const backToMyServerButton = document.getElementById("back-to-my-servers-button");
    const serverCard = document.getElementById("server-card-button");

    const popupWidth = 100;
    const popupHeight = 75;
    const usedPositionsTop = [];
    const usedPositionsBottom = [];
    let totalBtcMine = 0;

    let totalBTC = 0;

    const localConfig = {
        "user_id": "350104566",
        "wallet": "GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
        "tokens": {
            "BTC": {
                "balance": 1.25,
                "history": {
                    "2024-12-18T02:00:00Z": 0.000442,
                    "2024-12-20T02:00:00Z": 0.0004409,
                    "2024-12-25T02:00:00Z": 0.0004409,
                    "2024-12-19T02:00:00Z": 0.0004409,
                    "2024-12-21T02:00:00Z": 0.0004409,
                    "2024-12-26T02:00:00Z": 0.0004409,
                    "2024-12-22T02:00:00Z": 0.0004409,
                    "2024-12-23T02:00:00Z": 0.0004409,
                    "2024-12-24T02:00:00Z": 0.0004409
                },
                "btc_get_time": "18:00:00",
            }
        },
        "servers": {
            "h200p500r8g1": {
                "specs": {
                    "power": 500,
                    "hashrate": 200,
                    "ram": 8,
                    "gpu": 1,
                    "gpu_name": "NVIDIA A2000 equivalent",
                    "gpu_count": 1
                },
                "btc_mine": 0.0004,
                "price": 100,
                "name": "Starter Series",
                "country": "US",
                "available": 100,
                "created_at": "2024-12-20T01:02:55.86199",
                "total_mined_days": 7
            },
            "h1100p2200r4096g1024": {
                "specs": {
                    "power": 2200,
                    "hashrate": 1100,
                    "ram": 4096,
                    "gpu": 1024,
                    "gpu_name": "Next-gen ASIC miners",
                    "gpu_count": 1024
                },
                "btc_mine": 0.9,
                "price": 5000,
                "name": "Ultra Titan Series",
                "country": "US",
                "available": 100,
                "created_at": "2024-12-30T09:13:40.956881",
                "total_mined_days": 0
            },
            "h900p1800r1024g256": {
                "specs": {
                    "power": 1800,
                    "hashrate": 900,
                    "ram": 1024,
                    "gpu": 256,
                    "gpu_name": "Custom ASIC-based GPUs",
                    "gpu_count": 256
                },
                "btc_mine": 0.1,
                "price": 2000,
                "name": "Elite Series",
                "country": "US",
                "available": 100,
                "created_at": "2024-12-27T01:16:10.512229",
                "total_mined_days": 0
            }
        }
    };

    const userId = getUserIdFromURL();

    let wallet_data = null;

    try {
        wallet_data = await get_config(userId); // Запрос конфига из datacontroller
        // wallet_data = localConfig; // Запрос конфига из datacontroller

        if (!wallet_data.wallet || wallet_data.wallet.trim() === "") {
            showPopup(`You don't have active wallet. ⚠️`, false);
            return null;
        }

        if (!wallet_data.tokens.BTC.btc_get_time || wallet_data.tokens.BTC.btc_get_time.trim() === "") {
            showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
            return null;
        }


        serverCard.classList.remove("hidden");

    } catch
        (error) {
        console.error("Ошибка при получении конфигурации:", error);
        showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
        return null;
    }

    const targetTimeConfig = wallet_data.tokens.BTC.btc_get_time;

    setInterval(() => {
        updatePopups();
    }, 2500);

    loadWalletData(wallet_data);
    setupEventListeners();

    animateDots();
    startDailyCountdown(targetTimeConfig);
    initializeLottieAnimations();

    startUpdatingProgress()

    await loadShopServerCards();
    await loadServers();
    await setupBuyButtons();

    calculateTotalBTC(wallet_data);

    setInterval(() => {
        calculateTotalBTC(wallet_data);
    }, 2000);

    initializeDashboardFromItems();

    if (wallet_data.servers && Object.keys(wallet_data.servers).length > 0)
        startMiningProgress(wallet_data);

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
                walletAddressElement.textContent = fullWallet;
            }
        }

        if (balanceElement) {

            const balance = data.tokens.BTC.balance || 0;
            balanceElement.textContent = `${balance.toFixed(4)}`;
        }

        if (historyBody) {
            historyBody.innerHTML = "";

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
                        addHistoryItem(iconUrl, `You received \n  ${amount} ${token}`, formattedTime, formattedDate);
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
        container.style.display = "flex";
    }

    function hideContainer(container) {
        container.classList.add("hidden");
        container.style.display = "none";
    }

// *** Настройка обработчиков событий ***
    function setupEventListeners() {
        historyButton?.addEventListener("click", () => toggleContainer(historyContainer, mainContainer));

        backButton?.addEventListener("click", () => toggleContainer(mainContainer, historyContainer));

        serverCardButton?.addEventListener("click", () => toggleContainer(myServers, mainContainer));

        backToMainButton?.addEventListener("click", () => toggleContainer(mainContainer, myServers));

        serverShopButton?.addEventListener("click", () => toggleContainer(serverShop, myServers));

        backToMyServerButton?.addEventListener("click", () => toggleContainer(myServers, serverShop));

        setTimeout(() => {
            if (!loadingScreen) return;

            hideContainer(loadingScreen);
            showContainer(mainContainer);
            hideContainer(myServers);
            hideContainer(serverShop);

        }, 2000);


    }


    function toggleContainer(showContainer, hideContainer) {
        hideContainer.classList.add("hidden");
        hideContainer.style.display = "none";

        showContainer.classList.remove("hidden");
        showContainer.style.display = "flex";
    }

    function updatePopups() {
        try {
            addPopups(topPopupsContainer, usedPositionsTop);
            addPopups(bottomPopupsContainer, usedPositionsBottom);
        } catch (error) {
            console.error("Ошибка в updatePopups:", error);
        }
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

        // if (attempts < 100) {
        usedPositions.push(position);
        return position;
        // } else {
        //     return null;
        // }
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
            const utcNow = new Date(
                Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
            );

            const todayTargetUTC = new Date(Date.UTC(
                utcNow.getUTCFullYear(),
                utcNow.getUTCMonth(),
                utcNow.getUTCDate(),
                hours,
                minutes,
                seconds,
                0
            ));

            if (utcNow > todayTargetUTC) {
                todayTargetUTC.setUTCDate(todayTargetUTC.getUTCDate() + 1);
            }

            const diff = todayTargetUTC - utcNow;
            const totalDuration = 24 * 60 * 60 * 1000;

            if (diff <= 0) {
                remainingTimeElement.textContent = "00:00:00";
                updateProgressBar(100);
                clearInterval(countdownInterval);
                onMiningTimeout();
                return;
            }

            const remainingHours = Math.floor(diff / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

            remainingTimeElement.textContent = `${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

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

    function getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    function startMiningProgress(wallet_data) {
        const timeToMine = wallet_data.tokens.BTC.btc_get_time;
        const [targetHours, targetMinutes, targetSeconds] = timeToMine.split(":").map(Number);

        const intervalsPerDay = 48;
        const btcPerInterval = totalBTC / intervalsPerDay;

        const nowUTC = new Date();
        const targetTimeUTC = new Date(Date.UTC(
            nowUTC.getUTCFullYear(),
            nowUTC.getUTCMonth(),
            nowUTC.getUTCDate(),
            targetHours,
            targetMinutes,
            targetSeconds
        ));

        // Если текущее время меньше времени добычи, откатываем на предыдущий день
        if (nowUTC < targetTimeUTC) {
            targetTimeUTC.setUTCDate(targetTimeUTC.getUTCDate() - 1);
        }

        const elapsedMilliseconds = nowUTC - targetTimeUTC;
        const elapsedIntervals = Math.floor(elapsedMilliseconds / (30 * 60 * 1000));  // Количество прошедших интервалов

        let currentInterval = Math.min(elapsedIntervals, intervalsPerDay);  // Убедимся, что не идем дальше, чем количество интервалов за день
        let initialBtcMine = btcPerInterval * currentInterval;  // Начальная сумма BTC, добытая на текущий момент

        const progressPercent = (currentInterval / intervalsPerDay) * 100;
        const totalBtcMineProgress = document.querySelector('.total-btc-mine-progress');
        const dashboardBtcMineValue = document.querySelector('.total-btc-mine-value');

        // Показываем полный баланс сразу
        if (totalBtcMineProgress) {
            totalBtcMineProgress.style.width = `100%`;
        }
        // if (dashboardBtcMineValue) {
        //     dashboardBtcMineValue.textContent = `${totalBTC.toFixed(4)} BTC`;  // Начальный баланс
        // }

        // Функция для обновления прогресса в течение дня
        function updateMiningProgress() {
            if (currentInterval < intervalsPerDay) {
                initialBtcMine += btcPerInterval;  // Добавляем BTC за этот интервал

                // Обновляем прогресс
                const progressPercent = ((currentInterval + 1) / intervalsPerDay) * 100;
                if (totalBtcMineProgress) {
                    totalBtcMineProgress.style.width = `${progressPercent}%`;
                }
                // if (dashboardBtcMineValue) {
                //     dashboardBtcMineValue.textContent = `${initialBtcMine.toFixed(4)} BTC`;  // Обновляем отображение баланса
                // }
                currentInterval++;  // Увеличиваем интервал
            }
        }


        setInterval(updateMiningProgress, 30 * 60 * 1000);
    }

    function calculateTotalBTC(wallet_data) {
        let totalBTC = 0;

        // Обходим все серверы
        Object.values(wallet_data.servers).forEach((server) => {
            const {
                created_at,
                btc_mine,
            } = server;

            const createdAt = new Date(created_at);
            const currentDate = new Date();

            // Вычисляем полное количество дней с момента покупки
            const elapsedMilliseconds = currentDate - createdAt;
            const elapsedDays = Math.floor(elapsedMilliseconds / (1000 * 3600 * 24));

            let serverTotalBTC = elapsedDays * btc_mine;

            // Учитываем текущий день
            const currentHour = currentDate.getUTCHours();
            const currentMinutes = currentDate.getUTCMinutes();
            const currentSeconds = currentDate.getUTCSeconds();

            const elapsedTimeToday = (currentHour * 3600 + currentMinutes * 60 + currentSeconds) / (24 * 3600);
            serverTotalBTC += btc_mine * elapsedTimeToday;

            // Добавляем BTC сервера к общему количеству
            totalBTC += serverTotalBTC;
        });

        // Обновляем отображение на дашборде
        const dashboardBtcMineValue = document.querySelector('.total-btc-mine-value');
        if (dashboardBtcMineValue) {
            dashboardBtcMineValue.textContent = `${totalBTC.toFixed(9)} BTC`;
        }

        return totalBTC;
    }


    function updateDashboardProgress() {
        const totalPowerProgress = document.querySelector('.total-power-progress');
        const totalHashrateProgress = document.querySelector('.total-hashrate-progress');
        const totalWorkloadProgress = document.querySelector('.total-workload-progress');

        const dashboardPowerValue = document.querySelector('.total-power-value');
        const dashboardHashrateValue = document.querySelector('.total-hashrate-value');
        const dashboardWorkloadValue = document.querySelector('.total-workload-value');


        const newPowerProgress = Math.floor(getRandomValue(90, 100));
        const newHashrateProgress = Math.floor(getRandomValue(90, 100));
        const newWorkloadProgress = Math.floor(getRandomValue(90, 100));


        totalPowerProgress.style.width = `${newPowerProgress}%`;
        totalHashrateProgress.style.width = `${newHashrateProgress}%`;
        totalWorkloadProgress.style.width = `${newWorkloadProgress}%`;


        dashboardPowerValue.textContent = `${newPowerProgress}%`;
        dashboardHashrateValue.textContent = `${newHashrateProgress}%`;
        dashboardWorkloadValue.textContent = `${newWorkloadProgress}%`;
    }


    function updateServerCardProgress() {
        const serverCards = document.querySelectorAll('.my-server-card');

        serverCards.forEach(card => {
            const powerProgress = card.querySelector('.power-progress');
            const hashrateProgress = card.querySelector('.hashrate-progress');
            const workloadProgress = card.querySelector('.status-progress');

            const newPowerProgress = getRandomValue(90, 100);
            const newHashrateProgress = getRandomValue(90, 100);
            const newWorkloadProgress = getRandomValue(90, 80);
            const workloadValue = card.querySelector('.status-stat-value');

            powerProgress.style.width = `${newPowerProgress}%`;
            hashrateProgress.style.width = `${newHashrateProgress}%`;
            workloadProgress.style.width = `${newWorkloadProgress}%`;

            workloadValue.textContent = `${newWorkloadProgress.toFixed(0)} %`;
        });
    }

    function initializeDashboardFromItems() {
        const serverCards = document.querySelectorAll('.my-server-card');

        let totalPower = 0;
        let toalHashrate = 0;

        if (wallet_data.servers && Object.keys(wallet_data.servers).length > 0) {
            serverCards.forEach(card => {
                const powerValue = parseInt(card.querySelector('.power-stat-value').textContent);
                const hashrateValue = parseInt(card.querySelector('.hashrate-stat-value').textContent);
                totalPower += powerValue;
                toalHashrate += hashrateValue;
            });

            const dashboardPowerValue = document.querySelector('.total-power-value');
            const dashboardHashrateValue = document.querySelector('.total-hashrate-value');
            const mainMenuPowerValue = document.querySelector('.stat.power .value');
            const mainMenuHashrateValue = document.querySelector('.stat.hashrate .value');
            const dashboardBtcMineProgress = document.querySelector('.total-btc-mine-progress');


            dashboardPowerValue.textContent = `${totalPower} W`;
            dashboardHashrateValue.textContent = `${toalHashrate} H/s`;
            mainMenuPowerValue.textContent = `${totalPower} W`;
            mainMenuHashrateValue.textContent = `${toalHashrate} H/s`;
            dashboardBtcMineProgress.style.width = `100%`;

        } else {

            const totalPowerProgress = document.querySelector('.total-power-progress');
            const totalHashrateProgress = document.querySelector('.total-hashrate-progress');
            const totalWorkloadProgress = document.querySelector('.total-workload-progress');
            const totalBtcMineProgress = document.querySelector('.total-btc-mine-progress');

            const dashboardPowerValue = document.querySelector('.total-power-value');
            const dashboardHashrateValue = document.querySelector('.total-hashrate-value');

            dashboardPowerValue.textContent = `0 W`;
            dashboardHashrateValue.textContent = `0 H/s`;

            totalBtcMineProgress.style.width = `0%`;
            totalPowerProgress.style.width = `0%`;
            totalHashrateProgress.style.width = `0%`;
            totalWorkloadProgress.style.width = `0%`;
        }
    }


    function startUpdatingProgress() {
        if (wallet_data.servers && Object.keys(wallet_data.servers).length > 0) {
            setInterval(() => {
                updateServerCardProgress();
                updateDashboardProgress();

            }, timeToResfreshProgressBar);
        }
    }

    async function loadShopServerCards() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            const servers = await response.json();

            console.log("Полученные данные из API:", servers);

            const serversShopBody = document.getElementById('servers-shop-body');
            serversShopBody.innerHTML = '';

            Object.keys(servers).forEach((serverId, index) => {
                const server = servers[serverId];
                const isSoldOut = server.specs.available === 0;
                const buttonClass = isSoldOut ? "sold-out-button" : "buy-new-server-button";
                const buttonText = isSoldOut ? "Sold Out" : "Buy";

                const cardHtml = `
                <div class="shop-server-card">
                    <div class="server-icon-and-name">
                        <img class="server-icon" src="web/Content/server-icon.png" alt="Server Icon">
                        <h2 class="server-name">${server.name}</h2>
                    </div>
                    <div class="server-stats">
                        <div class="power-stat">
                            <div class="power-stat-container">
                                <span class="power-stat-name">Power:</span>
                                <span class="power-stat-value">${server.specs.power} W</span>
                            </div>
                        </div>
                        <div class="hashrate-stat">
                            <div class="hashrate-stat-container">
                                <span class="hashrate-stat-name">Hashrate:</span>
                                <span class="hashrate-stat-value">${server.specs.hashrate} H/s</span>
                            </div>
                        </div>
                        <div class="gpu-name-stat">
                            <div class="gpu-name-stat-container">
                                <span class="gpu-name-stat-name">GPU Name:</span>
                                <span class="gpu-name-stat-value">${server.specs.gpu_name}</span>
                            </div>
                        </div>
                        <div class="gpu-count-stat">
                            <div class="gpu-count-stat-container">
                                <span class="gpu-count-stat-name">GPU Count:</span>
                                <span class="gpu-count-stat-value">${server.specs.gpu_count}</span>
                            </div>
                        </div>
                        <div class="ram-stat">
                            <div class="ram-stat-container">
                                <span class="ram-stat-name">RAM:</span>
                                <span class="ram-stat-value">${server.specs.ram} GB</span>
                            </div>
                        </div>
                        <div class="btc-mine-stat">
                            <div class="btc-mine-stat-container">
                                <span class="btc-mine-stat-name">Daily BTC Mine:</span>
                                <span class="btc-mine-stat-value">${server.btc_mine} BTC</span>
                            </div>
                        </div>
                        <div class="country-stat">
                            <div class="country-stat-container">
                                <span class="country-stat-name"> Region:</span>
                                <span class="country-stat-value">${getFlag(server.country)}</span>
                            </div>
                        </div>
                        <div class="availability-stat">
                            <div class="availability-stat-container">
                                <span class="availability-stat-name"> Available:</span>
                                <span class="availability-stat-value">${server.available}</span>
                            </div>
                        </div>
                        
                        <button class="${buttonClass}"
                                id="buy-new-server-button-${index + 1}"
                                data-server-id="${serverId}"
                                ${isSoldOut ? 'disabled' : ''}>${buttonText}<img src="web/Content/touch.png" alt="icon" class="buy-server-icon"></button>
                    </div>
                </div>
            `;
                serversShopBody.insertAdjacentHTML('beforeend', cardHtml);
            });
        } catch (error) {
            console.error("Ошибка загрузки данных с API:", error);
        }
    }


    async function setupBuyButtons() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            const servers = await response.json();

            const buyButtons = document.querySelectorAll(".buy-new-server-button");
            buyButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const serverKey = button.getAttribute("data-server-id");

                    if (!servers[serverKey]) {
                        showPopup("Shop is busy. 🛠", false);
                        return;
                    }

                    const message = JSON.stringify({
                        type: "miner",
                        data: {
                            server_id: serverKey,
                            wallet: wallet_data.wallet,
                            user_id: userId,
                            article: servers[serverKey]?.name,
                        }
                    });

                    tg.ready();
                    tg.sendData(message);

                    showPopup(`Transaction in progress. You will be redirected to Bot so your purchase can be processed!🔄`, true);

                    setTimeout(() => {
                        tg.close();
                    }, 500);
                });
            });
        } catch (error) {
            console.error("Ошибка загрузки данных с API:", error);
            showPopup("Please close your minning account and open it up again to get the your information UpToDate. 🛠", false);
        }
    }

    function getFlag(countryCode) {
        return `<img src="https://flagcdn.com/h40/${countryCode.toLowerCase()}.png" alt="${countryCode}" width="20" height="15">`;
    }

    async function loadServers() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status}`);
            }
            const apiData = await response.json();

            console.log("API Data:", apiData);

            const serversBody = document.getElementById("my-servers-body");
            const noServersMessage = document.getElementById("no-servers-message");
            const serverDetailsWrapper = document.getElementById("server-window-details-wrapper");
            const serverDetailsContent = document.getElementById("server-window-details-content");

            if (wallet_data.servers && Object.keys(wallet_data.servers).length > 0) {
                noServersMessage.classList.add("hidden");

                Object.keys(wallet_data.servers).forEach((serverKey, index) => {
                    const server = wallet_data.servers[serverKey];
                    if (!server) {
                        console.warn(`Сервер с ключом ${serverKey} отсутствует в данных.`);
                        return;
                    }

                    const {specs, country, name} = server;

                    const serverCard = document.createElement("div");
                    serverCard.className = "my-server-card";
                    serverCard.innerHTML = `
                    <div class="server-card-header">
                        <span class="server-index">#${index + 1}</span>
                       <span class="server-flag">${getFlag(country)}</span>
                    </div>
                    <div class="server-icon-and-name">
                        <img class="server-icon" src="web/Content/server-icon.png" alt="Server Icon">
                        <h2 class="server-name">${name}</h2>
                    </div>
                    <div class="server-stats">
                        <div class="power-stat">
                            <div class="power-stat-container">
                                <span class="power-stat-name">Power:</span>
                                <span class="power-stat-value">${specs.power} W</span>
                                <div class="power-progress-bar">
                                    <div class="power-progress" style="width: ${Math.min(specs.power / 16, 100)}%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="hashrate-stat">
                            <div class="hashrate-stat-container">
                                <span class="hashrate-stat-name">Hashrate:</span>
                                <span class="hashrate-stat-value">${specs.hashrate} H/s</span>
                                <div class="hashrate-progress-bar">
                                    <div class="hashrate-progress" style="width: ${Math.min(specs.hashrate / 12, 100)}%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="status-stat">
                            <div class="status-stat-container">
                                <span class="status-stat-name">RAM:</span>
                                <span class="status-stat-value">${specs.ram} GB</span>
                                <div class="status-progress-bar">
                                    <div class="status-progress" style="width: ${Math.min(specs.ram / 100, 100)}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="server-icon-container">
                        <img class="server-touch-icon" src="web/Content/touch.png" alt="Finger Icon">
                    </div>
                `;

                    serversBody.appendChild(serverCard);
                    totalBtcMine += server.btc_mine;

                    serverCard.addEventListener("click", () => {
                        showServerDetails(server, serverDetailsWrapper, serverDetailsContent);
                    });
                });
            } else {
                noServersMessage.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Ошибка загрузки серверов:", error);
        }
    }

    function showServerDetails(server, detailsContainer, detailsContent) {
        const wrapper = document.getElementById("server-window-details-wrapper");
        if (!detailsContent || !detailsContainer || !wrapper) {
            console.error("Missing details container or content element.");
            return;
        }

        const {specs, country, created_at, btc_mine, name} = server;
        const createdAt = new Date(created_at);
        let totalBTC = 0;

        // Функция для расчёта BTC с учётом времени
        function calculateBTC() {
            const nowUTC = new Date();
            const elapsedMilliseconds = nowUTC - createdAt;
            const elapsedDays = Math.floor(elapsedMilliseconds / (1000 * 3600 * 24));

            totalBTC = elapsedDays * btc_mine;

            const currentHour = nowUTC.getUTCHours();
            const currentMinutes = nowUTC.getUTCMinutes();
            const currentSeconds = nowUTC.getUTCSeconds();

            const elapsedTimeInToday = (currentHour * 3600 + currentMinutes * 60 + currentSeconds) / (24 * 3600);
            const todayBTC = btc_mine * elapsedTimeInToday;

            totalBTC += todayBTC;
        }

        // Первичная отрисовка деталей сервера
        detailsContent.innerHTML = `
        <div class="server-details-stats">
            <div class="server-details-header">
                <img class="server-details-icon" src="web/Content/server-icon.png" alt="Server Icon">
                <h2 class="server-details-name">${name || "Server"}</h2>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Total Mined:</span>
                <span class="stat-details-value total-mined">0.0000000 BTC</span>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Purchased On:</span>
                <span class="stat-details-value">${created_at ? new Date(created_at).toLocaleDateString() : "N/A"}</span>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Country:</span>
                <span class="stat-details-value">
                    <img src="https://flagcdn.com/h40/${country.toLowerCase()}.png" alt="${country}" class="flag-icon">
                </span>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Daily BTC Mine:</span>
                <span class="stat-details-value">${btc_mine.toFixed(4)} BTC</span>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Power:</span>
                <span class="stat-details-value">${specs.power} W</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="power-details-progress-bar">
                    <div class="power-details-progress"></div>
                </div>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">Hashrate:</span>
                <span class="stat-details-value">${specs.hashrate} H/s</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="hashrate-details-progress-bar">
                    <div class="hashrate-details-progress"></div>
                </div>
            </div>
            <div class="stat-details">
                <span class="stat-details-title">RAM:</span>
                <span class="stat-details-value">${specs.ram} GB</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="ram-details-progress-bar">
                    <div class="ram-details-progress"></div>
                </div>
            </div>
        </div>
    `;

        function updateDetails() {
            calculateBTC();

            // Обновление Total Mined
            const totalMinedElement = detailsContent.querySelector(".total-mined");
            if (totalMinedElement) {
                totalMinedElement.textContent = `${totalBTC.toFixed(7)} BTC`;
            }

            // Обновление прогресс-баров
            const powerProgress = detailsContent.querySelector(".power-details-progress");
            const hashrateProgress = detailsContent.querySelector(".hashrate-details-progress");
            const ramProgress = detailsContent.querySelector(".ram-details-progress");

            function getRandomValue(min, max) {
                return Math.random() * (max - min) + min;
            }

            if (powerProgress) {
                const powerWidth = getRandomValue(90, 100);
                powerProgress.style.width = `${powerWidth}%`;
            }
            if (hashrateProgress) {
                const hashrateWidth = getRandomValue(90, 100);
                hashrateProgress.style.width = `${hashrateWidth}%`;
            }
            if (ramProgress) {
                const ramWidth = getRandomValue(90, 100);
                ramProgress.style.width = `${ramWidth}%`;
            }
        }

        const interval = setInterval(updateDetails, 2000);

        detailsContainer.classList.remove("hidden");
        detailsContainer.style.display = "block";

        const closeButton = document.getElementById("close-server-details");
        closeButton.addEventListener("click", () => {
            detailsContainer.classList.add("hidden");
            detailsContainer.style.display = "none";
            clearInterval(interval);
        });

        // Первое обновление
        updateDetails();
    }

})
;
