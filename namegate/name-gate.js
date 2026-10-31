(() => {
    "use strict";
    const gate = document.getElementById("name-gate");
    const connected = document.getElementById("name-gate-connected");
    const entry = document.getElementById("name-gate-entry");
    const value = document.getElementById("name-gate-value");
    if (!gate || !connected || !entry || !value) return;
    const MAX_LENGTH = 12;
    let phase = "connected";
    let typed = "";
    let finished = false;
    let fullscreenRequested = false;
    const mobileInput = document.getElementById("name-gate-mobile-input");
    const saveSound = new Audio("assets/fornic/sounds/snd_save.wav");
    saveSound.preload = "auto";
    function requestGateFullscreen() {
        if (fullscreenRequested || document.fullscreenElement) return;
        fullscreenRequested = true;
        const request = document.documentElement.requestFullscreen;
        if (typeof request !== "function") return;
        try {
            const result = request.call(document.documentElement);
            if (result && typeof result.catch === "function") result.catch(() => {});
        } catch (_) {}
    }
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function renderName() {
        const shown = typed.toUpperCase();
        const blanks = "_".repeat(Math.max(0, MAX_LENGTH - shown.length));
        value.textContent = shown + blanks;
    }
    async function unlock(name) {
        if (finished) return;
        finished = true;
        try {
            saveSound.currentTime = 0;
            saveSound.volume = 0.9;
            saveSound.play().catch(() => {});
        } catch (_) {}
        gate.style.transition = "none";
        gate.style.background = "#000";
        gate.innerHTML = "";
        await wait(850);
        const destinations = {
            nic: "fornic/index.html",
            lopati: "forlopati/index.html",
            jordan: "jordanspage/index.html"
        };
        if (destinations[name]) {
            try { sessionStorage.setItem("sonnersdt-approved-name", name); } catch (_) {}
            window.name = "sonnersdt:" + name;
            window.location.replace(destinations[name]);
            return;
        }

    }
    function reject() {
        if (finished) return;
        finished = true;
        try {
            window.open("", "_self");
            window.close();
        } catch (_) {}
        setTimeout(() => {
            try {
                window.location.replace("about:blank");
            } catch (_) {
                document.documentElement.innerHTML = "";
            }
        }, 120);
    }
    function onKeyDown(event) {
        if (!document.body.classList.contains("name-gate-active")) return;
        requestGateFullscreen();
        if (event.target === mobileInput) {
            if (event.key === "Enter") {
                event.preventDefault();
                const name = typed.trim().toLowerCase();
                if (["nic", "lopati", "jordan"].includes(name)) unlock(name); else reject();
            }
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (phase !== "entry" || finished) return;
        if (event.key === "Backspace") {
            typed = typed.slice(0, -1);
            renderName();
            return;
        }
        if (event.key === "Enter") {
            const name = typed.trim().toLowerCase();
            if ([ "nic", "lopati", "jordan" ].includes(name)) unlock(name); else reject();
            return;
        }
        if (/^[a-zA-Z]$/.test(event.key) && typed.length < MAX_LENGTH) {
            typed += event.key;
            renderName();
        }
    }
    document.addEventListener("keydown", onKeyDown, true);
    if (mobileInput) {
        mobileInput.addEventListener("input", () => {
            if (phase !== "entry" || finished) return;
            typed = mobileInput.value.replace(/[^a-z]/gi, "").slice(0, MAX_LENGTH);
            mobileInput.value = typed;
            renderName();
        });
        gate.addEventListener("pointerdown", (event) => {
            if (phase === "entry" && !finished && event.pointerType !== "mouse") {
                mobileInput.focus();
            }
        });
    }
    renderName();
    setTimeout(() => {
        if (finished) return;
        connected.classList.add("hidden");
        entry.classList.remove("hidden");
        phase = "entry";
    }, 1500);
})();
