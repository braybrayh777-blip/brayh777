(async function() {
    const scripts = [
        "emulator.js",
        "nipplejs.js",
        "shaders.js",
        "storage.js",
        "gamepad.js",
        "GameManager.js",
        "socket.io.min.js",
        "compression.js"
    ];

    const folderPath = (path) => path.substring(0, path.length - path.split("/").pop().length);
    let scriptPath = (typeof window.EJS_pathtodata === "string") ? window.EJS_pathtodata : folderPath((new URL(document.currentScript.src)).pathname);
    if (!scriptPath.endsWith("/")) scriptPath += "/";

    function loadScript(file) {
        return new Promise(function(resolve) {
            let script = document.createElement("script");
            script.src = scriptPath + (file.endsWith("emulator.min.js") ? file : "src/" + file);
            script.onload = resolve;
            script.onerror = () => {
                console.warn("Failed to load script: " + file + " - skipping");
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    function loadStyle(file) {
        return new Promise(function(resolve) {
            let css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = scriptPath + file;
            css.onload = resolve;
            css.onerror = () => {
                console.warn("Failed to load style: " + file + " - skipping");
                resolve();
            };
            document.head.appendChild(css);
        });
    }

    // Load the main files
    await loadScript("emulator.min.js");
    await loadStyle("emulator.min.css");

    // Skip compression and report fetches entirely
    // We already have the Blobs injected, so no need for extract7z.js or reports

    const config = {};
    config.gameUrl = window.EJS_gameUrl;
    config.dataPath = scriptPath;
    config.system = window.EJS_core;
    config.gameName = window.EJS_gameName;
    config.color = window.EJS_color || "#000000";
    config.adUrl = window.EJS_AdUrl;
    config.adMode = window.EJS_AdMode;
    config.adTimer = window.EJS_AdTimer;
    config.adSize = window.EJS_AdSize;
    config.alignStartButton = window.EJS_alignStartButton;
    config.VirtualGamepadSettings = window.EJS_VirtualGamepadSettings;
    config.buttonOpts = window.EJS_Buttons;
    config.volume = window.EJS_volume;
    config.defaultControllers = window.EJS_defaultControls;
    config.startOnLoad = window.EJS_startOnLoaded || false;
    config.fullscreenOnLoad = window.EJS_fullscreenOnLoaded || false;
    config.filePaths = window.EJS_paths || {};
    config.loadState = window.EJS_loadStateURL;
    config.cacheLimit = window.EJS_CacheLimit;
    config.cheats = window.EJS_cheats;
    config.defaultOptions = window.EJS_defaultOptions;
    config.gamePatchUrl = window.EJS_gamePatchUrl;
    config.gameParentUrl = window.EJS_gameParentUrl;
    config.netplayUrl = window.EJS_netplayServer;
    config.gameId = window.EJS_gameID;
    config.backgroundImg = window.EJS_backgroundImage;
    config.backgroundBlur = window.EJS_backgroundBlur;
    config.backgroundColor = window.EJS_backgroundColor;
    config.controlScheme = window.EJS_controlScheme;
    config.threads = window.EJS_threads;
    config.disableCue = window.EJS_disableCue;
    config.startBtnName = window.EJS_startButtonName;
    config.softLoad = window.EJS_softLoad;
    config.capture = window.EJS_screenCapture;
    config.externalFiles = window.EJS_externalFiles;
    config.dontExtractBIOS = window.EJS_dontExtractBIOS;
    config.disableDatabases = window.EJS_disableDatabases;
    config.disableLocalStorage = window.EJS_disableLocalStorage;
    config.forceLegacyCores = window.EJS_forceLegacyCores;
    config.noAutoFocus = window.EJS_noAutoFocus;
    config.videoRotation = window.EJS_videoRotation;
    config.hideSettings = window.EJS_hideSettings;
    config.shaders = Object.assign({}, window.EJS_SHADERS, window.EJS_shaders || {});

    // Force-use pre-injected Blobs (bypass any fetch attempts)
    if (window.EJS_mgbaLegacyData) config.coreData = window.EJS_mgbaLegacyData;
    if (window.EJS_mgbaLegacyJs) config.coreJs = window.EJS_mgbaLegacyJs;
    if (window.EJS_mgbaLegacyWasm) config.coreWasm = window.EJS_mgbaLegacyWasm;

    // Disable broken report fetch
    config.disableCoreReports = true;

    // Language fallback (skip fetch if not needed)
    config.language = "en-US";

    window.EJS_emulator = new EmulatorJS(EJS_player, config);
    window.EJS_adBlocked = (url, del) => window.EJS_emulator.adBlocked(url, del);

    // Force start after a short delay (bypasses timing issues)
    setTimeout(() => {
        if (window.EJS_emulator && typeof window.EJS_emulator.start === 'function') {
            window.EJS_emulator.start();
            console.log('Game forced to start');
        } else {
            console.warn('Start method not available yet');
        }
    }, 8000);

    // Optional: Listen for ready/start events
    if (typeof window.EJS_ready === "function") {
        window.EJS_emulator.on("ready", window.EJS_ready);
    }
    if (typeof window.EJS_onGameStart === "function") {
        window.EJS_emulator.on("start", window.EJS_onGameStart);
    }
})();
