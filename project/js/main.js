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
const initial_master_editor_plugin_data = [];

function CONVERT_EDITOR_JSON_TO_PARAMS(json) {
    const obj = {};
    const keys = Object.keys(json);
    keys.forEach((key) => {
        const data = json[key];
        if (data.gen) {
            if (data.list) {
                obj[key] = JSON.stringify(
                    data.list.map((arr_itm) => {
                        const gen = arr_itm.gen;
                        if (gen.no_struct) {
                            return gen.value;
                        } else {
                            const converted_gen = CONVERT_EDITOR_JSON_TO_PARAMS(gen);
                            return converted_gen;
                        }
                    })
                )
            } else {
                const no_struct = data.gen.no_struct;
                if (no_struct) {
                    const value = data.gen.value;
                    if (value) {
                        obj[key] = value.toString();
                    } else {
                        obj[key] = value;
                    }
                } else {
                    obj[key] = CONVERT_EDITOR_JSON_TO_PARAMS(data.gen);
                }
            }
        } else {
            if (data.value) {
                obj[key] = data.value.toString();
            } else {
                obj[key] = data.value;
            }
        }
    })
    return JSON.stringify(obj);
}

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
        preload.start();
        this._preload_mode = true;
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
        if (this._preload_mode) {
            requestAnimationFrame(this.onWindowLoad.bind(this));
            return;
        }
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
    }

    start() {
        this.drawLoadingScreen();
        this.generatePluginConfigList();
        this.generateImageList();
        this.generateAudioList();
        this.updateDataPreload();
    }

    async drawLoadingScreen() { }

    async generatePluginConfigList() {
        const preloader = this;
        preloader._generating_plugin_list = true;
        const url = `js/plugins/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            preloader._plugin_list = list_arr;
            preloader._generating_plugin_list = false;
        }
        xhr.onerror = async function () {
            preloader._generating_plugin_list = false;
        }
        await xhr.send();
    }

    async generateImageList() {
        const preloader = this;
        preloader._generating_image_list = true;
        const url = `img/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            preloader._image_list = list_arr;
            preloader._generating_image_list = false;
        }
        xhr.onerror = async function () {
            preloader._generating_image_list = false;
        }
        await xhr.send();
    }

    async generateAudioList() {
        const preloader = this;
        preloader._generating_audio_list = true;
        const url = `audio/_master_editor.txt`;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = async function () {
            const res_str = xhr.responseText;
            const list_arr = JSON.parse(res_str);
            preloader._audio_list = list_arr;
            preloader._generating_audio_list = false;
        }
        xhr.onerror = async function () {
            preloader._generating_audio_list = false;
        }
        await xhr.send();
    }

    generatingLists() {
        return (
            this._generating_audio_list ||
            this._generating_image_list ||
            this._generating_plugin_list
        )
    }

    async updateDataPreload() {
        if (this.generatingLists()) {
            requestAnimationFrame(this.updateDataPreload.bind(this));
            return;
        }
        if (await this.loadingPlugins()) {
            requestAnimationFrame(this.updateDataPreload.bind(this));
            return;
        }
        if (await this.loadingImages()) {
            requestAnimationFrame(this.updateDataPreload.bind(this));
            return;
        }
        if (await this.loadingSounds()) {
            requestAnimationFrame(this.updateDataPreload.bind(this));
            return;
        }
        this.endDataPreload();
    }

    async loadingPlugins() {
        const preloader = this;
        if (preloader._loading_plugin_data) {
            return true;
        }
        const src = `js/plugins/data`;
        if (preloader._plugin_list.length > 0) {
            const list_item = preloader._plugin_list.shift();
            if (!list_item) return false;
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `${src}/${list_item}.json`);
            xhr.onload = function () {
                const res_string = xhr.responseText;
                const res_json = JSON.parse(res_string);
                const param_str = CONVERT_EDITOR_JSON_TO_PARAMS(res_json);
                const parsed_editor_parameters = JSON.parse(param_str);
                initial_master_editor_plugin_data.push({ name: list_item.toLowerCase(), data: parsed_editor_parameters });
                preloader._loading_plugin_data = false;
            }
            xhr.onerror = function () {
                preloader._loading_plugin_data = false;
            }
            xhr.send();
            preloader._loading_plugin_data = true;
            return true;
        }
        return false;
    }

    async loadingImages() {
        const preloader = this;
        if (preloader._image_list.length > 0) {
            const list_item = preloader._image_list.shift();
            if (!list_item) return false;
            const img_src = document.createElement('img');
            img_src.src = list_item;
            document.head.appendChild(img_src);
            document.head.removeChild(img_src);
            return true;
        }
        return false;
    }

    async loadingSounds() {
        const preloader = this;
        if (this._loading_aud) {
            const aud = this._loading_aud;
            if (aud.readyState == 4) {
                document.head.removeChild(aud);
                this._loading_aud = null;
            } else {
                return;
            }
        }
        if (preloader._audio_list.length > 0) {
            const list_item = preloader._audio_list.shift();
            if (!list_item) return false;
            const aud_src = document.createElement('audio');
            aud_src.src = list_item;
            aud_src.preload = true;
            document.head.appendChild(aud_src);
            this._loading_aud = aud_src;
            return true;
        }
        return false;
    }

    endDataPreload() {
        this.erasePreloadScreen();
        main._preload_mode = false;
    }

    erasePreloadScreen() { }
}
const main = new Main();
const preload = new Preload();
main.run();

//-----------------------------------------------------------------------------
