//=============================================================================
// main.js v1.4.4
//=============================================================================

const scriptUrls = [
    "js/libs/pixi.js",
    "js/libs/pako.min.js",
    "js/libs/localforage.min.js",
    "js/libs/effekseer.min.js",
    "js/libs/vorbisdecoder.js",
    "js/rmmz_core.js",
    "js/rmmz_managers.js",
    "js/rmmz_objects.js",
    "js/rmmz_scenes.js",
    "js/rmmz_sprites.js",
    "js/rmmz_windows.js",
    "js/plugins.js"
];
const effekseerWasmUrl = "js/libs/effekseer.wasm";

class Main {
    constructor() {
        this.xhrSucceeded = false;
        this.loadCount = 0;
        this.error = null;
    }

    run() {
        this.showLoadingSpinner();
        this.testXhr();
        this.hookNwjsClose();
        this.loadMainScripts();
    }

    showLoadingSpinner() {
        const loadingSpinner = document.createElement("div");
        const loadingSpinnerImage = document.createElement("div");
        loadingSpinner.id = "loadingSpinner";
        loadingSpinnerImage.id = "loadingSpinnerImage";
        loadingSpinner.appendChild(loadingSpinnerImage);
        document.body.appendChild(loadingSpinner);
    }

    eraseLoadingSpinner() {
        const loadingSpinner = document.getElementById("loadingSpinner");
        if (loadingSpinner) {
            document.body.removeChild(loadingSpinner);
        }
    }

    testXhr() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", document.currentScript.src);
        xhr.onload = () => (this.xhrSucceeded = true);
        xhr.send();
    }

    hookNwjsClose() {
        // [Note] When closing the window, the NW.js process sometimes does
        //   not terminate properly. This code is a workaround for that.
        if (typeof nw === "object") {
            nw.Window.get().on("close", () => nw.App.quit());
        }
    }

    loadMainScripts() {
        for (const url of scriptUrls) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            script.async = false;
            script.defer = true;
            script.onload = this.onScriptLoad.bind(this);
            script.onerror = this.onScriptError.bind(this);
            script._url = url;
            document.body.appendChild(script);
        }
        this.numScripts = scriptUrls.length;
        window.addEventListener("load", this.onWindowLoad.bind(this));
        window.addEventListener("error", this.onWindowError.bind(this));
    }

    onScriptLoad() {
        if (++this.loadCount === this.numScripts) {
            PluginManager.setup($plugins);
        }
    }

    onScriptError(e) {
        this.printError("Failed to load", e.target._url);
    }

    printError(name, message) {
        this.eraseLoadingSpinner();
        if (!document.getElementById("errorPrinter")) {
            const errorPrinter = document.createElement("div");
            errorPrinter.id = "errorPrinter";
            errorPrinter.innerHTML = this.makeErrorHtml(name, message);
            document.body.appendChild(errorPrinter);
        }
    }

    makeErrorHtml(name, message) {
        const nameDiv = document.createElement("div");
        const messageDiv = document.createElement("div");
        nameDiv.id = "errorName";
        messageDiv.id = "errorMessage";
        nameDiv.innerHTML = name;
        messageDiv.innerHTML = message;
        return nameDiv.outerHTML + messageDiv.outerHTML;
    }

    onWindowLoad() {
        if (!this.xhrSucceeded) {
            const message = "Your browser does not allow to read local files.";
            this.printError("Error", message);
        } else if (this.isPathRandomized()) {
            const message = "Please move the Game.app to a different folder.";
            this.printError("Error", message);
        } else if (this.error) {
            this.printError(this.error.name, this.error.message);
        } else {
            this.initEffekseerRuntime();
        }
    }

    onWindowError(event) {
        if (!this.error) {
            this.error = event.error;
        }
    }

    isPathRandomized() {
        // [Note] We cannot save the game properly when Gatekeeper Path
        //   Randomization is in effect.
        return (
            typeof process === "object" &&
            process.mainModule.filename.startsWith("/private/var")
        );
    }

    initEffekseerRuntime() {
        const onLoad = this.onEffekseerLoad.bind(this);
        const onError = this.onEffekseerError.bind(this);
        effekseer.initRuntime(effekseerWasmUrl, onLoad, onError);
    }

    onEffekseerLoad() {
        this.eraseLoadingSpinner();
        SceneManager.run(Scene_Boot);
    }

    onEffekseerError() {
        this.printError("Failed to load", effekseerWasmUrl);
    }
}

class Preload {
    constructor() {
        this._plugin_list = [];
        this._image_list = [];
        this._audio_list = [];
        this.startDataPreload();
    }

    startDataPreload() {
        this.drawLoadingScreen();
        this.generatePluginConfigList();
        this.generateImageList();
        this.generateAudioList();
    }

    async drawLoadingScreen() { }

    async generatePluginConfigList() {
        this._generating_plugin_list = true;
        const url = `js/plugins/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            this._plugin_list = list_arr;
            this._generating_plugin_list = false;
        }
        xhr.onerror = async function () {
            this._generating_plugin_list = false;
        }
        await xhr.send();
    }

    async generateImageList() {
        this._generating_image_list = true;
        const url = `img/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            this._image_list = list_arr;
            this._generating_image_list = false;
        }
        xhr.onerror = async function () {
            this._generating_image_list = false;
        }
        await xhr.send();
    }

    async generateAudioList() {
        this._generating_audio_list = true;
        const url = `img/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            this._audio_list = list_arr;
            this._generating_audio_list = false;
        }
        xhr.onerror = async function () {
            this._generating_audio_list = false;
        }
        await xhr.send();
    }

    updateDataPreload() {
        if (this.generatingLists()) {
            requestAnimationFrame(this.updateDataPreload);
            return;
        }
        if (this.loadingPlugins()) {
            requestAnimationFrame(this.updateDataPreload);
            return;
        }
        if (this.loadingImages()) {
            requestAnimationFrame(this.updateDataPreload);
            return;
        }
        if (this.loadingSounds()) {
            requestAnimationFrame(this.updateDataPreload);
            return;
        }
        this.endDataPreload();
    }

    endDataPreload() {
        this.erasePreloadScreen();
        main.run();
    }

    erasePreloadScreen() { }
}

const main = new Main();
const preload = new Preload();
// main.run();

//-----------------------------------------------------------------------------
