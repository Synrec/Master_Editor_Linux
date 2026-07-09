const Synrec_Master_Editor = {};
Synrec_Master_Editor.src = `js/plugins/data`;
Synrec_Master_Editor.load_list = `js/plugins/_master_editor.txt`;
Synrec_Master_Editor.load_count = 0;
Synrec_Master_Editor.error_count = 0;
Synrec_Master_Editor.debug_scenes = 1;

function OBJECT_JSON_PARSER(json) {
    const obj = {};
    const keys = Object.keys(json);
    keys.forEach((key) => {
        const data = json[key];
        if (data.gen) {
            if (data.list) {
                obj[key] = data.list.map((arr_itm) => {
                    if (typeof arr_itm == 'string') {
                        return arr_itm;
                    }
                    return OBJECT_JSON_PARSER(arr_itm);
                })
            } else {
                if (typeof data.gen == 'string') {
                    return data.gen;
                } else {
                    return OBJECT_JSON_PARSER(data.gen);
                }
            }
        } else {
            obj[key] = data.value;
        }
    })
    return JSON.stringify(obj);
}

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

async function GET_MASTER_EDITOR_PARAMETERS(file_name, original_parameters) {
    Synrec_Master_Editor.plugin_data[file_name] = { loaded: false, data: null };
    const src = Synrec_Master_Editor.src;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${src}/${file_name}.json`);
    xhr.onload = async function () {
        const res_string = xhr.responseText;
        const res_json = JSON.parse(res_string);
        const param_str = CONVERT_EDITOR_JSON_TO_PARAMS(res_json);
        Synrec_Master_Editor.plugin_data[file_name].data = param_str;
        const parsed_editor_parameters = JSON.parse(param_str);
        PluginManager.setParameters(file_name, parsed_editor_parameters);
        await RELOAD_RPG_MAKER_PLUGINS();
        Synrec_Master_Editor.load_count++;
    }
    xhr.onerror = async function () {
        Synrec_Master_Editor.load_count++;
    }
    await xhr.send();
}

async function RELOAD_RPG_MAKER_PLUGINS() {
    const scene = SceneManager._scene;
    if (scene) {
        scene.synrecPluginReload();
    } else {
        requestAnimationFrame(RELOAD_RPG_MAKER_PLUGINS);
    }
}

async function LOAD_MASTER_EDITOR_SETTINGS() {
    Synrec_Master_Editor.load_count = 0;
    Synrec_Master_Editor.plugin_data = {};
    const plugin_list = PluginManager._scripts.map((name) => {
        return name || "";
    });
    const parameters = PluginManager._parameters;
    plugin_list.forEach(async (file_name) => {
        if (file_name == "Synrec_Master_Editor") return;
        const original_parameters = parameters[file_name];
        await GET_MASTER_EDITOR_PARAMETERS(file_name, original_parameters);
    })
}

LOAD_MASTER_EDITOR_SETTINGS();

async function INITIALIZE_MASTER_EDITOR() {
    const plugin_count = PluginManager._scripts.length;
    const loaded = Synrec_Master_Editor.load_count;
    if (loaded >= plugin_count) {
        TriggerRefresh();
    } else {
        requestAnimationFrame(INITIALIZE_MASTER_EDITOR);
    }
}

INITIALIZE_MASTER_EDITOR();

function TriggerRefresh() {
    if (typeof SceneManager == 'undefined') {
        console.error(`SceneManager is not defined. Likely called too early or erased.`);
        return;
    }
    LOAD_MASTER_EDITOR_SETTINGS();
    const scene = SceneManager._scene;
    if (scene) {
        scene.synrecPluginReload();
    }
}

function WindowSynrec_DebugList() {
    this.initialize(...arguments);
}

WindowSynrec_DebugList.prototype = Object.create(Window_Selectable.prototype);
WindowSynrec_DebugList.prototype.constructor = WindowSynrec_DebugList;

WindowSynrec_DebugList.prototype.initialize = function () {
    const w = Graphics.width / 3;
    const h = Graphics.height * 0.5;
    const x = (Graphics.width * 0.5) - (w * 0.5);
    const y = (Graphics.height * 0.5) - (h * 0.5);
    const rect = new Rectangle(x, y, w, h);
    const mz_mode = Utils.RPGMAKER_NAME == "MZ";
    this._list = [];
    if (mz_mode) {
        Window_Selectable.prototype.initialize.call(this, rect);
    } else {
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
    }
    this.select(0);
    this.refresh();
}

WindowSynrec_DebugList.prototype.maxItems = function () {
    return this._list.length || 0;
}

WindowSynrec_DebugList.prototype.generateList = function () {
    const list = this._list;
    list.unshift({ name: "DEFAULT", icon: 0, scene: Scene_Debug, label: "" });
    /**
     * Alias and use the array push function to add your debug scenes
     * to the list.
     */
}

WindowSynrec_DebugList.prototype.drawItem = function (index) {
    const rect = this.itemRect(index);
    const data = this._list[index];
    if (!data) return;
    const name = data.name;
    const icon = data.icon;
    if (icon) {
        this.drawTextEx(`\I[${icon}] ${name}`, rect.x, rect.y);
    } else {
        this.drawText(`${name}`, rect.x, rect.y, rect.width, 'center');
    }
}

WindowSynrec_DebugList.prototype.selectionScene = function () {
    const index = this.index();
    const list = this._list;
    const data = list[index];
    if (!data) return null;
    return data.scene;
}

WindowSynrec_DebugList.prototype.refresh = function () {
    this.generateList();
    Window_Selectable.prototype.refresh.call(this, ...arguments);
}

Scene_Base.prototype.reloadSynScene = function () {
    this.children.forEach((child) => {
        child.parent.removeChild(child);
        if (child.destroy) {
            child.destroy();
        }
    })
    if ($gameParty) {
        if ($gameParty.inBattle()) {
            $gameParty.allMembers().concat($gameTroop.members()).forEach((mem) => {
                mem.recoverAll();
                mem.refresh();
            })
            $gameTroop._turnCount = 0;
        }
    }
    this.initialize();
    this.create();
    Graphics.startLoading();
}

Scene_Base.prototype.synrecPluginReload = function () {
    //Call the alias function after your own function for proper reload.
    this.reloadSynScene();
    /**
     * Alias this function in your own plugin.
     * On call, it must reload the plugin parameters into the variable or object
     * you have set for your plugin.
     * 
     * If not aliased, if the plugin parameters are directly referenced, it will 
     * use the editor parameters regardless
     */
}

_SYN_ALIAS_ScnMap_UpdtCallDebug = Scene_Map.prototype.updateCallDebug;
Scene_Map.prototype.updateCallDebug = function () {
    if (this.isDebugCalled() && Synrec_Master_Editor.debug_scenes > 0) {
        SceneManager.push(SceneSynrec_ExtraDebug);
        return;
    }
    _SYN_ALIAS_ScnMap_UpdtCallDebug.call(this, ...arguments);
}

function SceneSynrec_ExtraDebug() {
    this.initialize(...arguments);
}

SceneSynrec_ExtraDebug.prototype = Object.create(Scene_Base.prototype);
SceneSynrec_ExtraDebug.prototype.constructor = SceneSynrec_ExtraDebug;

SceneSynrec_ExtraDebug.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBlackBackground();
    this.createWindowLayer();
    this.createWindowList();
}

SceneSynrec_ExtraDebug.prototype.createBlackBackground = function () {
    const sprite = new Sprite();
    sprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    sprite.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, "#000000");
    this.addChild(sprite);
    this._background = sprite;
}

SceneSynrec_ExtraDebug.prototype.createWindowList = function () {
    const window = new WindowSynrec_DebugList();
    window.setHandler(`ok`, this.confirmScene.bind(this));
    window.setHandler(`cancel`, this.popScene.bind(this));
    this.addWindow(window);
    this._debug_list_window = window;
}

SceneSynrec_ExtraDebug.prototype.confirmScene = function () {
    const list_window = this._debug_list_window;
    const scene_class = list_window.selectionScene();
    SceneManager.push(scene_class);
}