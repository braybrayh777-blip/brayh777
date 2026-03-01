(async function() {
    const scripts = [
        "emulator.js",
        "nipplejs.js",
        "shaders.js",
        "storage.js",
        "gamepad.js",
        "GameManager.js",
        "socket.io.min.js"
        // Removed "compression.js" - we don't need it (cores are pre-decoded)
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

    // Skip report JSON and compression (we use pre-decoded Blobs)
    console.log("Skipped broken report JSON and compression fetches");

    const config = {};
    config.gameUrl = window.EJS_gameUrl;
    config.dataPath = scriptPath;
    config.system = window.EJS_core;
    config.gameName = window.EJS_gameName;
    config.color = window.EJS_color;
    config.adUrl = window.EJS_AdUrl;
    config.adMode = window.EJS_AdMode;
    config.adTimer = window.EJS_AdTimer;
    config.adSize = window.EJS_AdSize;
    config.alignStartButton = window.EJS_alignStartButton;
    config.VirtualGamepadSettings = window.EJS_VirtualGamepadSettings;
    config.buttonOpts = window.EJS_Buttons;
    config.volume = window.EJS_volume;
    config.defaultControllers = window.EJS_defaultControls;
    config.startOnLoad = window.EJS_startOnLoaded;
    config.fullscreenOnLoad = window.EJS_fullscreenOnLoaded;
    config.filePaths = window.EJS_paths;
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
    config.forceLegacyCores = true;  // Added: force legacy mode for your blobs
    config.noAutoFocus = window.EJS_noAutoFocus;
    config.videoRotation = window.EJS_videoRotation;
    config.hideSettings = window.EJS_hideSettings;
    config.shaders = Object.assign({}, window.EJS_SHADERS, window.EJS_shaders || {});

    // Force use of your pre-decoded Blobs (bypass all fetches)
    if (window.EJS_mgbaLegacyData) config.coreData = window.EJS_mgbaLegacyData;
    if (window.EJS_mgbaLegacyJs)   config.coreJs   = window.EJS_mgbaLegacyJs;
    if (window.EJS_mgbaLegacyWasm) config.coreWasm = window.EJS_mgbaLegacyWasm;

    // Disable broken report fetch
    config.disableCoreReports = true;

    try {
        window.EJS_emulator = new EmulatorJS(EJS_player, config);
        console.log('EmulatorJS instantiated successfully');
        console.log('EJS_emulator keys:', Object.keys(window.EJS_emulator || {}));
        console.log('Has start after creation?:', typeof window.EJS_emulator?.start === 'function');
    } catch (err) {
        console.error('EmulatorJS instantiation failed:', err);
    }

    // Polling for start (better than fixed timeout)
    let startPoll = setInterval(() => {
        if (window.EJS_emulator && typeof window.EJS_emulator.start === 'function') {
            window.EJS_emulator.start();
            console.log('Game forced to start successfully');
            clearInterval(startPoll);
        } else {
            console.warn('Start method not available yet - polling');
        }
    }, 1000);

    setTimeout(() => {
        clearInterval(startPoll);
        console.error('Start polling timed out after 30s');
    }, 30000);

    // Optional event listeners
    if (typeof window.EJS_ready === "function") {
        window.EJS_emulator.on("ready", window.EJS_ready);
    }
    if (typeof window.EJS_onGameStart === "function") {
        window.EJS_emulator.on("start", window.EJS_onGameStart);
    }
})();
