const { add, div } = require("three/tsl");
const os = require("os");

effekseer.initRuntime(effekseer_WasmUrl, () => { }, () => { });

function CreatePluginListButton(name, list_div) {
    const button_div = document.createElement('div');
    button_div.id = "plugin-load-button-div";
    button_div.className = "plugin-load-button-div";
    list_div.appendChild(button_div);
    const button = document.createElement('button');
    button.id = "plugin-load-button";
    button.className = "plugin-load-button";
    button.textContent = name.slice(0, name.indexOf(`.`));
    button.onclick = function () {
        DrawPluginMainParameters(name);
        const test_window = this._test_window;
        if (test_window) {
            if (test_window.closed) {
                this._test_window = null;
            } else {
                if (test_window.TriggerRefresh) {
                    test_window.TriggerRefresh();
                }
            }
        }
    }
    button_div.appendChild(button);
}

function GetDataFromNavigation(navigation, plugin_json) {
    let target = plugin_json;
    for (let i = 0; i < navigation.length; i++) {
        const nav_data = navigation[i];
        const name = nav_data.name;
        target = target[name];
        const list = target.list;
        const index = eval(nav_data.index);
        if (list && !isNaN(index)) {
            target = list[index];
            if (target.gen) {
                target = target.gen;
            }
        } else if (target.gen) {
            target = target.gen;
        }
    }
    return target.value;
}

async function CreateStructParam(param, navigation, plugin_name, plugin_json, last_struct_div) {
    const display_area = document.getElementById(`display-area`);
    let last_display = "none";
    if (last_struct_div) {
        last_display = JSON.parse(JSON.stringify(last_struct_div.style.display));
        last_struct_div.style.display = 'none';
    } else {
        last_display = JSON.parse(JSON.stringify(display_area.style.display))
        display_area.style.display = 'none';
    }
    const display_parent = display_area.parentElement;
    const struct_container = document.createElement('div');
    struct_container.id = `struct-container-div`;
    struct_container.className = `struct-container-div`;
    display_parent.appendChild(struct_container);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "struct-blocks-div"
    struct_container.appendChild(ctrl_div);
    const back_button = document.createElement('button');
    back_button.id = `struct-back-button`;
    back_button.className = `struct-back-button`;
    back_button.textContent = "GO BACK";
    back_button.onclick = function () {
        if (last_struct_div) {
            last_struct_div.style.display = last_display;
        } else {
            display_area.style.display = last_display;
        }
        if (struct_container.parentElement) {
            struct_container.parentElement.removeChild(struct_container);
        }
        if (struct_container.parentElement) {
            struct_container.parentElement.remove();
        }
    }
    ctrl_div.appendChild(back_button);
    const struct_name_div = document.createElement('div');
    struct_name_div.className = `struct-name-div`;
    struct_name_div.textContent = param.alias || param.name;
    ctrl_div.appendChild(struct_name_div);
    const struct_param_edit_div = document.createElement('div');
    struct_param_edit_div.id = `struct-edit-div`;
    struct_param_edit_div.className = `struct-edit-div`;
    struct_container.appendChild(struct_param_edit_div);
    const param_list_div = document.createElement('div');
    param_list_div.id = `struct-param-list-div`;
    param_list_div.className = `struct-param-list-div`;
    struct_param_edit_div.appendChild(param_list_div);
    const file_name = plugin_name.slice(0, plugin_name.indexOf('.'));
    const plugin_obj = await LoadPluginObjectFromFile(file_name);
    const struct_name = GetStructName(param.type);
    const struct = plugin_obj.structs.find((obj) => {
        return obj.name == struct_name;
    })
    if (!struct) {
        console.log(struct_name, plugin_obj.structs)
        console.error(`Unable to find struct data for ${param.name}`);
        return;
    }
    // const project_json = await LoadProjectPluginJsonFile(file_name);
    const params = struct.params;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const button = document.createElement('button');
        button.id = "struct-parameter-button";
        button.className = "struct-parameter-button";
        button.textContent = param.alias || param.name;
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = param.desc || "No Description.";
        }
        button.onclick = function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            CreateStructParamDisplay(param, copy_nav, plugin_name, plugin_json, struct_container);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        param_list_div.appendChild(button);
    }
    const struct_display_area = document.createElement('div');
    struct_display_area.id = `struct-display-area`;
    struct_display_area.className = `struct-display-area`;
    struct_display_area.textContent = "Select a parameter to edit."
    struct_param_edit_div.appendChild(struct_display_area);
}

function CreateStructParamDisplay(param, navigation, plugin_name, plugin_json, struct_container) {
    const param_div = document.createElement('div');
    param_div.id = "param-edit-div";
    param_div.className = "param-edit-div";
    const display_areas = document.getElementsByClassName(`struct-display-area`);
    if (display_areas.length > 0) {
        const index = display_areas.length - 1;
        const display_area = display_areas[index];
        if (display_area) {
            display_area.innerHTML = "";
            display_area.style.display = 'flex';
            display_area.appendChild(param_div);
        }
    }
    const type = param.type || "text";
    const nav = navigation[navigation.length - 1];
    const old_name = nav.name;
    if (
        param.is_array &&
        (
            isNaN(nav.index) ||
            old_name != param.name
        )
    ) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'array', array: true });
        CreateParamArrayDisplay(param, navigation, plugin_name, plugin_json, struct_container);
        return;
    }
    if (type.match(/(struct)<(\S+)>/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'struct', array: false })
        CreateStructParam(param, navigation, plugin_name, plugin_json, struct_container);
        return;
    }
    if (type.match(/(text)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'text', array: false })
        CreateTextParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(note)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'note', array: false })
        CreateNoteParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(number)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'number', array: false })
        CreateNumberParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(select)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'number', array: false })
        CreateSelectParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(animation)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'animation', array: false })
        CreateAnimationParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(actor)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'actor', array: false })
        CreateActorParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(class)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'class', array: false })
        CreateClassParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(skill)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'skill', array: false })
        CreateSkillParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(item)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'item', array: false })
        CreateItemParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(weapon)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'weapon', array: false })
        CreateWeaponParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(armor)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'armor', array: false })
        CreateArmorParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(enemy)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'enemy', array: false })
        CreateEnemyParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(troop)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'troop', array: false })
        CreateTroopParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(state)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'state', array: false })
        CreateStateParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(tileset)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'tileset', array: false })
        CreateTilesetParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(common_event)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'common_event', array: false })
        CreateCommonEventParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(switch)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'switch', array: false })
        CreateSwitchParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(variable)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'variable', array: false })
        CreateVariableParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(map)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'map', array: false })
        CreateMapParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(file)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'file', dir: param.dir, array: false })
        CreateFileParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(boolean)/gmi)) {
        if (old_name != param.name) navigation.push({ name: param.name, type: 'file', dir: param.dir, array: false })
        CreateBooleanParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
}

function CreateTextParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const text_label = document.createElement('label');
    text_label.className = `text-edit-label`;
    text_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(text_label);
    const text_input = document.createElement('input');
    text_input.className = `text-edit-input`;
    text_input.value = GetDataFromNavigation(navigation, plugin_json);
    text_input.oninput = async function () {
        const value = text_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(text_input);
    const text_reset = document.createElement(`button`);
    text_reset.className = `edit-reset-button`;
    text_reset.textContent = 'RESET';
    text_reset.onclick = async function () {
        const original_value = param.default;
        text_input.value = original_value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            target = target[name];
            if (nav_data.array) {
                const index = eval(nav_data.index);
                target = target[index];
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = original_value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(text_reset);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateNoteParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const note_label = document.createElement('label');
    note_label.className = `note-edit-label`;
    note_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(note_label);
    const note_input = document.createElement('textArea');
    note_input.className = `note-edit-input`;
    note_input.value = GetDataFromNavigation(navigation, plugin_json);;
    note_input.oninput = async function () {
        const value = note_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(note_input);
    const note_reset = document.createElement(`button`);
    note_reset.className = `edit-reset-button`;
    note_reset.textContent = 'RESET';
    note_reset.onclick = async function () {
        const original_value = param.default;
        text_input.value = original_value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            target = target[name];
            if (nav_data.array) {
                const index = eval(nav_data.index);
                target = target[index];
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = original_value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(note_reset);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateNumberParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const number_label = document.createElement('label');
    number_label.className = `number-edit-label`;
    number_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(number_label);
    const number_input = document.createElement('input');
    number_input.className = `number-edit-input`;
    number_input.value = GetDataFromNavigation(navigation, plugin_json);;
    number_input.type = "number";
    number_input.oninput = async function () {
        const value = number_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(number_input);
    const text_reset = document.createElement(`button`);
    text_reset.className = `edit-reset-button`;
    text_reset.textContent = 'RESET';
    text_reset.onclick = async function () {
        const original_value = param.default;
        number_input.value = original_value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            target = target[name];
            if (nav_data.array) {
                const index = eval(nav_data.index);
                target = target[index];
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = original_value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(text_reset);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateSelectParam(div, param, navigation, plugin_json, plugin_name) {
    const options = param.options;
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const select_label = document.createElement('label');
    select_label.className = `selection-edit-label`;
    select_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(select_label);
    const select_input = document.createElement('select');
    select_input.id = "selection-edit-selector";
    select_input.className = "selection-edit-selector";
    const selection = GetDataFromNavigation(navigation, plugin_json);
    const selc_opt = options.find((opt) => {
        return opt.value == selection;
    })
    select_input.selected = options.indexOf(selc_opt);
    select_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = options[index] ? options[index].value : null;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(select_input);
    for (let i = 0; i < options.length; i++) {
        const opt_obj = options[i];
        const opt_div = document.createElement('option');
        if (opt_obj) {
            opt_div.selected = select_input.selected == i;
            opt_div.value = opt_obj.value;
            opt_div.textContent = opt_obj.name;
        }
        select_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateAnimationParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const animations_file = fs.readFileSync(`${base_path}/project/data/Animations.json`, 'utf8');
    const animations_json = JSON.parse(animations_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const anim_label = document.createElement('label');
    anim_label.className = `animation-edit-label`;
    anim_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(anim_label);
    const animation_input = document.createElement('select');
    animation_input.className = `animation-edit-input`;
    animation_input.selected = GetDataFromNavigation(navigation, plugin_json);
    animation_input.onchange = async function () {
        const index = this.selectedIndex;
        const anim_effect_data = animations_json[index];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = index;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(animation_input);
    for (let i = 0; i < animations_json.length; i++) {
        const anim_data = animations_json[i];
        if (!anim_data) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = animation_input.selected == anim_data.id - 1;
        opt_div.value = anim_data.id;
        opt_div.textContent = anim_data.name;
        opt_div.onclick = async function () {
            //DO NOTHING
        }
        animation_input.appendChild(opt_div);
    }
    const reset = document.createElement(`button`);
    reset.className = `edit-reset-button`;
    reset.textContent = 'RESET';
    reset.onclick = async function () {
        const original_value = param.default;
        animation_input.selectedIndex = original_value;
        const anim_effect_data = animations_json[animation_input.value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = original_value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(reset);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
    const anim_display_area = document.createElement('canvas');
    anim_display_area.id = "animation-display-div";
    anim_display_area.className = "animation-display-div";
    anim_display_area.onclick = function () {
        const anim_effect_data = animations_json[animation_input.value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
    }
    const renderer = new THREE.WebGLRenderer({ canvas: anim_display_area })
    renderer.setSize(anim_display_area.width, anim_display_area.height);
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30.0, anim_display_area.width / anim_display_area.height, 1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const context = effekseer.createContext();
    context.init(renderer.getContext());
    const fastRenderMode = true;
    if (fastRenderMode) {
        context.setRestorationOfStatesFlag(false);
    }
    const anim_effect_data = animations_json[animation_input.value];
    const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
        const handle = context.play(effect);
        handle.setLocation(0, 0, 0);
    });
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        context.update(clock.getDelta() * 60.0);
        renderer.render(scene, camera);
        context.setProjectionMatrix(camera.projectionMatrix.elements);
        context.setCameraMatrix(camera.matrixWorldInverse.elements);
        context.draw();
        if (fastRenderMode) {
            renderer.resetState();
        }
    })();
    div.appendChild(anim_display_area);
}

function CreateActorParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const actors_file = fs.readFileSync(`${base_path}/project/data/Actors.json`, 'utf8');
    const actors_json = JSON.parse(actors_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const actor_label = document.createElement('label');
    actor_label.className = `actor-edit-label`;
    actor_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(actor_label);
    const actor_input = document.createElement('select');
    actor_input.id = "actor-edit-selector";
    actor_input.className = "actor-edit-selector";
    const actor_id = GetDataFromNavigation(navigation, plugin_json)
    actor_input.selected = actors_json.indexOf(actors_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == actor_id
    }));
    actor_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = actors_json[index] ? actors_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(actor_input);
    for (let i = 0; i < actors_json.length; i++) {
        const actor_data = actors_json[i];
        const opt_div = document.createElement('option');
        if (actor_data) {
            opt_div.selected = actor_input.selected == i;
            opt_div.value = actor_data.name;
            opt_div.textContent = actor_data.name;
        }
        actor_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateClassParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const classes_file = fs.readFileSync(`${base_path}/project/data/Classes.json`, 'utf8');
    const classes_json = JSON.parse(classes_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const class_label = document.createElement('label');
    class_label.className = `class-edit-label`;
    class_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(class_label);
    const class_input = document.createElement('select');
    class_input.id = "class-edit-selector";
    class_input.className = "class-edit-selector";
    const class_id = GetDataFromNavigation(navigation, plugin_json)
    class_input.selected = classes_json.indexOf(classes_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == class_id
    }));
    class_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = actors_json[index] ? actors_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(class_input);
    for (let i = 0; i < actors_json.length; i++) {
        const actor_data = actors_json[i];
        const opt_div = document.createElement('option');
        if (actor_data) {
            opt_div.selected = class_input.selected == i;
            opt_div.value = actor_data.name;
            opt_div.textContent = actor_data.name;
        }
        class_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateSkillParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const skills_file = fs.readFileSync(`${base_path}/project/data/Skills.json`, 'utf8');
    const skills_json = JSON.parse(skills_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const skill_label = document.createElement('label');
    skill_label.className = `skill-edit-label`;
    skill_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(skill_label);
    const skill_input = document.createElement('select');
    skill_input.id = "skill-edit-selector";
    skill_input.className = "skill-edit-selector";
    const skill_id = GetDataFromNavigation(navigation, plugin_json)
    skill_input.selected = skills_json.indexOf(skills_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == skill_id
    }));
    skill_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = skills_json[index] ? skills_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(skill_input);
    for (let i = 0; i < skills_json.length; i++) {
        const skill_data = skills_json[i];
        const opt_div = document.createElement('option');
        if (skill_data) {
            opt_div.selected = skill_input.selected == i;
            opt_div.value = skill_data.name;
            opt_div.textContent = skill_data.name;
        }
        skill_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateItemParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const items_file = fs.readFileSync(`${base_path}/project/data/Items.json`, 'utf8');
    const items_json = JSON.parse(items_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const item_label = document.createElement('label');
    item_label.className = `item-edit-label`;
    item_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(item_label);
    const item_input = document.createElement('select');
    item_input.id = "item-edit-selector";
    item_input.className = "item-edit-selector";
    const item_id = GetDataFromNavigation(navigation, plugin_json);
    item_input.selected = items_json.indexOf(items_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == item_id
    }));
    item_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = items_json[index] ? items_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(item_input);
    for (let i = 0; i < items_json.length; i++) {
        const item_data = items_json[i];
        const opt_div = document.createElement('option');
        if (item_data) {
            opt_div.selected = item_input.selected == i;
            opt_div.value = item_data.name;
            opt_div.textContent = item_data.name;
        }
        item_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateWeaponParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const weapons_file = fs.readFileSync(`${base_path}/project/data/Weapons.json`, 'utf8');
    const weapons_json = JSON.parse(weapons_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const weapon_label = document.createElement('label');
    weapon_label.className = `weapon-edit-label`;
    weapon_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(weapon_label);
    const weapon_input = document.createElement('select');
    weapon_input.id = "weapon-edit-selector";
    weapon_input.className = "weapon-edit-selector";
    const weapon_id = GetDataFromNavigation(navigation, plugin_json);
    weapon_input.selected = weapons_json.indexOf(weapons_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == weapon_id
    }));
    weapon_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = weapons_json[index] ? weapons_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(weapon_input);
    for (let i = 0; i < weapons_json.length; i++) {
        const weapon_data = weapons_json[i];
        const opt_div = document.createElement('option');
        if (weapon_data) {
            opt_div.selected = weapon_input.selected == i;
            opt_div.value = weapon_data.name;
            opt_div.textContent = weapon_data.name;
        }
        weapon_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateArmorParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const armors_file = fs.readFileSync(`${base_path}/project/data/Armors.json`, 'utf8');
    const armors_json = JSON.parse(armors_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const armor_label = document.createElement('label');
    armor_label.className = `armor-edit-label`;
    armor_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(armor_label);
    const armor_input = document.createElement('select');
    armor_input.id = "armor-edit-selector";
    armor_input.className = "armor-edit-selector";
    const armor_id = GetDataFromNavigation(navigation, plugin_json);
    armor_input.selected = armors_json.indexOf(armors_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == armor_id
    }));
    armor_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = armors_json[index] ? armors_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(armor_input);
    for (let i = 0; i < armors_json.length; i++) {
        const armor_data = armors_json[i];
        const opt_div = document.createElement('option');
        if (armor_data) {
            opt_div.selected = armor_input.selected == i;
            opt_div.value = armor_data.name;
            opt_div.textContent = armor_data.name;
        }
        armor_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateEnemyParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const enemies_file = fs.readFileSync(`${base_path}/project/data/Enemies.json`, 'utf8');
    const enemies_json = JSON.parse(enemies_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const enemy_label = document.createElement('label');
    enemy_label.className = `enemy-edit-label`;
    enemy_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(enemy_label);
    const enemy_input = document.createElement('select');
    enemy_input.id = "enemy-edit-selector";
    enemy_input.className = "enemy-edit-selector";
    const enemy_id = GetDataFromNavigation(navigation, plugin_json)
    enemy_input.selected = enemies_json.indexOf(enemies_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == enemy_id
    }));
    enemy_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = enemies_json[index] ? enemies_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(enemy_input);
    for (let i = 0; i < enemies_json.length; i++) {
        const enemy_data = enemies_json[i];
        const opt_div = document.createElement('option');
        if (enemy_data) {
            opt_div.selected = enemy_input.selected == i;
            opt_div.value = enemy_data.name;
            opt_div.textContent = enemy_data.name;
        }
        enemy_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateTroopParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const troops_file = fs.readFileSync(`${base_path}/project/data/Troops.json`, 'utf8');
    const troops_json = JSON.parse(troops_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const troop_label = document.createElement('label');
    troop_label.className = `troop-edit-label`;
    troop_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(troop_label);
    const troop_input = document.createElement('select');
    troop_input.id = "troop-edit-selector";
    troop_input.className = "troop-edit-selector";
    const troop_id = GetDataFromNavigation(navigation, plugin_json);
    troop_input.selected = troops_json.indexOf(troops_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == troop_id
    }));
    troop_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = troops_json[index] ? troops_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(troop_input);
    for (let i = 0; i < troops_json.length; i++) {
        const troop_data = troops_json[i];
        const opt_div = document.createElement('option');
        if (troop_data) {
            opt_div.selected = troop_input.selected == i;
            opt_div.value = troop_data.name;
            opt_div.textContent = troop_data.name;
        }
        troop_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateStateParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const states_file = fs.readFileSync(`${base_path}/project/data/States.json`, 'utf8');
    const states_json = JSON.parse(states_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const state_label = document.createElement('label');
    state_label.className = `state-edit-label`;
    state_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(state_label);
    const state_input = document.createElement('select');
    state_input.id = "state-edit-selector";
    state_input.className = "state-edit-selector";
    const state_id = GetDataFromNavigation(navigation, plugin_json);
    state_input.selected = states_json.indexOf(states_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == state_id
    }));
    state_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = states_json[index] ? states_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(state_input);
    for (let i = 0; i < states_json.length; i++) {
        const state_data = states_json[i];
        const opt_div = document.createElement('option');
        if (state_data) {
            opt_div.selected = state_input.selected == i;
            opt_div.value = state_data.name;
            opt_div.textContent = state_data.name;
        }
        state_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateTilesetParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const tilesets_file = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    const tilesets_json = JSON.parse(tilesets_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const tileset_label = document.createElement('label');
    tileset_label.className = `tileset-edit-label`;
    tileset_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(tileset_label);
    const tileset_input = document.createElement('select');
    tileset_input.id = "tileset-edit-selector";
    tileset_input.className = "tileset-edit-selector";
    const tileset_id = GetDataFromNavigation(navigation, plugin_json)
    tileset_input.selected = tilesets_json.indexOf(tilesets_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == tileset_id
    }));
    tileset_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = tilesets_json[index] ? tilesets_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(tileset_input);
    for (let i = 0; i < tilesets_json.length; i++) {
        const tileset_data = tilesets_json[i];
        const opt_div = document.createElement('option');
        if (tileset_data) {
            opt_div.selected = tileset_input.selected == i;
            opt_div.value = tileset_data.name;
            opt_div.textContent = tileset_data.name;
        }
        tileset_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateCommonEventParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const c_events_file = fs.readFileSync(`${base_path}/project/data/CommonEvents.json`, 'utf8');
    const c_events_json = JSON.parse(c_events_file);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const event_label = document.createElement('label');
    event_label.className = `event-edit-label`;
    event_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(event_label);
    const event_input = document.createElement('select');
    event_input.id = "event-edit-selector";
    event_input.className = "event-edit-selector";
    const event_id = GetDataFromNavigation(navigation, plugin_json);
    event_input.selected = c_events_json.indexOf(c_events_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == event_id
    }));
    event_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = c_events_json[index] ? c_events_json[index].id : 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
        const test_window = this._test_window;
        if (test_window) {
            if (test_window.closed) {
                this._test_window = null;
            } else {
                if (test_window.TriggerRefresh) {
                    test_window.TriggerRefresh();
                }
            }
        }
    }
    ctrl_div.appendChild(event_input);
    for (let i = 0; i < c_events_json.length; i++) {
        const event_data = c_events_json[i];
        const opt_div = document.createElement('option');
        if (event_data) {
            opt_div.selected = event_input.selected == i;
            opt_div.value = event_data.name;
            opt_div.textContent = event_data.name;
        }
        event_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateSwitchParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const switch_label = document.createElement('label');
    switch_label.className = `switch-edit-label`;
    switch_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(switch_label);
    const switch_input = document.createElement('input');
    switch_input.id = "switch-edit-selector";
    switch_input.className = "switch-edit-selector";
    switch_input.type = "number";
    switch_input.value = GetDataFromNavigation(navigation, plugin_json);
    switch_input.oninput = async function () {
        const value = parseInt(switch_input.value) || 0;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value || 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
        const test_window = this._test_window;
        if (test_window) {
            if (test_window.closed) {
                this._test_window = null;
            } else {
                if (test_window.TriggerRefresh) {
                    test_window.TriggerRefresh();
                }
            }
        }
    }
    ctrl_div.appendChild(switch_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function CreateVariableParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const variable_label = document.createElement('label');
    variable_label.className = `variable-edit-label`;
    variable_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(variable_label);
    const variable_input = document.createElement('select');
    variable_input.id = "variable-edit-selector";
    variable_input.className = "variable-edit-selector";
    variable_input.value = GetDataFromNavigation(navigation, plugin_json);
    variable_input.oninput = async function () {
        const value = parseInt(variable_input.value) || 0;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value || 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
        const test_window = this._test_window;
        if (test_window) {
            if (test_window.closed) {
                this._test_window = null;
            } else {
                if (test_window.TriggerRefresh) {
                    test_window.TriggerRefresh();
                }
            }
        }
    }
    ctrl_div.appendChild(switch_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

async function CreateMapParam(div, param, navigation, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const data_dir = fs.readdirSync(`${base_path}/project/data/`, 'utf8');
    const map_file_list = data_dir.filter((filename) => {
        return (filename.match(/(Map[0-9]+)/gm));
    })
    const map_files = map_file_list.map((filename) => {
        try {
            const file = fs.readFileSync(`${base_path}/project/data/${filename}`, 'utf8');
            try {
                const map = JSON.parse(file);
                map._name = map.displayName || (filename || "").replace(`.json`, "");
                map._file = (filename).replace(`.json`, "");
                map._id = eval(filename.replace(`Map`, '').replace(`.json`, ''));
                return map;
            } catch (e) {
                return file;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    })
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const map_label = document.createElement('label');
    map_label.className = `map-edit-label`;
    map_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(map_label);
    const map_input = document.createElement('select');
    map_input.className = `map-edit-input`;
    map_input.selected = GetDataFromNavigation(navigation, plugin_json) - 1;
    map_input.onchange = async function () {
        const index = this.selectedIndex;
        const map_file = map_files[index];
        const map_id = eval(map_file._file.replace(`Map`, '').replace(`.json`, ''));
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = map_id || 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
        SetMapDisplay();
    }
    ctrl_div.appendChild(map_input);
    for (let i = 0; i < map_files.length; i++) {
        const map_file = map_files[i];
        if (!map_file) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = map_input.selected == map_file._id - 1;
        opt_div.value = map_file._id;
        opt_div.textContent = map_file._name;
        map_input.appendChild(opt_div);
    }
    const reset = document.createElement(`button`);
    reset.className = `edit-reset-button`;
    reset.textContent = 'RESET';
    reset.onclick = async function () {
        const original_value = param.default;
        if (!original_value || isNaN(original_value)) {
            map_input.selected = -1;
        } else {
            const file_name = map_file_list.find((filename) => {
                const map_id = eval(filename.replace(`Map`, '').replace(`.json`, ''));
                return map_id == original_value;
            })
            const index = map_file_list.indexOf(file_name);
            map_input.selected = index;
        }
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            target = target[name];
            if (nav_data.array) {
                const index = eval(nav_data.index);
                target = target[index];
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = original_value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    ctrl_div.appendChild(reset);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
    const pixi = new PIXI.Application();
    await pixi.init(
        {
            background: '#000000',
            resizeTo: div
        }
    );
    pixi.canvas.id = "map-display-div";
    pixi.canvas.className = "map-display-div";
    pixi.canvas.textContent = "Not Supported";
    div.appendChild(pixi.canvas);
    const tilesets_json_str = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    let tilesets_json = null;
    try {
        tilesets_json = JSON.parse(tilesets_json_str);
    } catch (e) {
        tilesets_json = tilesets_json_str;
    }
    const SetMapDisplay = async function () {
        const index = map_input.selectedIndex;
        const map_file = map_files[index];
        const mapping_data = map_file.data;
        const map_tile_width = map_file.width;
        const map_tile_height = map_file.height;
        const map_events = map_file.events;
        const tileset_id = map_file.tilesetId;
        const tileset_data = tilesets_json.find((data) => {
            if (!data) return;
            return data.id == tileset_id;
        })
        const map_obj = {
            file: map_file,
            data: mapping_data,
            width: map_tile_width,
            height: map_tile_height,
            events: map_events
        }
        const map_sprite = new Map_Sprite(map_obj, tileset_data);
        pixi.stage.addChild(map_sprite);
        pixi.ticker.add((t) => {
            const dt = t.deltaTime;
            map_sprite.update(dt);
        })
    }
    const map_data_div = document.createElement("div");
    map_data_div.id = "map-data-div";
    map_data_div.className = "map-data-div";
    div.appendChild(map_data_div)
    SetMapDisplay();
}

function CreateFileParam(div, param, navigation, plugin_json, plugin_name) {
    const aud_file_types = [`.ogg`];
    const img_file_types = [`.png`];
    const dir = param.dir;
    const base_path = process.cwd();
    const main_path = `${base_path}/project/${dir}`;
    const file_dir = fs.readdirSync(main_path, 'utf8');
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    ctrl_div.style.display = "block";
    div.appendChild(ctrl_div);
    const file_info_div = document.createElement("div");
    file_info_div.id = "file-param-info";
    file_info_div.className = "file-param-info";
    ctrl_div.appendChild(file_info_div);
    const file_label = document.createElement("label");
    file_label.className = `file-edit-label`;
    file_label.textContent = param.alias || param.name;
    file_info_div.appendChild(file_label);
    const file_input = document.createElement("input");
    file_input.className = `file-edit-input`;
    file_input.value = GetDataFromNavigation(navigation, plugin_json) || "";
    file_input.type = "text";
    file_input.disabled = true;
    file_info_div.appendChild(file_input);
    const file_container = document.createElement("div");
    file_container.id = "file-container-div";
    file_container.className = "file-container-div";
    ctrl_div.appendChild(file_container);
    const nested_dir_reader = function (old_path, added_path, last_block) {
        const new_path = `${old_path}/${added_path}`;
        try {
            const file_dir = fs.readdirSync(new_path, 'utf8');
            const button = document.createElement("button");
            button.className = "file-dir-button";
            button.textContent = `📁${added_path}📁`;
            button.onclick = function () {
                console.log(sub_file_block.style.display)
                if (sub_file_block.style.display == "none") {
                    sub_file_block.style.display = "block";
                } else {
                    sub_file_block.style.display = "none";
                }
            }
            last_block.appendChild(button);
            const sub_file_block = document.createElement("div");
            sub_file_block.id = "file-block-div";
            sub_file_block.className = "file-block-div";
            sub_file_block.style.display = "none";
            last_block.appendChild(sub_file_block);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                if (nested_dir_reader(new_path, file, sub_file_block)) {
                    file_dir.splice(i, 1);
                    i--;
                }
            }
            const search_div = document.createElement("div");
            search_div.className = "file-search-div";
            sub_file_block.appendChild(search_div);
            const file_search_label = document.createElement("label");
            file_search_label.id = "file-search-label";
            file_search_label.className = "file-search-label";
            file_search_label.textContent = `SEARCH ${added_path.toUpperCase()}`;
            search_div.appendChild(file_search_label);
            const file_search_input = document.createElement("input");
            file_search_input.id = "file-search-input";
            file_search_input.className = "file-search-input";
            file_search_input.oninput = function () {
                const search = file_search_input.value;
                const files = files_div.children;
                if (search) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const file_childs = file.children;
                        const file_div = file_childs['file-card-button'];
                        const div_childs = file_div.children;
                        const name_div = div_childs['card-name-div']
                        const name = name_div.textContent || "";
                        if (name.match(search)) {
                            file.style.display = "block";
                        } else {
                            file.style.display = "none";
                        }
                    }
                } else {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        file.style.display = "block";
                    }
                }
            }
            search_div.appendChild(file_search_input);
            const files_div = document.createElement("div");
            files_div.className = "files-flex-div";
            sub_file_block.appendChild(files_div);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                const name = file.slice(0, file.indexOf(`.`));
                const card = document.createElement("div");
                card.id = "file-card-div";
                card.className = "file-card-div";
                files_div.appendChild(card);
                const card_button = document.createElement("div");
                card_button.id = "file-card-button";
                card_button.className = "file-card-button";
                card.appendChild(card_button);
                const is_audio = aud_file_types.some((type) => {
                    return file.match(type);
                })
                const is_image = img_file_types.some((type) => {
                    return file.match(type);
                })
                const card_name = document.createElement("div");
                card_name.id = "card-name-div";
                card_name.className = "card-name-div";
                card_name.textContent = name;
                card_button.appendChild(card_name);
                const card_content = document.createElement("div");
                card_content.id = "card-content-div";
                card_content.className = "card-content-div";
                card_button.appendChild(card_content);
                if (is_audio) {
                    const aud_dom = document.createElement('audio');
                    aud_dom.className = "card-file-aud";
                    aud_dom.src = `${new_path}/${file}`;
                    aud_dom.alt = file;
                    aud_dom.preload = true;
                    aud_dom.controls = true;
                    card_content.appendChild(aud_dom);
                }
                if (is_image) {
                    const img_dom = document.createElement("img");
                    img_dom.className = "card-file-img";
                    img_dom.src = `${new_path}/${file}`;
                    img_dom.alt = file;
                    card_content.appendChild(img_dom);
                }
                const set_button = document.createElement("button");
                set_button.id = "set-file-button";
                set_button.className = "set-file-button";
                set_button.textContent = "️✅";
                set_button.onclick = async function () {
                    let value = (`${new_path}/${file}`).replace(main_path, "");
                    value = value.slice(1, value.indexOf('.'));
                    file_input.value = value;
                    let target = plugin_json;
                    for (let i = 0; i < navigation.length; i++) {
                        const nav_data = navigation[i];
                        const name = nav_data.name;
                        const index = eval(nav_data.index);
                        target = target[name];
                        if (target.list) {
                            target = target.list;
                            if (!isNaN(index)) {
                                target = target[index];
                                if (target.gen) {
                                    target = target.gen;
                                }
                            }
                        }
                        if (target.gen) {
                            target = target.gen;
                        }
                    }
                    target.value = value || 0;
                    await SaveProjectEditorObject(plugin_json, plugin_name);
                    const test_window = this._test_window;
                    if (test_window) {
                        if (test_window.closed) {
                            this._test_window = null;
                        } else {
                            if (test_window.TriggerRefresh) {
                                test_window.TriggerRefresh();
                            }
                        }
                    }
                }
                card_button.appendChild(set_button);
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    const file_block_main = document.createElement("div");
    file_block_main.className = "file-block-div";
    file_container.appendChild(file_block_main);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        if (nested_dir_reader(main_path, file, file_block_main)) {
            file_dir.splice(i, 1);
            i--;
        }
    }
    const search_div = document.createElement("div");
    search_div.className = "file-search-div";
    file_block_main.appendChild(search_div);
    const file_search_label = document.createElement("label");
    file_search_label.id = "file-search-label";
    file_search_label.className = "file-search-label";
    file_search_label.textContent = `SEARCH FILES`;
    search_div.appendChild(file_search_label);
    const file_search_input = document.createElement("input");
    file_search_input.id = "file-search-input";
    file_search_input.className = "file-search-input";
    file_search_input.oninput = function () {
        const search = file_search_input.value;
        const files = files_div.children;
        if (search) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const file_childs = file.children;
                const file_div = file_childs['file-card-button'];
                const div_childs = file_div.children;
                const name_div = div_childs['card-name-div']
                const name = name_div.textContent || "";
                if (name.match(search)) {
                    file.style.display = "block";
                } else {
                    file.style.display = "none";
                }
            }
        } else {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                file.style.display = "block";
            }
        }
    }
    search_div.appendChild(file_search_input);
    const files_div = document.createElement("div");
    files_div.className = "files-flex-div";
    file_block_main.appendChild(files_div);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        const name = file.slice(0, file.indexOf(`.`));
        const card = document.createElement("div");
        card.id = "file-card-div";
        card.className = "file-card-div";
        files_div.appendChild(card);
        const card_button = document.createElement("div");
        card_button.id = "file-card-button";
        card_button.className = "file-card-button";
        card.appendChild(card_button);
        const is_audio = aud_file_types.some((type) => {
            return file.match(type);
        })
        const is_image = img_file_types.some((type) => {
            return file.match(type);
        })
        const card_name = document.createElement("div");
        card_name.id = "card-name-div";
        card_name.className = "card-name-div";
        card_name.textContent = name;
        card_button.appendChild(card_name);
        const card_content = document.createElement("div");
        card_content.id = "card-content-div";
        card_content.className = "card-content-div";
        card_button.appendChild(card_content);
        if (is_audio) {
            const aud_dom = document.createElement('audio');
            aud_dom.className = "card-file-aud";
            aud_dom.src = `file://${main_path}/${file}`;
            aud_dom.alt = file;
            aud_dom.preload = true;
            aud_dom.controls = true;
            card_content.appendChild(aud_dom);
        }
        if (is_image) {
            const img_dom = document.createElement("img");
            img_dom.className = "card-file-img";
            img_dom.src = `file://${main_path}/${file}`;
            img_dom.alt = file;
            card_content.appendChild(img_dom);
        }
        const set_button = document.createElement("button");
        set_button.id = "set-file-button";
        set_button.className = "set-file-button";
        set_button.textContent = "️✅";
        set_button.onclick = async function () {
            const value = file.slice(0, file.indexOf('.'));
            file_input.value = value;
            let target = plugin_json;
            for (let i = 0; i < navigation.length; i++) {
                const nav_data = navigation[i];
                const name = nav_data.name;
                const index = eval(nav_data.index);
                target = target[name];
                if (target.list) {
                    target = target.list;
                    if (!isNaN(index)) {
                        target = target[index];
                        if (target.gen) {
                            target = target.gen;
                        }
                    }
                }
                if (target.gen) {
                    target = target.gen;
                }
            }
            target.value = value || 0;
            await SaveProjectEditorObject(plugin_json, plugin_name);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        card_button.appendChild(set_button);
    }
}

function CreateBooleanParam(div, param, navigation, plugin_json, plugin_name) {
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "edit-input-container-div"
    div.appendChild(ctrl_div);
    const bool_label = document.createElement('label');
    bool_label.className = `boolean-edit-label`;
    bool_label.textContent = param.alias || param.name;
    ctrl_div.appendChild(bool_label);
    const bool_div = document.createElement('div');
    bool_div.id = "boolean-input-div";
    bool_div.className = "boolean-input-div";
    ctrl_div.appendChild(bool_div);
    const bool_val = eval(GetDataFromNavigation(navigation, plugin_json) || "false");
    const bool_input_true = document.createElement('input');
    bool_input_true.type = 'radio';
    bool_input_true.name = param.alias || param.name;
    bool_input_true.id = "bool-selector-true";
    bool_input_true.className = "bool-selector-true";
    bool_input_true.value = "true";
    bool_input_true.checked = !!bool_val;
    bool_input_true.onclick = async function () {
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = true;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    bool_div.appendChild(bool_input_true);
    const bool_input_true_label = document.createElement('label');
    bool_input_true_label.id = "bool-selector-true-label";
    bool_input_true_label.className = "bool-selector-true-label";
    bool_input_true_label.for = "bool-selector-true";
    bool_input_true_label.textContent = "True";
    bool_div.appendChild(bool_input_true_label);
    const bool_input_false = document.createElement('input');
    bool_input_false.type = 'radio';
    bool_input_false.name = param.alias || param.name;
    bool_input_false.id = "bool-selector-false";
    bool_input_false.className = "bool-selector-false";
    bool_input_false.value = "false";
    bool_input_false.checked = !bool_val;
    bool_input_false.onclick = async function () {
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = false;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    bool_div.appendChild(bool_input_false);
    const bool_input_false_label = document.createElement('label');
    bool_input_false_label.id = "bool-selector-false-label";
    bool_input_false_label.className = "bool-selector-false-label";
    bool_input_false_label.for = "bool-selector-false";
    bool_input_false_label.textContent = "False";
    bool_div.appendChild(bool_input_false_label);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

function RemoveArrayItemEditElements() {
    const itm_edits = document.getElementsByClassName(`array-item-edit-block`);
    for (let i = 0; i < itm_edits.length; i++) {
        const itm_edit = itm_edits[i];
        if (itm_edit) {
            itm_edit.parentElement.removeChild(itm_edit);
        }
    }
}

async function CreateArrayTextEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const text_label = document.createElement('label');
    text_label.className = `text-edit-label`;
    text_label.textContent = param.alias || param.name;
    edit_block.appendChild(text_label);
    const text_input = document.createElement('input');
    text_input.className = `text-edit-input`;
    text_input.value = GetDataFromNavigation(navigation, plugin_json);
    text_input.oninput = async function () {
        const value = text_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        button.textContent = value.toString().slice(0, 9);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    edit_block.appendChild(text_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

async function CreateArrayNoteEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const note_label = document.createElement('label');
    note_label.className = `text-edit-label`;
    note_label.textContent = param.alias || param.name;
    edit_block.appendChild(note_label);
    const note_input = document.createElement('textarea');
    note_input.className = `note-edit-input`;
    note_input.value = GetDataFromNavigation(navigation, plugin_json);
    note_input.oninput = async function () {
        const value = note_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        button.textContent = value.toString().slice(0, 9);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    edit_block.appendChild(note_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

async function CreateArrayNumberEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const number_label = document.createElement('label');
    number_label.className = `number-edit-label`;
    number_label.textContent = `Number:`;
    edit_block.appendChild(number_label);
    const number_input = document.createElement('input');
    number_input.className = `number-edit-input`;
    number_input.value = 0;
    number_input.type = `number`;
    number_input.oninput = async function () {
        const value = number_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        button.textContent = value.toString().slice(0, 9);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    edit_block.appendChild(number_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    div.appendChild(desc_div);
}

async function CreateArraySelectionEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const options = param.options;
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const select_label = document.createElement('label');
    select_label.className = `selection-edit-label`;
    select_label.textContent = `Selection:`;
    anim_edit_block.appendChild(select_label);
    const select_input = document.createElement('select');
    select_input.id = "selection-edit-selector";
    select_input.className = "selection-edit-selector";
    const selection = GetDataFromNavigation(navigation, plugin_json);
    const selc_opt = options.find((opt) => {
        return opt.value == selection;
    })
    select_input.selected = options.indexOf(selc_opt);
    select_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = options[index] ? options[index].value : null;
        button.textContent = options[index] ? options[index].name : null;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(select_input);
    for (let i = 0; i < options.length; i++) {
        const opt_obj = options[i];
        const opt_div = document.createElement('option');
        if (opt_obj) {
            opt_div.selected = select_input.selected == i;
            opt_div.value = opt_obj.value;
            opt_div.textContent = opt_obj.name;
        }
        select_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayAnimationEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const animations_file = fs.readFileSync(`${base_path}/project/data/Animations.json`, 'utf8');
    const animations_json = JSON.parse(animations_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const anim_label = document.createElement('label');
    anim_label.className = `animation-edit-label`;
    anim_label.textContent = `Animation:`;
    anim_edit_block.appendChild(anim_label);
    const animation_input = document.createElement('select');
    animation_input.className = `animation-edit-input`;
    animation_input.selected = GetDataFromNavigation(navigation, plugin_json);
    animation_input.onchange = async function () {
        const value = animation_input.value;
        const anim_effect_data = animations_json[value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value;
        button.textContent = value.toString().slice(0, 9);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(animation_input);
    for (let i = 0; i < animations_json.length; i++) {
        const anim_data = animations_json[i];
        if (!anim_data) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = animation_input.selected == anim_data.id - 1;
        opt_div.value = anim_data.id;
        opt_div.textContent = anim_data.name;
        opt_div.onclick = async function () {
            //DO NOTHING
        }
        animation_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
    const anim_display_area = document.createElement('canvas');
    anim_display_area.id = "animation-display-div";
    anim_display_area.className = "animation-display-div";
    anim_display_area.onclick = function () {
        const anim_effect_data = animations_json[animation_input.value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
    }
    const renderer = new THREE.WebGLRenderer({ canvas: anim_display_area })
    renderer.setSize(anim_display_area.width, anim_display_area.height);
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30.0, anim_display_area.width / anim_display_area.height, 1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const context = effekseer.createContext();
    context.init(renderer.getContext());
    const fastRenderMode = true;
    if (fastRenderMode) {
        context.setRestorationOfStatesFlag(false);
    }
    const anim_effect_data = animations_json[animation_input.value];
    const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
        const handle = context.play(effect);
        handle.setLocation(0, 0, 0);
    });
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        context.update(clock.getDelta() * 60.0);
        renderer.render(scene, camera);
        context.setProjectionMatrix(camera.projectionMatrix.elements);
        context.setCameraMatrix(camera.matrixWorldInverse.elements);
        context.draw();
        if (fastRenderMode) {
            renderer.resetState();
        }
    })();
    anim_edit_block.appendChild(anim_display_area);
}

async function CreateArrayActorEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const actors_file = fs.readFileSync(`${base_path}/project/data/Actors.json`, 'utf8');
    const actors_json = JSON.parse(actors_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const actor_label = document.createElement('label');
    actor_label.className = `actor-edit-label`;
    actor_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(actor_label);
    const actor_input = document.createElement('select');
    actor_input.id = "actor-edit-selector";
    actor_input.className = "actor-edit-selector";
    const actor_id = GetDataFromNavigation(navigation, plugin_json)
    actor_input.selected = actors_json.indexOf(actors_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == actor_id
    }));
    actor_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = actors_json[index] ? actors_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(actor_input);
    for (let i = 0; i < actors_json.length; i++) {
        const actor_data = actors_json[i];
        const opt_div = document.createElement('option');
        if (actor_data) {
            opt_div.selected = actor_input.selected == i;
            opt_div.value = actor_data.name;
            opt_div.textContent = actor_data.name;
        }
        actor_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayClassEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const classes_file = fs.readFileSync(`${base_path}/project/data/Classes.json`, 'utf8');
    const classes_json = JSON.parse(classes_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const classes_label = document.createElement('label');
    classes_label.className = `class-edit-label`;
    classes_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(classes_label);
    const class_input = document.createElement('select');
    class_input.id = "class-edit-selector";
    class_input.className = "class-edit-selector";
    const class_id = GetDataFromNavigation(navigation, plugin_json)
    class_input.selected = classes_json.indexOf(classes_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == class_id
    }));
    class_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = classes_json[index] ? classes_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(class_input);
    for (let i = 0; i < classes_json.length; i++) {
        const class_data = classes_json[i];
        const opt_div = document.createElement('option');
        if (class_data) {
            opt_div.selected = class_input.selected == i;
            opt_div.value = class_data.name;
            opt_div.textContent = class_data.name;
        }
        class_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArraySkillEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const skills_file = fs.readFileSync(`${base_path}/project/data/Skills.json`, 'utf8');
    const skills_json = JSON.parse(skills_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const skill_label = document.createElement('label');
    skill_label.className = `skill-edit-label`;
    skill_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(skill_label);
    const skill_input = document.createElement('select');
    skill_input.id = "skill-edit-selector";
    skill_input.className = "skill-edit-selector";
    const skill_id = GetDataFromNavigation(navigation, plugin_json)
    skill_input.selected = skills_json.indexOf(skills_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == skill_id
    }));
    skill_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = skills_json[index] ? skills_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(skill_input);
    for (let i = 0; i < skills_json.length; i++) {
        const skill_data = skills_json[i];
        const opt_div = document.createElement('option');
        if (skill_data) {
            opt_div.selected = skill_input.selected == i;
            opt_div.value = skill_data.name;
            opt_div.textContent = skill_data.name;
        }
        skill_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayItemEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const items_file = fs.readFileSync(`${base_path}/project/data/Items.json`, 'utf8');
    const items_json = JSON.parse(items_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const item_label = document.createElement('label');
    item_label.className = `item-edit-label`;
    item_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(item_label);
    const item_input = document.createElement('select');
    item_input.id = "item-edit-selector";
    item_input.className = "item-edit-selector";
    const item_id = GetDataFromNavigation(navigation, plugin_json);
    item_input.selected = items_json.indexOf(items_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == item_id
    }));
    item_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = items_json[index] ? items_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(item_input);
    for (let i = 0; i < items_json.length; i++) {
        const item_data = items_json[i];
        const opt_div = document.createElement('option');
        if (item_data) {
            opt_div.selected = item_input.selected == i;
            opt_div.value = item_data.name;
            opt_div.textContent = item_data.name;
        }
        item_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayWeaponEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const weapons_file = fs.readFileSync(`${base_path}/project/data/Weapons.json`, 'utf8');
    const weapons_json = JSON.parse(weapons_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const weapon_label = document.createElement('label');
    weapon_label.className = `weapon-edit-label`;
    weapon_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(weapon_label);
    const weapon_input = document.createElement('select');
    weapon_input.id = "weapon-edit-selector";
    weapon_input.className = "weapon-edit-selector";
    const weapon_id = GetDataFromNavigation(navigation, plugin_json);
    weapon_input.selected = weapons_json.indexOf(weapons_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == weapon_id
    }));
    weapon_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = weapons_json[index] ? weapons_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(weapon_input);
    for (let i = 0; i < weapons_json.length; i++) {
        const weapon_data = weapons_json[i];
        const opt_div = document.createElement('option');
        if (weapon_data) {
            opt_div.selected = weapon_input.selected == i;
            opt_div.value = weapon_data.name;
            opt_div.textContent = weapon_data.name;
        }
        weapon_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayArmorEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const armors_file = fs.readFileSync(`${base_path}/project/data/Armors.json`, 'utf8');
    const armors_json = JSON.parse(armors_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const armor_label = document.createElement('label');
    armor_label.className = `armor-edit-label`;
    armor_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(armor_label);
    const armor_input = document.createElement('select');
    armor_input.id = "armor-edit-selector";
    armor_input.className = "armor-edit-selector";
    const armor_id = GetDataFromNavigation(navigation, plugin_json);
    armor_input.selected = armors_json.indexOf(armors_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == armor_id
    }));
    armor_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = armors_json[index] ? armors_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(armor_input);
    for (let i = 0; i < armors_json.length; i++) {
        const armor_data = armors_json[i];
        const opt_div = document.createElement('option');
        if (armor_data) {
            opt_div.selected = armor_input.selected == i;
            opt_div.value = armor_data.name;
            opt_div.textContent = armor_data.name;
        }
        armor_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayEnemyEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const enemies_file = fs.readFileSync(`${base_path}/project/data/Enemies.json`, 'utf8');
    const enemies_json = JSON.parse(enemies_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const enemy_label = document.createElement('label');
    enemy_label.className = `enemy-edit-label`;
    enemy_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(armor_label);
    const enemy_input = document.createElement('select');
    enemy_input.id = "enemy-edit-selector";
    enemy_input.className = "enemy-edit-selector";
    const enemy_id = GetDataFromNavigation(navigation, plugin_json)
    enemy_input.selected = enemies_json.indexOf(enemies_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == enemy_id
    }));
    enemy_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = enemies_json[index] ? enemies_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(enemy_input);
    for (let i = 0; i < enemies_json.length; i++) {
        const enemy_data = enemies_json[i];
        const opt_div = document.createElement('option');
        if (enemy_data) {
            opt_div.selected = enemy_input.selected == i;
            opt_div.value = enemy_data.name;
            opt_div.textContent = enemy_data.name;
        }
        enemy_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayTroopEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const troops_file = fs.readFileSync(`${base_path}/project/data/Troops.json`, 'utf8');
    const troops_json = JSON.parse(troops_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const troop_label = document.createElement('label');
    troop_label.className = `troop-edit-label`;
    troop_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(troop_label);
    const troop_input = document.createElement('select');
    troop_input.id = "troop-edit-selector";
    troop_input.className = "troop-edit-selector";
    const troop_id = GetDataFromNavigation(navigation, plugin_json);
    troop_input.selected = troops_json.indexOf(troops_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == troop_id
    }));
    troop_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = troops_json[index] ? troops_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(troop_input);
    for (let i = 0; i < troops_json.length; i++) {
        const troop_data = troops_json[i];
        const opt_div = document.createElement('option');
        if (troop_data) {
            opt_div.selected = troop_input.selected == i;
            opt_div.value = troop_data.name;
            opt_div.textContent = troop_data.name;
        }
        troop_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayStateEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const states_file = fs.readFileSync(`${base_path}/project/data/States.json`, 'utf8');
    const states_json = JSON.parse(states_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const state_label = document.createElement('label');
    state_label.className = `state-edit-label`;
    state_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(state_label);
    const state_input = document.createElement('select');
    state_input.id = "state-edit-selector";
    state_input.className = "state-edit-selector";
    const state_id = GetDataFromNavigation(navigation, plugin_json);
    state_input.selected = states_json.indexOf(states_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == state_id
    }));
    state_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = states_json[index] ? states_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(state_input);
    for (let i = 0; i < states_json.length; i++) {
        const state_data = states_json[i];
        const opt_div = document.createElement('option');
        if (state_data) {
            opt_div.selected = state_input.selected == i;
            opt_div.value = state_data.name;
            opt_div.textContent = state_data.name;
        }
        state_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayTilesetEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const tilesets_file = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    const tilesets_json = JSON.parse(tilesets_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const tileset_label = document.createElement('label');
    tileset_label.className = `tileset-edit-label`;
    tileset_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(tileset_label);
    const tileset_input = document.createElement('select');
    tileset_input.id = "tileset-edit-selector";
    tileset_input.className = "tileset-edit-selector";
    const tileset_id = GetDataFromNavigation(navigation, plugin_json)
    tileset_input.selected = tilesets_json.indexOf(tilesets_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == tileset_id
    }));
    tileset_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = tilesets_json[index] ? tilesets_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(tileset_input);
    for (let i = 0; i < tilesets_json.length; i++) {
        const tileset_data = tilesets_json[i];
        const opt_div = document.createElement('option');
        if (tileset_data) {
            opt_div.selected = tileset_input.selected == i;
            opt_div.value = tileset_data.name;
            opt_div.textContent = tileset_data.name;
        }
        tileset_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayEventEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const c_events_file = fs.readFileSync(`${base_path}/project/data/CommonEvents.json`, 'utf8');
    const c_events_json = JSON.parse(c_events_file);
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const event_label = document.createElement('label');
    event_label.className = `event-edit-label`;
    event_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(tileset_label);
    const event_input = document.createElement('select');
    event_input.id = "event-edit-selector";
    event_input.className = "event-edit-selector";
    const event_id = GetDataFromNavigation(navigation, plugin_json);
    event_input.selected = c_events_json.indexOf(c_events_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == event_id
    }));
    event_input.onchange = async function () {
        const index = this.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = c_events_json[index] ? c_events_json[index].id : 0;
        target.value = value;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(event_input);
    for (let i = 0; i < c_events_json.length; i++) {
        const event_data = c_events_json[i];
        const opt_div = document.createElement('option');
        if (event_data) {
            opt_div.selected = event_input.selected == i;
            opt_div.value = event_data.name;
            opt_div.textContent = event_data.name;
        }
        event_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArraySwitchEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const switch_label = document.createElement('label');
    switch_label.className = `switch-edit-label`;
    switch_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(switch_label);
    const switch_input = document.createElement('input');
    switch_input.id = "switch-edit-selector";
    switch_input.className = "switch-edit-selector";
    switch_input.type = "number";
    switch_input.value = GetDataFromNavigation(navigation, plugin_json);
    switch_input.oninput = async function () {
        const value = parseInt(switch_input.value) || 0;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value || 0;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(switch_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayVariableEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const variable_label = document.createElement('label');
    variable_label.className = `variable-edit-label`;
    variable_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(variable_label);
    const variable_input = document.createElement('select');
    variable_input.id = "variable-edit-selector";
    variable_input.className = "variable-edit-selector";
    variable_input.value = GetDataFromNavigation(navigation, plugin_json);
    variable_input.oninput = async function () {
        const value = parseInt(variable_input.value) || 0;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = value || 0;
        button.textContent = value;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    anim_edit_block.appendChild(variable_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateArrayMapEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const base_path = process.cwd();
    const data_dir = fs.readdirSync(`${base_path}/project/data/`, 'utf8');
    const map_file_list = data_dir.filter((filename) => {
        return (filename.match(/(Map[0-9]+)/gm));
    })
    const map_files = map_file_list.map((filename) => {
        try {
            const file = fs.readFileSync(`${base_path}/project/data/${filename}`, 'utf8');
            try {
                const map = JSON.parse(file);
                map._name = map.displayName || (filename || "").replace(`.json`, "");
                map._file = (filename).replace(`.json`, "");
                map._id = eval(filename.replace(`Map`, '').replace(`.json`, ''));
                return map;
            } catch (e) {
                return file;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    })
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const map_label = document.createElement('label');
    map_label.className = `map-edit-label`;
    map_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(map_label);
    const map_input = document.createElement('select');
    map_input.className = `map-edit-input`;
    map_input.selected = GetDataFromNavigation(navigation, plugin_json) - 1;
    map_input.onchange = async function () {
        const index = this.selectedIndex;
        const map_file = map_files[index];
        const map_id = eval(map_file._file.replace(`Map`, '').replace(`.json`, ''));
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = map_id || 0;
        button.textContent = map_id || 0;
        await SaveProjectEditorObject(plugin_json, plugin_name);
        SetMapDisplay();
    }
    anim_edit_block.appendChild(map_input);
    for (let i = 0; i < map_files.length; i++) {
        const map_file = map_files[i];
        if (!map_file) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = map_input.selected == map_file._id - 1;
        opt_div.value = map_file._id;
        opt_div.textContent = map_file._name;
        map_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
    const pixi = new PIXI.Application();
    await pixi.init(
        {
            background: '#000000',
            resizeTo: div
        }
    );
    pixi.canvas.id = "map-display-div";
    pixi.canvas.className = "map-display-div";
    pixi.canvas.textContent = "Not Supported";
    anim_edit_block.appendChild(pixi.canvas);
    const tilesets_json_str = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    let tilesets_json = null;
    try {
        tilesets_json = JSON.parse(tilesets_json_str);
    } catch (e) {
        tilesets_json = tilesets_json_str;
    }
    const SetMapDisplay = async function () {
        const index = map_input.selectedIndex;
        const map_file = map_files[index];
        const mapping_data = map_file.data;
        const map_tile_width = map_file.width;
        const map_tile_height = map_file.height;
        const map_events = map_file.events;
        const tileset_id = map_file.tilesetId;
        const tileset_data = tilesets_json.find((data) => {
            if (!data) return;
            return data.id == tileset_id;
        })
        const map_obj = {
            file: map_file,
            data: mapping_data,
            width: map_tile_width,
            height: map_tile_height,
            events: map_events
        }
        const map_sprite = new Map_Sprite(map_obj, tileset_data);
        pixi.stage.addChild(map_sprite);
        pixi.ticker.add((t) => {
            const dt = t.deltaTime;
            map_sprite.update(dt);
        })
    }
    const map_data_div = document.createElement("div");
    map_data_div.id = "map-data-div";
    map_data_div.className = "map-data-div";
    anim_edit_block.appendChild(map_data_div)
    SetMapDisplay();
}

async function CreateArrayFileEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const aud_file_types = [`.ogg`];
    const img_file_types = [`.png`];
    const dir = param.dir;
    const base_path = process.cwd();
    const main_path = `file://${base_path}/project/${dir}`;
    const file_dir = fs.readdirSync(main_path, 'utf8');
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const file_info_div = document.createElement("div");
    file_info_div.id = "file-param-info";
    file_info_div.className = "file-param-info";
    anim_edit_block.appendChild(file_info_div);
    const file_label = document.createElement("label");
    file_label.className = `file-edit-label`;
    file_label.textContent = param.alias || param.name;
    file_info_div.appendChild(file_label);
    const file_input = document.createElement("input");
    file_input.className = `file-edit-input`;
    file_input.value = GetDataFromNavigation(navigation, plugin_json) || "";
    file_input.type = "text";
    file_input.disabled = true;
    file_info_div.appendChild(file_input);
    const file_container = document.createElement("div");
    file_container.id = "file-container-div";
    file_container.className = "file-container-div";
    anim_edit_block.appendChild(file_container);
    const nested_dir_reader = function (old_path, added_path, last_block) {
        const new_path = `${old_path}/${added_path}`;
        try {
            const file_dir = fs.readdirSync(new_path, 'utf8');
            const button = document.createElement("button");
            button.className = "file-dir-button";
            button.textContent = `📁${added_path}📁`;
            button.onclick = function () {
                console.log(sub_file_block.style.display)
                if (sub_file_block.style.display == "none") {
                    sub_file_block.style.display = "block";
                } else {
                    sub_file_block.style.display = "none";
                }
            }
            last_block.appendChild(button);
            const sub_file_block = document.createElement("div");
            sub_file_block.id = "file-block-div";
            sub_file_block.className = "file-block-div";
            sub_file_block.style.display = "none";
            last_block.appendChild(sub_file_block);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                if (nested_dir_reader(new_path, file, sub_file_block)) {
                    file_dir.splice(i, 1);
                    i--;
                }
            }
            const search_div = document.createElement("div");
            search_div.className = "file-search-div";
            sub_file_block.appendChild(search_div);
            const file_search_label = document.createElement("label");
            file_search_label.id = "file-search-label";
            file_search_label.className = "file-search-label";
            file_search_label.textContent = `SEARCH ${added_path.toUpperCase()}`;
            search_div.appendChild(file_search_label);
            const file_search_input = document.createElement("input");
            file_search_input.id = "file-search-input";
            file_search_input.className = "file-search-input";
            file_search_input.oninput = function () {
                const search = file_search_input.value;
                const files = files_div.children;
                if (search) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const file_childs = file.children;
                        const file_div = file_childs['file-card-button'];
                        const div_childs = file_div.children;
                        const name_div = div_childs['card-name-div']
                        const name = name_div.textContent || "";
                        if (name.match(search)) {
                            file.style.display = "block";
                        } else {
                            file.style.display = "none";
                        }
                    }
                } else {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        file.style.display = "block";
                    }
                }
            }
            search_div.appendChild(file_search_input);
            const files_div = document.createElement("div");
            files_div.className = "files-flex-div";
            sub_file_block.appendChild(files_div);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                const name = file.slice(0, file.indexOf(`.`));
                const card = document.createElement("div");
                card.id = "file-card-div";
                card.className = "file-card-div";
                files_div.appendChild(card);
                const card_button = document.createElement("div");
                card_button.id = "file-card-button";
                card_button.className = "file-card-button";
                card.appendChild(card_button);
                const is_audio = aud_file_types.some((type) => {
                    return file.match(type);
                })
                const is_image = img_file_types.some((type) => {
                    return file.match(type);
                })
                const card_name = document.createElement("div");
                card_name.id = "card-name-div";
                card_name.className = "card-name-div";
                card_name.textContent = name;
                card_button.appendChild(card_name);
                const card_content = document.createElement("div");
                card_content.id = "card-content-div";
                card_content.className = "card-content-div";
                card_button.appendChild(card_content);
                if (is_audio) {
                    const aud_dom = document.createElement('audio');
                    aud_dom.className = "card-file-aud";
                    aud_dom.src = `${new_path}/${file}`;
                    aud_dom.alt = file;
                    aud_dom.preload = true;
                    aud_dom.controls = true;
                    card_content.appendChild(aud_dom);
                }
                if (is_image) {
                    const img_dom = document.createElement("img");
                    img_dom.className = "card-file-img";
                    img_dom.src = `${new_path}/${file}`;
                    img_dom.alt = file;
                    card_content.appendChild(img_dom);
                }
                const set_button = document.createElement("button");
                set_button.id = "set-file-button";
                set_button.className = "set-file-button";
                set_button.textContent = "️✅";
                set_button.onclick = async function () {
                    let value = (`${new_path}/${file}`).replace(main_path, "");
                    value = value.slice(1, value.indexOf('.'));
                    file_input.value = value;
                    let target = plugin_json;
                    for (let i = 0; i < navigation.length; i++) {
                        const nav_data = navigation[i];
                        const name = nav_data.name;
                        const index = eval(nav_data.index);
                        target = target[name];
                        if (target.list) {
                            target = target.list;
                            if (!isNaN(index)) {
                                target = target[index];
                                if (target.gen) {
                                    target = target.gen;
                                }
                            }
                        }
                        if (target.gen) {
                            target = target.gen;
                        }
                    }
                    target.value = value || 0;
                    await SaveProjectEditorObject(plugin_json, plugin_name);
                    const test_window = this._test_window;
                    if (test_window) {
                        if (test_window.closed) {
                            this._test_window = null;
                        } else {
                            if (test_window.TriggerRefresh) {
                                test_window.TriggerRefresh();
                            }
                        }
                    }
                }
                card_button.appendChild(set_button);
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    const file_block_main = document.createElement("div");
    file_block_main.className = "file-block-div";
    file_container.appendChild(file_block_main);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        if (nested_dir_reader(main_path, file, file_block_main)) {
            file_dir.splice(i, 1);
            i--;
        }
    }
    const search_div = document.createElement("div");
    search_div.className = "file-search-div";
    file_block_main.appendChild(search_div);
    const file_search_label = document.createElement("label");
    file_search_label.id = "file-search-label";
    file_search_label.className = "file-search-label";
    file_search_label.textContent = `SEARCH FILES`;
    search_div.appendChild(file_search_label);
    const file_search_input = document.createElement("input");
    file_search_input.id = "file-search-input";
    file_search_input.className = "file-search-input";
    file_search_input.oninput = function () {
        const search = file_search_input.value;
        const files = files_div.children;
        if (search) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const file_childs = file.children;
                const file_div = file_childs['file-card-button'];
                const div_childs = file_div.children;
                const name_div = div_childs['card-name-div']
                const name = name_div.textContent || "";
                if (name.match(search)) {
                    file.style.display = "block";
                } else {
                    file.style.display = "none";
                }
            }
        } else {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                file.style.display = "block";
            }
        }
    }
    search_div.appendChild(file_search_input);
    const files_div = document.createElement("div");
    files_div.className = "files-flex-div";
    file_block_main.appendChild(files_div);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        const name = file.slice(0, file.indexOf(`.`));
        const card = document.createElement("div");
        card.id = "file-card-div";
        card.className = "file-card-div";
        files_div.appendChild(card);
        const card_button = document.createElement("div");
        card_button.id = "file-card-button";
        card_button.className = "file-card-button";
        card.appendChild(card_button);
        const is_audio = aud_file_types.some((type) => {
            return file.match(type);
        })
        const is_image = img_file_types.some((type) => {
            return file.match(type);
        })
        const card_name = document.createElement("div");
        card_name.id = "card-name-div";
        card_name.className = "card-name-div";
        card_name.textContent = name;
        card_button.appendChild(card_name);
        const card_content = document.createElement("div");
        card_content.id = "card-content-div";
        card_content.className = "card-content-div";
        card_button.appendChild(card_content);
        if (is_audio) {
            const aud_dom = document.createElement('audio');
            aud_dom.className = "card-file-aud";
            aud_dom.src = `${main_path}/${file}`;
            aud_dom.alt = file;
            aud_dom.preload = true;
            aud_dom.controls = true;
            card_content.appendChild(aud_dom);
        }
        if (is_image) {
            const img_dom = document.createElement("img");
            img_dom.className = "card-file-img";
            img_dom.src = `${main_path}/${file}`;
            img_dom.alt = file;
            card_content.appendChild(img_dom);
        }
        const set_button = document.createElement("button");
        set_button.id = "set-file-button";
        set_button.className = "set-file-button";
        set_button.textContent = "️✅";
        set_button.onclick = async function () {
            const value = file.slice(0, file.indexOf('.'));
            file_input.value = value;
            let target = plugin_json;
            for (let i = 0; i < navigation.length; i++) {
                const nav_data = navigation[i];
                const name = nav_data.name;
                const index = eval(nav_data.index);
                target = target[name];
                if (target.list) {
                    target = target.list;
                    if (!isNaN(index)) {
                        target = target[index];
                        if (target.gen) {
                            target = target.gen;
                        }
                    }
                }
                if (target.gen) {
                    target = target.gen;
                }
            }
            target.value = value || 0;
            await SaveProjectEditorObject(plugin_json, plugin_name);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        card_button.appendChild(set_button);
    }
}

async function CreateArrayBooleanEdit(
    param,
    navigation,
    plugin_name,
    plugin_json,
    container,
    button
) {
    const old_itm_edit = document.getElementById(`array-item-edit-block`);
    if (old_itm_edit) {
        old_itm_edit.parentElement.removeChild(old_itm_edit);
    }
    const edit_block = document.createElement("div");
    edit_block.id = `array-item-edit-block`;
    edit_block.className = `array-item-edit-block`;
    container.appendChild(edit_block);
    const anim_edit_block = document.createElement("div");
    anim_edit_block.id = `array-anim-item-edit-block`;
    anim_edit_block.className = `array-anim-item-edit-block`;
    edit_block.appendChild(anim_edit_block);
    const bool_label = document.createElement('label');
    bool_label.className = `boolean-edit-label`;
    bool_label.textContent = param.alias || param.name;
    anim_edit_block.appendChild(bool_label);
    const bool_div = document.createElement('div');
    bool_div.id = "boolean-input-div";
    bool_div.className = "boolean-input-div";
    anim_edit_block.appendChild(bool_div);
    const bool_val = eval(GetDataFromNavigation(navigation, plugin_json) || "false");
    const bool_input_true = document.createElement('input');
    bool_input_true.type = 'radio';
    bool_input_true.name = param.alias || param.name;
    bool_input_true.id = "bool-selector-true";
    bool_input_true.className = "bool-selector-true";
    bool_input_true.value = "true";
    bool_input_true.checked = !!bool_val;
    bool_input_true.onclick = async function () {
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = true;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    bool_div.appendChild(bool_input_true);
    const bool_input_true_label = document.createElement('label');
    bool_input_true_label.id = "bool-selector-true-label";
    bool_input_true_label.className = "bool-selector-true-label";
    bool_input_true_label.for = "bool-selector-true";
    bool_input_true_label.textContent = "True";
    bool_div.appendChild(bool_input_true_label);
    const bool_input_false = document.createElement('input');
    bool_input_false.type = 'radio';
    bool_input_false.name = param.alias || param.name;
    bool_input_false.id = "bool-selector-false";
    bool_input_false.className = "bool-selector-false";
    bool_input_false.value = "false";
    bool_input_false.checked = !bool_val;
    bool_input_false.onclick = async function () {
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        target.value = false;
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    bool_div.appendChild(bool_input_false);
    const bool_input_false_label = document.createElement('label');
    bool_input_false_label.id = "bool-selector-false-label";
    bool_input_false_label.className = "bool-selector-false-label";
    bool_input_false_label.for = "bool-selector-false";
    bool_input_false_label.textContent = "False";
    bool_div.appendChild(bool_input_false_label);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    anim_edit_block.appendChild(desc_div);
}

async function CreateParamArrayDisplay(param, navigation, plugin_name, plugin_json, last_struct_div) {
    const display_area = document.getElementById(`display-area`);
    let last_display = "none";
    if (last_struct_div) {
        last_display = JSON.parse(JSON.stringify(last_struct_div.style.display));
        last_struct_div.style.display = 'none';
    } else {
        last_display = JSON.parse(JSON.stringify(display_area.style.display))
        display_area.style.display = 'none';
    }
    const display_parent = display_area.parentElement;
    const array_container = document.createElement('div');
    array_container.id = `array-container-div`;
    array_container.className = `array-container-div`;
    display_parent.appendChild(array_container);
    const ctrl_div = document.createElement('div');
    ctrl_div.className = "array-blocks-div"
    array_container.appendChild(ctrl_div);
    const back_button = document.createElement('button');
    back_button.id = `array-back-button`;
    back_button.className = `array-back-button`;
    back_button.textContent = "GO BACK";
    back_button.onclick = function () {
        if (last_struct_div) {
            last_struct_div.style.display = last_display;
        } else {
            display_area.style.display = last_display;
        }
        if (array_container.parentElement) {
            array_container.parentElement.removeChild(array_container);
        }
        if (array_container.parentElement) {
            array_container.parentElement.remove();
        }
    }
    ctrl_div.appendChild(back_button);
    const array_name_div = document.createElement('div');
    array_name_div.className = `array-name-div`;
    array_name_div.textContent = param.alias || param.name;
    ctrl_div.appendChild(array_name_div);
    const array_param_edit_div = document.createElement('div');
    array_param_edit_div.id = `array-edit-div`;
    array_param_edit_div.className = `array-edit-div`;
    array_container.appendChild(array_param_edit_div);
    const list_div = document.createElement('div');
    list_div.id = `array-list-div`;
    list_div.className = `array-list-div`;
    array_param_edit_div.appendChild(list_div);
    const file_name = plugin_name.slice(0, plugin_name.indexOf('.'));
    const plugin_obj = await LoadPluginObjectFromFile(file_name);
    let list_items = [];
    let target = plugin_json;
    for (let i = 0; i < navigation.length; i++) {
        const nav = navigation[i];
        const nav_name = nav.name;
        const nav_index = nav.index;
        target = target[nav_name];
        if (target.list && !isNaN(nav_index)) {
            target = target.list[nav_index];
            if (target.gen) {
                target = target.gen;
            }
        } else if (target.gen && !target.list) {
            target = target.gen;
        }
    }
    list_items = target.list;
    list_div._items = [];
    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];
        const gen = item.gen;
        const name = gen.no_struct ? gen.value : gen['Name'] ? gen['Name'].gen.value : i.toString();
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(i));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        console.log(item)
        button.textContent = name.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Select list item to continue";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            const type = param.type || "text";
            if (type.match(/(struct)<(\S+)>/gmi)) {
                CreateStructParamDisplay(param, copy_nav, plugin_name, plugin_json, array_container);
            } else {
                if (type.match(/(text)/gmi)) {
                    await CreateArrayTextEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(note)/gmi)) {
                    await CreateArrayNoteEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(number)/gmi)) {
                    await CreateArrayNumberEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(select)/gmi)) {
                    await CreateArraySelectionEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(animation)/gmi)) {
                    await CreateArrayAnimationEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(actor)/gmi)) {
                    await CreateArrayActorEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(class)/gmi)) {
                    await CreateArrayClassEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(skill)/gmi)) {
                    await CreateArraySkillEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(item)/gmi)) {
                    await CreateArrayItemEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(weapon)/gmi)) {
                    await CreateArrayWeaponEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(armor)/gmi)) {
                    await CreateArrayArmorEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(enemy)/gmi)) {
                    await CreateArrayEnemyEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(troop)/gmi)) {
                    await CreateArrayTroopEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(state)/gmi)) {
                    await CreateArrayStateEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(tileset)/gmi)) {
                    await CreateArrayTilesetEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(common_event)/gmi)) {
                    await CreateArrayEventEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(switch)/gmi)) {
                    await CreateArraySwitchEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(variable)/gmi)) {
                    await CreateArrayVariableEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(map)/gmi)) {
                    await CreateArrayMapEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(file)/gmi)) {
                    await CreateArrayFileEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
                if (type.match(/(boolean)/gmi)) {
                    await CreateArrayBooleanEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
                }
            }
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = item_div._index;
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.list.length; i++) {
                const obj = target.list[i];
                DecreaseListPathIndex(obj, nav_index);
            }
            target.list.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target.list;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.list.length; q++) {
                target.list.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target.list[q] = targ_list_arr[q];
            }
            // target.list = targ_list_arr;
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target.list;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.list.length; q++) {
                target.list.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target.list[q] = targ_list_arr[q];
            }
            // target.list = targ_list_arr;
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
    }
    const array_display_area = document.createElement('div');
    array_display_area.id = `array-display-area`;
    array_display_area.className = `array-display-area`;
    array_param_edit_div.appendChild(array_display_area);
    const type = param.type || "text";
    if (type.match(/(struct)<(\S+)>/gmi)) {
        const struct_name = GetStructName(param.type);
        const struct = plugin_obj.structs.find((obj) => {
            return obj.name == struct_name;
        })
        if (struct) {
            CreateArrayDisplayStruct(struct, array_display_area, list_div, navigation, param, plugin_json, plugin_name);
            return;
        }
    }
    if (type.match(/(text)/gmi)) {
        CreateArrayDisplayText(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(note)/gmi)) {
        CreateArrayDisplayNote(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(number)/gmi)) {
        CreateArrayDisplayNumber(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(select)/gmi)) {
        CreateArrayDisplaySelect(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(animation)/gmi)) {
        CreateArrayDisplayAnimation(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(actor)/gmi)) {
        CreateArrayDisplayActor(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(class)/gmi)) {
        CreateArrayDisplayClass(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(skill)/gmi)) {
        CreateArrayDisplaySkill(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(item)/gmi)) {
        CreateArrayDisplayItem(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(weapon)/gmi)) {
        CreateArrayDisplayWeapon(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(armor)/gmi)) {
        CreateArrayDisplayArmor(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(enemy)/gmi)) {
        CreateArrayDisplayEnemy(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(troop)/gmi)) {
        CreateArrayDisplayTroop(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(state)/gmi)) {
        CreateArrayDisplayState(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(tileset)/gmi)) {
        CreateArrayDisplayTileset(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(common_event)/gmi)) {
        CreateArrayDisplayCommonEvent(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(switch)/gmi)) {
        CreateArrayDisplaySwitch(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(variable)/gmi)) {
        CreateArrayDisplayVariable(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(map)/gmi)) {
        CreateArrayDisplayMap(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(file)/gmi)) {
        CreateArrayDisplayFile(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(boolean)/gmi)) {
        CreateArrayDisplayBoolean(array_display_area, list_div, navigation, param, plugin_json, plugin_name);
        return;
    }
}

async function CreateArrayDisplayStruct(struct, display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-display-container-div";
    main_container.className = "array-display-container-div";
    display_div.appendChild(main_container);
    const param_div = document.createElement("div");
    param_div.id = "array-param-edit-div";
    param_div.className = "array-param-edit-div";
    display_div.appendChild(param_div);
    const struct_params = struct.params;
    const struct_doms = [];
    for (let i = 0; i < struct_params.length; i++) {
        const self_div = document.createElement("div");
        self_div.id = "array-add-param-edit-div";
        self_div.className = "array-add-param-edit-div";
        param_div.appendChild(self_div);
        const param = struct_params[i];
        const type = param.type || "text";
        if (
            param.is_array ||
            type.match(/(struct)<(\S+)>/gmi)
        ) {
            const param_label = document.createElement("label");
            param_label.id = "array-param-label";
            param_label.className = "array-param-label";
            param_label.textContent = param.alias || param.name;
            self_div.appendChild(param_label);
            const param_input = document.createElement("input");
            param_input._id = param.alias || param.name;
            param_input._generated = param.is_array ? 'array' : struct;
            param_input.disabled = true;
            param_input.value = "Generated Value Only.";
            param_input.id = "array-param-input";
            param_input.className = "array-param-input";
            self_div.appendChild(param_input);
            struct_doms.push(param_input);
        } else {
            const param_label = document.createElement("label");
            param_label.id = "array-param-label";
            param_label.className = "array-param-label";
            param_label.textContent = param.alias || param.name;
            self_div.appendChild(param_label);
            const param_input = document.createElement("input");
            param_input._id = param.alias || param.name;
            param_input.value = param.default;
            param_input.id = "array-param-input";
            param_input.className = "array-param-input";
            self_div.appendChild(param_input);
            struct_doms.push(param_input);
        }
    }
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD STRUCT";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        new_target_item = null;
        if (Array.isArray(target)) {
            const obj = {};
            const new_path = JSON.parse(JSON.stringify(navigation));
            new_path[new_path.length - 1]._index = JSON.parse(JSON.stringify(target.length));
            obj.path = new_path;
            obj.gen = {};
            for (let i = 0; i < struct_params.length; i++) {
                const param = struct_params[i];
                const name = param.name;
                const type = param.type || "text";
                const array = param.is_array;
                const def = param.default;
                const is_struct = IsStructType(type);
                const copy_path = new_path.concat(
                    JSON.parse(JSON.stringify(param))
                );
                const config_json = obj.gen;
                config_json[name] = {};
                if (is_struct) {
                    const struct_name = GetStructName(type);
                    const file_name = plugin_name.slice(0, plugin_name.indexOf('.'));
                    const plugin_obj = await LoadPluginObjectFromFile(file_name);
                    console.log(plugin_obj)
                    const struct_data = plugin_obj.structs.find((data) => {
                        return data.name == struct_name;
                    })
                    let value = def;
                    const dom_element = struct_doms.find((dom) => {
                        return dom._id == name;
                    })
                    if (dom_element) {
                        value = dom_element.value;
                    }
                    if (array) {
                        const gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                        config_json[name].path = copy_path;
                        config_json[name].gen = gen;
                        config_json[name].list = [];
                    } else {
                        config_json[name].path = copy_path;
                        config_json[name].gen = GenerateLiteStructParam(struct_data, copy_path, plugin_obj.structs);
                    }
                } else {
                    let value = def;
                    const dom_element = struct_doms.find((dom) => {
                        return dom._id == name;
                    })
                    if (dom_element) {
                        value = dom_element.value;
                    }
                    if (array) {
                        config_json[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                        config_json[name].list = [];
                        config_json[name].path = copy_path;
                    } else {
                        config_json[name].gen = { value: value, type: type, array: array, no_struct: true, path: copy_path };
                        config_json[name].path = copy_path;
                    }
                }
            }
            new_target_item = obj;
        }
        if (!new_target_item) return;
        target.push(new_target_item);
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const gen = new_target_item.gen;
        const name = gen.no_struct ? gen.value : gen['Name'] ? gen['Name'].gen.value : target.length.toString();
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = name;
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            CreateStructParamDisplay(param, copy_nav, plugin_name, plugin_json, array_container);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
        const test_window = this._test_window;
        if (test_window) {
            if (test_window.closed) {
                this._test_window = null;
            } else {
                if (test_window.TriggerRefresh) {
                    test_window.TriggerRefresh();
                }
            }
        }
    }
    param_div.appendChild(add_button);
}

async function CreateArrayDisplayText(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const text_label = document.createElement('label');
    text_label.className = `text-edit-label`;
    text_label.textContent = `Text:`;
    main_container.appendChild(text_label);
    const text_input = document.createElement('input');
    text_input.className = `text-edit-input`;
    main_container.appendChild(text_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD TEXT";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = text_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'text',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayTextEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayNote(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const note_label = document.createElement('label');
    note_label.className = `note-edit-label`;
    note_label.textContent = `Note:`;
    main_container.appendChild(note_label);
    const note_input = document.createElement('textarea');
    note_input.className = `note-edit-input`;
    main_container.appendChild(note_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD NOTE";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = note_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'note',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayNoteEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayNumber(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const number_label = document.createElement('label');
    number_label.className = `number-edit-label`;
    number_label.textContent = `Number:`;
    main_container.appendChild(number_label);
    const number_input = document.createElement('input');
    number_input.className = `number-edit-input`;
    number_input.value = 0;
    number_input.type = `number`;
    main_container.appendChild(number_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD NUMBER";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = number_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'number',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayNumberEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplaySelect(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const options = param.options;
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const select_label = document.createElement('label');
    select_label.className = `selection-edit-label`;
    select_label.textContent = param.alias || param.name;
    main_container.appendChild(select_label);
    const select_input = document.createElement('select');
    select_input.id = "selection-edit-selector";
    select_input.className = "selection-edit-selector";
    main_container.appendChild(select_input);
    for (let i = 0; i < options.length; i++) {
        const opt_obj = options[i];
        const opt_div = document.createElement('option');
        if (opt_obj) {
            opt_div.selected = select_input.selected == i;
            opt_div.value = opt_obj.value;
            opt_div.textContent = opt_obj.name;
        }
        select_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD SELECTION";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = select_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'select',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArraySelectionEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayAnimation(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const animations_file = fs.readFileSync(`${base_path}/project/data/Animations.json`, 'utf8');
    const animations_json = JSON.parse(animations_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const anim_label = document.createElement('label');
    anim_label.className = `animation-edit-label`;
    anim_label.textContent = `Animation:`;
    main_container.appendChild(anim_label);
    const animation_input = document.createElement('select');
    animation_input.className = `animation-edit-input`;
    animation_input.selected = GetDataFromNavigation(navigation, plugin_json);
    animation_input.onchange = async function () {
        const anim_effect_data = animations_json[animation_input.value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
    }
    main_container.appendChild(animation_input);
    for (let i = 0; i < animations_json.length; i++) {
        const anim_data = animations_json[i];
        if (!anim_data) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = animation_input.selected == anim_data.id - 1;
        opt_div.value = anim_data.id;
        opt_div.textContent = anim_data.name;
        opt_div.onclick = async function () {
            //DO NOTHING
        }
        animation_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const anim_display_area = document.createElement('canvas');
    anim_display_area.id = "animation-display-div";
    anim_display_area.className = "animation-display-div";
    anim_display_area.onclick = function () {
        const anim_effect_data = animations_json[animation_input.value];
        const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
            const handle = context.play(effect);
            handle.setLocation(0, 0, 0);
        });
    }
    const renderer = new THREE.WebGLRenderer({ canvas: anim_display_area })
    renderer.setSize(anim_display_area.width, anim_display_area.height);
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30.0, anim_display_area.width / anim_display_area.height, 1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const context = effekseer.createContext();
    context.init(renderer.getContext());
    const fastRenderMode = true;
    if (fastRenderMode) {
        context.setRestorationOfStatesFlag(false);
    }
    const anim_effect_data = animations_json[1];
    const effect = context.loadEffect(`../../project/effects/${anim_effect_data.effectName}.efkefc`, 1.0, function () {
        const handle = context.play(effect);
        handle.setLocation(0, 0, 0);
    });
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        context.update(clock.getDelta() * 60.0);
        renderer.render(scene, camera);
        context.setProjectionMatrix(camera.projectionMatrix.elements);
        context.setCameraMatrix(camera.matrixWorldInverse.elements);
        context.draw();
        if (fastRenderMode) {
            renderer.resetState();
        }
    })();
    main_container.appendChild(anim_display_area);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD ANIMATION";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = animation_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'animation',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayAnimationEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayActor(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const actors_file = fs.readFileSync(`${base_path}/project/data/Actors.json`, 'utf8');
    const actors_json = JSON.parse(actors_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const actor_label = document.createElement('label');
    actor_label.className = `actor-edit-label`;
    actor_label.textContent = param.alias || param.name;
    main_container.appendChild(actor_label);
    const actor_input = document.createElement('select');
    actor_input.id = "actor-edit-selector";
    actor_input.className = "actor-edit-selector";
    const actor_id = GetDataFromNavigation(navigation, plugin_json)
    actor_input.selected = actors_json.indexOf(actors_json.find((file_json) => {
        if (!file_json) return false;
        return file_json.id == actor_id
    }));
    actor_input.onchange = async function () { }
    for (let i = 0; i < actors_json.length; i++) {
        const actor_data = actors_json[i];
        const opt_div = document.createElement('option');
        if (actor_data) {
            opt_div.selected = actor_input.selected == i;
            opt_div.value = actor_data.name;
            opt_div.textContent = actor_data.name;
        }
        actor_input.appendChild(opt_div);
    }
    main_container.appendChild(actor_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD ACTOR";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = actor_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = actors_json[index] ? actors_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'actor',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayActorEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayClass(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const classes_file = fs.readFileSync(`${base_path}/project/data/Classes.json`, 'utf8');
    const classes_json = JSON.parse(classes_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const class_label = document.createElement('label');
    class_label.className = `class-edit-label`;
    class_label.textContent = param.alias || param.name;
    main_container.appendChild(class_label);
    const class_input = document.createElement('select');
    class_input.id = "class-edit-selector";
    class_input.className = "class-edit-selector";
    for (let i = 0; i < classes_json.length; i++) {
        const class_data = classes_json[i];
        const opt_div = document.createElement('option');
        if (class_data) {
            opt_div.selected = class_input.selected == i;
            opt_div.value = class_data.name;
            opt_div.textContent = class_data.name;
        }
        class_input.appendChild(opt_div);
    }
    main_container.appendChild(class_input);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD CLASS";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = class_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = classes_json[index] ? classes_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'class',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayClassEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplaySkill(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const skills_file = fs.readFileSync(`${base_path}/project/data/Skills.json`, 'utf8');
    const skills_json = JSON.parse(skills_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const skill_label = document.createElement('label');
    skill_label.className = `skill-edit-label`;
    skill_label.textContent = param.alias || param.name;
    main_container.appendChild(skill_label);
    const skill_input = document.createElement('select');
    skill_input.id = "skill-edit-selector";
    skill_input.className = "skill-edit-selector";
    skill_input.selected = 0;
    main_container.appendChild(skill_input);
    for (let i = 0; i < skills_json.length; i++) {
        const skill_data = skills_json[i];
        const opt_div = document.createElement('option');
        if (skill_data) {
            opt_div.selected = skill_input.selected == i;
            opt_div.value = skill_data.name;
            opt_div.textContent = skill_data.name;
        }
        skill_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD SKILL";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = skill_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = skills_json[index] ? skills_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'skill',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArraySkillEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayItem(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const items_file = fs.readFileSync(`${base_path}/project/data/Items.json`, 'utf8');
    const items_json = JSON.parse(items_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const item_label = document.createElement('label');
    item_label.className = `item-edit-label`;
    item_label.textContent = param.alias || param.name;
    main_container.appendChild(item_label);
    const item_input = document.createElement('select');
    item_input.id = "item-edit-selector";
    item_input.className = "item-edit-selector";
    item_input.selected = 0;
    main_container.appendChild(item_input);
    for (let i = 0; i < items_json.length; i++) {
        const actor_data = items_json[i];
        const opt_div = document.createElement('option');
        if (actor_data) {
            opt_div.selected = item_input.selected == i;
            opt_div.value = actor_data.name;
            opt_div.textContent = actor_data.name;
        }
        item_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD ITEM";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = item_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = items_json[index] ? items_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'item',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayItemEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayWeapon(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const weapons_file = fs.readFileSync(`${base_path}/project/data/Weapons.json`, 'utf8');
    const weapons_json = JSON.parse(weapons_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const weapon_label = document.createElement('label');
    weapon_label.className = `weapon-edit-label`;
    weapon_label.textContent = param.alias || param.name;
    main_container.appendChild(weapon_label);
    const weapon_input = document.createElement('select');
    weapon_input.id = "weapon-edit-selector";
    weapon_input.className = "weapon-edit-selector";
    weapon_input.selected = 0;
    main_container.appendChild(weapon_input);
    for (let i = 0; i < weapons_json.length; i++) {
        const weapon_data = weapons_json[i];
        const opt_div = document.createElement('option');
        if (weapon_data) {
            opt_div.selected = weapon_input.selected == i;
            opt_div.value = weapon_data.name;
            opt_div.textContent = weapon_data.name;
        }
        weapon_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD WEAPON";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = weapon_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = weapons_json[index] ? weapons_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'weapon',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayWeaponEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayArmor(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const armors_file = fs.readFileSync(`${base_path}/project/data/Armors.json`, 'utf8');
    const armors_json = JSON.parse(armors_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const armor_label = document.createElement('label');
    armor_label.className = `armor-edit-label`;
    armor_label.textContent = param.alias || param.name;
    main_container.appendChild(armor_label);
    const armor_input = document.createElement('select');
    armor_input.id = "armor-edit-selector";
    armor_input.className = "armor-edit-selector";
    armor_input.selected = 0;
    main_container.appendChild(armor_input);
    for (let i = 0; i < armors_json.length; i++) {
        const armor_data = armors_json[i];
        const opt_div = document.createElement('option');
        if (armor_data) {
            opt_div.selected = armor_input.selected == i;
            opt_div.value = armor_data.name;
            opt_div.textContent = armor_data.name;
        }
        armor_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD ARMOR";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = armor_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = armors_json[index] ? armors_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'armor',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayArmorEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayEnemy(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const enemies_file = fs.readFileSync(`${base_path}/project/data/Enemies.json`, 'utf8');
    const enemies_json = JSON.parse(enemies_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const enemy_label = document.createElement('label');
    enemy_label.className = `enemy-edit-label`;
    enemy_label.textContent = param.alias || param.name;
    main_container.appendChild(enemy_label);
    const enemy_input = document.createElement('select');
    enemy_input.id = "enemy-edit-selector";
    enemy_input.className = "enemy-edit-selector";
    enemy_input.selected = 0;
    main_container.appendChild(enemy_input);
    for (let i = 0; i < enemies_json.length; i++) {
        const enemy_data = enemies_json[i];
        const opt_div = document.createElement('option');
        if (enemy_data) {
            opt_div.selected = enemy_input.selected == i;
            opt_div.value = enemy_data.name;
            opt_div.textContent = enemy_data.name;
        }
        enemy_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD ENEMY";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = enemy_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = enemies_json[index] ? enemies_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'enemy',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayEnemyEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayTroop(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const troops_file = fs.readFileSync(`${base_path}/project/data/Troops.json`, 'utf8');
    const troops_json = JSON.parse(troops_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const troop_label = document.createElement('label');
    troop_label.className = `troop-edit-label`;
    troop_label.textContent = param.alias || param.name;
    main_container.appendChild(troop_label);
    const troop_input = document.createElement('select');
    troop_input.id = "troop-edit-selector";
    troop_input.className = "troop-edit-selector";
    troop_input.selected = 0;
    main_container.appendChild(troop_input);
    for (let i = 0; i < troops_json.length; i++) {
        const troop_data = troops_json[i];
        const opt_div = document.createElement('option');
        if (troop_data) {
            opt_div.selected = troop_input.selected == i;
            opt_div.value = troop_data.name;
            opt_div.textContent = troop_data.name;
        }
        troop_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD TROOP";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = troop_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = troops_json[index] ? troops_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'troop',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayTroopEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayState(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const states_file = fs.readFileSync(`${base_path}/project/data/States.json`, 'utf8');
    const states_json = JSON.parse(states_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const state_label = document.createElement('label');
    state_label.className = `state-edit-label`;
    state_label.textContent = param.alias || param.name;
    main_container.appendChild(state_label);
    const state_input = document.createElement('select');
    state_input.id = "state-edit-selector";
    state_input.className = "state-edit-selector";
    state_input.selected = 0;
    main_container.appendChild(state_input);
    for (let i = 0; i < states_json.length; i++) {
        const state_data = states_json[i];
        const opt_div = document.createElement('option');
        if (state_data) {
            opt_div.selected = state_input.selected == i;
            opt_div.value = state_data.name;
            opt_div.textContent = state_data.name;
        }
        state_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD STATE";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = state_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = states_json[index] ? states_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'state',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayStateEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayTileset(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const tilesets_file = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    const tilesets_json = JSON.parse(tilesets_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const tileset_label = document.createElement('label');
    tileset_label.className = `tileset-edit-label`;
    tileset_label.textContent = param.alias || param.name;
    main_container.appendChild(tileset_label);
    const tileset_input = document.createElement('select');
    tileset_input.id = "tileset-edit-selector";
    tileset_input.className = "tileset-edit-selector";
    tileset_input.selected = 0;
    main_container.appendChild(tileset_input);
    for (let i = 0; i < tilesets_json.length; i++) {
        const tileset_data = tilesets_json[i];
        const opt_div = document.createElement('option');
        if (tileset_data) {
            opt_div.selected = tileset_input.selected == i;
            opt_div.value = tileset_data.name;
            opt_div.textContent = tileset_data.name;
        }
        tileset_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD TILESET";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = tileset_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = tilesets_json[index] ? tilesets_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'tileset',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayTilesetEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayCommonEvent(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const c_events_file = fs.readFileSync(`${base_path}/project/data/CommonEvents.json`, 'utf8');
    const c_events_json = JSON.parse(c_events_file);
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const event_label = document.createElement('label');
    event_label.className = `event-edit-label`;
    event_label.textContent = param.alias || param.name;
    main_container.appendChild(event_label);
    const event_input = document.createElement('select');
    event_input.id = "event-edit-selector";
    event_input.className = "event-edit-selector";
    event_input.selected = 0;
    main_container.appendChild(event_input);
    for (let i = 0; i < c_events_json.length; i++) {
        const event_data = c_events_json[i];
        const opt_div = document.createElement('option');
        if (event_data) {
            opt_div.selected = event_input.selected == i;
            opt_div.value = event_data.name;
            opt_div.textContent = event_data.name;
        }
        event_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD COMMON EVENT";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = event_input.selectedIndex;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = c_events_json[index] ? c_events_json[index].id : 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'common_event',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayEventEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplaySwitch(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const switch_label = document.createElement('label');
    switch_label.className = `switch-edit-label`;
    switch_label.textContent = param.alias || param.name;
    main_container.appendChild(switch_label);
    const switch_input = document.createElement('select');
    switch_input.id = "switch-edit-selector";
    switch_input.className = "switch-edit-selector";
    switch_input.value = 0;
    main_container.appendChild(switch_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD SWITCH";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = parseInt(switch_input.value) || 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'switch',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArraySwitchEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayVariable(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const variable_label = document.createElement('label');
    variable_label.className = `variable-edit-label`;
    variable_label.textContent = param.alias || param.name;
    main_container.appendChild(variable_label);
    const variable_input = document.createElement('select');
    variable_input.id = "variable-edit-selector";
    variable_input.className = "variable-edit-selector";
    variable_input.value = 0;
    main_container.appendChild(variable_input);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD VARIABLE";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = parseInt(variable_input.value) || 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'variable',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayVariableEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayMap(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const base_path = process.cwd();
    const data_dir = fs.readdirSync(`${base_path}/project/data/`, 'utf8');
    const map_file_list = data_dir.filter((filename) => {
        return (filename.match(/(Map[0-9]+)/gm));
    })
    const map_files = map_file_list.map((filename) => {
        try {
            const file = fs.readFileSync(`${base_path}/project/data/${filename}`, 'utf8');
            try {
                const map = JSON.parse(file);
                map._name = map.displayName || (filename || "").replace(`.json`, "");
                map._file = (filename).replace(`.json`, "");
                map._id = eval(filename.replace(`Map`, '').replace(`.json`, ''));
                return map;
            } catch (e) {
                return file;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    })
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const map_label = document.createElement('label');
    map_label.className = `map-edit-label`;
    map_label.textContent = param.alias || param.name;
    main_container.appendChild(map_label);
    const map_input = document.createElement('select');
    map_input.className = `map-edit-input`;
    map_input.selected = 0;
    map_input.onchange = async function () {
        SetMapDisplay();
    }
    main_container.appendChild(map_input);
    for (let i = 0; i < map_files.length; i++) {
        const map_file = map_files[i];
        if (!map_file) continue;
        const opt_div = document.createElement('option');
        opt_div.selected = map_input.selected == map_file._id - 1;
        opt_div.value = map_file._id;
        opt_div.textContent = map_file._name;
        map_input.appendChild(opt_div);
    }
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const pixi = new PIXI.Application();
    await pixi.init(
        {
            background: '#000000',
            resizeTo: div
        }
    );
    pixi.canvas.id = "map-display-div";
    pixi.canvas.className = "map-display-div";
    pixi.canvas.textContent = "Not Supported";
    div.appendChild(pixi.canvas);
    const tilesets_json_str = fs.readFileSync(`${base_path}/project/data/Tilesets.json`, 'utf8');
    let tilesets_json = null;
    try {
        tilesets_json = JSON.parse(tilesets_json_str);
    } catch (e) {
        tilesets_json = tilesets_json_str;
    }
    const SetMapDisplay = async function () {
        const index = map_input.selectedIndex;
        const map_file = map_files[index];
        const mapping_data = map_file.data;
        const map_tile_width = map_file.width;
        const map_tile_height = map_file.height;
        const map_events = map_file.events;
        const tileset_id = map_file.tilesetId;
        const tileset_data = tilesets_json.find((data) => {
            if (!data) return;
            return data.id == tileset_id;
        })
        const map_obj = {
            file: map_file,
            data: mapping_data,
            width: map_tile_width,
            height: map_tile_height,
            events: map_events
        }
        const map_sprite = new Map_Sprite(map_obj, tileset_data);
        pixi.stage.addChild(map_sprite);
        pixi.ticker.add((t) => {
            const dt = t.deltaTime;
            map_sprite.update(dt);
        })
    }
    const map_data_div = document.createElement("div");
    map_data_div.id = "map-data-div";
    map_data_div.className = "map-data-div";
    main_container.appendChild(map_data_div)
    SetMapDisplay();
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD MAP";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const index = map_input.selectedIndex;
        const map_file = map_files[index];
        const map_id = eval(map_file._file.replace(`Map`, '').replace(`.json`, ''));
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const value = map_id || 0;
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'map',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayMapEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayFile(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    const aud_file_types = [`.ogg`];
    const img_file_types = [`.png`];
    const dir = param.dir;
    const base_path = process.cwd();
    const main_path = `${base_path}/project/${dir}`;
    const file_dir = fs.readdirSync(main_path, 'utf8');
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const file_info_div = document.createElement("div");
    file_info_div.id = "file-param-info";
    file_info_div.className = "file-param-info";
    main_container.appendChild(file_info_div);
    const file_label = document.createElement("label");
    file_label.className = `file-edit-label`;
    file_label.textContent = param.alias || param.name;
    file_info_div.appendChild(file_label);
    const file_input = document.createElement("input");
    file_input.className = `file-edit-input`;
    file_input.value = GetDataFromNavigation(navigation, plugin_json) || "";
    file_input.type = "text";
    file_input.disabled = true;
    file_info_div.appendChild(file_input);
    const file_container = document.createElement("div");
    file_container.id = "file-container-div";
    file_container.className = "file-container-div";
    main_container.appendChild(file_container);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const nested_dir_reader = function (old_path, added_path, last_block) {
        const new_path = `${old_path}/${added_path}`;
        try {
            const file_dir = fs.readdirSync(new_path, 'utf8');
            const button = document.createElement("button");
            button.className = "file-dir-button";
            button.textContent = `📁${added_path}📁`;
            button.onclick = function () {
                console.log(sub_file_block.style.display)
                if (sub_file_block.style.display == "none") {
                    sub_file_block.style.display = "block";
                } else {
                    sub_file_block.style.display = "none";
                }
            }
            last_block.appendChild(button);
            const sub_file_block = document.createElement("div");
            sub_file_block.id = "file-block-div";
            sub_file_block.className = "file-block-div";
            sub_file_block.style.display = "none";
            last_block.appendChild(sub_file_block);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                if (nested_dir_reader(new_path, file, sub_file_block)) {
                    file_dir.splice(i, 1);
                    i--;
                }
            }
            const search_div = document.createElement("div");
            search_div.className = "file-search-div";
            sub_file_block.appendChild(search_div);
            const file_search_label = document.createElement("label");
            file_search_label.id = "file-search-label";
            file_search_label.className = "file-search-label";
            file_search_label.textContent = `SEARCH ${added_path.toUpperCase()}`;
            search_div.appendChild(file_search_label);
            const file_search_input = document.createElement("input");
            file_search_input.id = "file-search-input";
            file_search_input.className = "file-search-input";
            file_search_input.oninput = function () {
                const search = file_search_input.value;
                const files = files_div.children;
                if (search) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const file_childs = file.children;
                        const file_div = file_childs['file-card-button'];
                        const div_childs = file_div.children;
                        const name_div = div_childs['card-name-div']
                        const name = name_div.textContent || "";
                        if (name.match(search)) {
                            file.style.display = "block";
                        } else {
                            file.style.display = "none";
                        }
                    }
                } else {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        file.style.display = "block";
                    }
                }
            }
            search_div.appendChild(file_search_input);
            const files_div = document.createElement("div");
            files_div.className = "files-flex-div";
            sub_file_block.appendChild(files_div);
            for (let i = 0; i < file_dir.length; i++) {
                const file = file_dir[i];
                const name = file.slice(0, file.indexOf(`.`));
                const card = document.createElement("div");
                card.id = "file-card-div";
                card.className = "file-card-div";
                files_div.appendChild(card);
                const card_button = document.createElement("div");
                card_button.id = "file-card-button";
                card_button.className = "file-card-button";
                card.appendChild(card_button);
                const is_audio = aud_file_types.some((type) => {
                    return file.match(type);
                })
                const is_image = img_file_types.some((type) => {
                    return file.match(type);
                })
                const card_name = document.createElement("div");
                card_name.id = "card-name-div";
                card_name.className = "card-name-div";
                card_name.textContent = name;
                card_button.appendChild(card_name);
                const card_content = document.createElement("div");
                card_content.id = "card-content-div";
                card_content.className = "card-content-div";
                card_button.appendChild(card_content);
                if (is_audio) {
                    const aud_dom = document.createElement('audio');
                    aud_dom.className = "card-file-aud";
                    aud_dom.src = `${new_path}/${file}`;
                    aud_dom.alt = file;
                    aud_dom.preload = true;
                    aud_dom.controls = true;
                    card_content.appendChild(aud_dom);
                }
                if (is_image) {
                    const img_dom = document.createElement("img");
                    img_dom.className = "card-file-img";
                    img_dom.src = `${new_path}/${file}`;
                    img_dom.alt = file;
                    card_content.appendChild(img_dom);
                }
                const set_button = document.createElement("button");
                set_button.id = "set-file-button";
                set_button.className = "set-file-button";
                set_button.textContent = "️✅";
                set_button.onclick = async function () {
                    let value = (`${new_path}/${file}`).replace(main_path, "");
                    value = value.slice(1, value.indexOf('.'));
                    file_input.value = value;
                }
                card_button.appendChild(set_button);
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    const file_block_main = document.createElement("div");
    file_block_main.className = "file-block-div";
    file_container.appendChild(file_block_main);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        if (nested_dir_reader(main_path, file, file_block_main)) {
            file_dir.splice(i, 1);
            i--;
        }
    }
    const search_div = document.createElement("div");
    search_div.className = "file-search-div";
    file_block_main.appendChild(search_div);
    const file_search_label = document.createElement("label");
    file_search_label.id = "file-search-label";
    file_search_label.className = "file-search-label";
    file_search_label.textContent = `SEARCH FILES`;
    search_div.appendChild(file_search_label);
    const file_search_input = document.createElement("input");
    file_search_input.id = "file-search-input";
    file_search_input.className = "file-search-input";
    file_search_input.oninput = function () {
        const search = file_search_input.value;
        const files = files_div.children;
        if (search) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const file_childs = file.children;
                const file_div = file_childs['file-card-button'];
                const div_childs = file_div.children;
                const name_div = div_childs['card-name-div']
                const name = name_div.textContent || "";
                if (name.match(search)) {
                    file.style.display = "block";
                } else {
                    file.style.display = "none";
                }
            }
        } else {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                file.style.display = "block";
            }
        }
    }
    search_div.appendChild(file_search_input);
    const files_div = document.createElement("div");
    files_div.className = "files-flex-div";
    file_block_main.appendChild(files_div);
    for (let i = 0; i < file_dir.length; i++) {
        const file = file_dir[i];
        const name = file.slice(0, file.indexOf(`.`));
        const card = document.createElement("div");
        card.id = "file-card-div";
        card.className = "file-card-div";
        files_div.appendChild(card);
        const card_button = document.createElement("div");
        card_button.id = "file-card-button";
        card_button.className = "file-card-button";
        card.appendChild(card_button);
        const is_audio = aud_file_types.some((type) => {
            return file.match(type);
        })
        const is_image = img_file_types.some((type) => {
            return file.match(type);
        })
        const card_name = document.createElement("div");
        card_name.id = "card-name-div";
        card_name.className = "card-name-div";
        card_name.textContent = name;
        card_button.appendChild(card_name);
        const card_content = document.createElement("div");
        card_content.id = "card-content-div";
        card_content.className = "card-content-div";
        card_button.appendChild(card_content);
        if (is_audio) {
            const aud_dom = document.createElement('audio');
            aud_dom.className = "card-file-aud";
            aud_dom.src = `${main_path}/${file}`;
            aud_dom.alt = file;
            aud_dom.preload = true;
            aud_dom.controls = true;
            card_content.appendChild(aud_dom);
        }
        if (is_image) {
            const img_dom = document.createElement("img");
            img_dom.className = "card-file-img";
            img_dom.src = `${main_path}/${file}`;
            img_dom.alt = file;
            card_content.appendChild(img_dom);
        }
        const set_button = document.createElement("button");
        set_button.id = "set-file-button";
        set_button.className = "set-file-button";
        set_button.textContent = "️✅";
        set_button.onclick = async function () {
            const value = file.slice(0, file.indexOf('.'));
            file_input.value = value;
        }
        card_button.appendChild(set_button);
    }
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD FILE";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = file_input.value;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'file',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayFileEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

async function CreateArrayDisplayBoolean(display_div, list_div, navigation, param, plugin_json, plugin_name) {
    display_div.innerHTML = "";
    const main_container = document.createElement("div");
    main_container.id = "array-param-edit-div";
    main_container.className = "array-param-edit-div";
    display_div.appendChild(main_container);
    const bool_label = document.createElement('label');
    bool_label.className = `boolean-edit-label`;
    bool_label.textContent = param.alias || param.name;
    main_container.appendChild(bool_label);
    const bool_div = document.createElement('div');
    bool_div.id = "boolean-input-div";
    bool_div.className = "boolean-input-div";
    main_container.appendChild(bool_div);
    const desc_div = document.createElement('div');
    desc_div.className = "edit-desc-div";
    desc_div.textContent = param.desc;
    main_container.appendChild(desc_div);
    const bool_input_true = document.createElement('input');
    bool_input_true.type = 'radio';
    bool_input_true.name = param.alias || param.name;
    bool_input_true.id = "bool-selector-true";
    bool_input_true.className = "bool-selector-true";
    bool_input_true.value = "true";
    bool_input_true.checked = false;
    bool_div.appendChild(bool_input_true);
    const bool_input_true_label = document.createElement('label');
    bool_input_true_label.id = "bool-selector-true-label";
    bool_input_true_label.className = "bool-selector-true-label";
    bool_input_true_label.for = "bool-selector-true";
    bool_input_true_label.textContent = "True";
    bool_div.appendChild(bool_input_true_label);
    const bool_input_false = document.createElement('input');
    bool_input_false.type = 'radio';
    bool_input_false.name = param.alias || param.name;
    bool_input_false.id = "bool-selector-false";
    bool_input_false.className = "bool-selector-false";
    bool_input_false.value = "false";
    bool_input_false.checked = true;
    bool_div.appendChild(bool_input_false);
    const bool_input_false_label = document.createElement('label');
    bool_input_false_label.id = "bool-selector-false-label";
    bool_input_false_label.className = "bool-selector-false-label";
    bool_input_false_label.for = "bool-selector-false";
    bool_input_false_label.textContent = "False";
    bool_div.appendChild(bool_input_false_label);
    const add_button = document.createElement("button");
    add_button.id = "array-display-add-button";
    add_button.className = "array-display-add-button";
    add_button.textContent = "ADD BOOLEAN";
    add_button.onclick = async function () {
        RemoveArrayItemEditElements();
        const value = !!event_input_true.checked;
        let target = plugin_json;
        for (let i = 0; i < navigation.length; i++) {
            const nav_data = navigation[i];
            const name = nav_data.name;
            const index = eval(nav_data.index);
            target = target[name];
            if (target.list) {
                target = target.list;
                if (!isNaN(index)) {
                    target = target[index];
                    if (target.gen) {
                        target = target.gen;
                    }
                }
            }
            if (target.gen) {
                target = target.gen;
            }
        }
        const nav_path = JSON.parse(JSON.stringify(navigation));
        nav_path[navigation.length - 1]._index = JSON.parse(JSON.stringify(target.length));
        const gen = {
            value: value,
            no_struct: true,
            type: 'boolean',
            array: false,
            path: nav_path
        };
        target.push({ gen, path: nav_path });
        const array_containers = document.getElementsByClassName("array-container-div");
        const array_container = array_containers[array_containers.length - 1];
        const item_div = document.createElement("div");
        item_div.id = "array-list-item-div";
        item_div.className = "array-list-item-div";
        item_div._index = JSON.parse(JSON.stringify(target.length - 1));
        list_div.appendChild(item_div);
        list_div._items.push(item_div);
        const button_div = document.createElement("div");
        button_div.id = "array-list-button-div";
        button_div.className = "array-list-button-div";
        item_div.appendChild(button_div);
        const button = document.createElement('button');
        button.id = "array-list-button";
        button.className = "array-list-button";
        button.textContent = value.toString().slice(0, 9);
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = "Begin editing list item";
        }
        button.onclick = async function () {
            const copy_nav = JSON.parse(JSON.stringify(navigation));
            copy_nav[copy_nav.length - 1].index = list_div._items.indexOf(item_div);
            copy_nav[copy_nav.length - 1].type = JSON.parse(JSON.stringify(param.type));
            copy_nav[copy_nav.length - 1].array = false;
            await CreateArrayBooleanEdit(param, copy_nav, plugin_name, plugin_json, array_container, button);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        button_div.appendChild(button);
        const delete_button = document.createElement('button');
        delete_button.id = "array-list-del-button";
        delete_button.className = "array-list-del-button";
        delete_button.textContent = "X";
        delete_button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = `Warning: This will delete ${name}`;
        }
        delete_button.onclick = async function () {
            RemoveArrayItemEditElements();
            const del_index = list_div._items.indexOf(item_div);
            item_div.parentElement.removeChild(item_div);
            list_div._items.splice(list_div._items.indexOf(item_div), 1);
            for (let i = 0; i < list_div._items.length; i++) {
                const indx = JSON.parse(JSON.stringify(i));
                const dom = list_div._items[i];
                dom._index = indx;
            }
            const nav_index = navigation.length - 1;
            for (let i = del_index + 1; i < target.length; i++) {
                const obj = target[i];
                DecreaseListPathIndex(obj, nav_index, true);
            }
            target.splice(del_index, 1);
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        button_div.appendChild(delete_button);
        const shift_div = document.createElement("div");
        shift_div.id = "array-element-shift-div";
        shift_div.className = "array-element-shift-div";
        item_div.appendChild(shift_div);
        const shift_up_btn = document.createElement("button");
        shift_up_btn.id = "array-element-shift-button";
        shift_up_btn.className = "array-element-shift-button";
        shift_up_btn.textContent = "🔼";
        shift_up_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx <= 0) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const prev_itm = list_items[cur_indx - 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx - 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(prev_itm);
                }
                if (item == cur_item || item == prev_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const prev_element = list_item_arr[cur_indx - 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx - 1) {
                    new_arr.push(item_div);
                }
                if (i == cur_indx) {
                    new_arr.push(prev_element);
                }
                if (dom == item_div || dom == prev_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);

        }
        shift_div.appendChild(shift_up_btn);
        const shift_dn_btn = document.createElement("button");
        shift_dn_btn.id = "array-element-shift-button";
        shift_dn_btn.className = "array-element-shift-button";
        shift_dn_btn.textContent = "🔽";
        shift_dn_btn.onclick = async function () {
            RemoveArrayItemEditElements();
            const list_item_arr = list_div._items;
            const cur_indx = list_item_arr.indexOf(item_div);
            if (cur_indx >= (list_item_arr.length - 1)) {
                return;
            }
            const nav_index = navigation.length - 1;
            list_items = target;
            const next_itm = list_items[cur_indx + 1];
            const cur_item = list_items[cur_indx];
            const targ_list_arr = []
            for (let a = 0; a < list_items.length; a++) {
                const item = list_items[a];
                if (a == cur_indx + 1) {
                    targ_list_arr.push(cur_item);
                }
                if (a == cur_indx) {
                    targ_list_arr.push(next_itm);
                }
                if (item == cur_item || item == next_itm) continue;
                targ_list_arr.push(item);
            }
            for (let c = 0; c < targ_list_arr.length; c++) {
                const val = JSON.parse(JSON.stringify(c));
                const item = targ_list_arr[c];
                ResetNavIndex(item, nav_index, val, item_div._newlyAdded)
            }
            for (let q = 0; q < target.length; q++) {
                target.shift();
            }
            for (let q = 0; q < targ_list_arr.length; q++) {
                target[q] = targ_list_arr[q];
            }
            const next_element = list_item_arr[cur_indx + 1];
            const new_arr = [];
            for (let i = 0; i < list_item_arr.length; i++) {
                const dom = list_item_arr[i];
                if (i == cur_indx) {
                    new_arr.push(next_element);
                }
                if (i == cur_indx + 1) {
                    new_arr.push(item_div);
                }
                if (dom == item_div || dom == next_element) continue;
                new_arr.push(dom);
            }
            for (let q = 0; q < new_arr.length; q++) {
                const dom = new_arr[q];
                dom._index = JSON.parse(JSON.stringify(q));
                const parent = dom.parentElement;
                parent.removeChild(dom);
                parent.appendChild(dom);
            }
            list_div._items = new_arr;
            await SaveProjectEditorObject(plugin_json, plugin_name);
        }
        shift_div.appendChild(shift_dn_btn);
        await SaveProjectEditorObject(plugin_json, plugin_name);
    }
    main_container.appendChild(add_button);
}

function CreateParamDisplay(param, navigation, plugin_json, plugin_name) {
    const display_area = document.getElementById(`display-area`);
    display_area.style.display = 'flex';
    const plugin_selc_editor = document.getElementById(`parameter-selection-editor`);
    plugin_selc_editor.innerHTML = "";
    plugin_selc_editor.style.display = `block`;
    const struct_containers = document.getElementsByClassName(`struct-container-div`);
    for (let i = 0; i < struct_containers.length; i++) {
        const struct_container = struct_containers[i];
        if (struct_container.parentElement) {
            struct_container.parentElement.removeChild(struct_container);
        }
        if (struct_container.parentElement) {
            struct_container.parentElement.remove();
        }
    }
    const param_div = document.createElement('div');
    param_div.id = "param-edit-div";
    param_div.className = "param-edit-div";
    plugin_selc_editor.appendChild(param_div);
    const type = param.type || "text";
    if (param.is_array) {
        navigation.push({ name: param.name, type: 'array', array: true });
        CreateParamArrayDisplay(param, navigation, plugin_name, plugin_json);
        return;
    }
    if (type.match(/(struct)<(\S+)>/gmi)) {
        navigation.push({ name: param.name, type: 'struct', array: false })
        CreateStructParam(param, navigation, plugin_name, plugin_json);
        return;
    }
    if (type.match(/(text)/gmi)) {
        navigation.push({ name: param.name, type: 'text', array: false })
        CreateTextParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(note)/gmi)) {
        navigation.push({ name: param.name, type: 'note', array: false })
        CreateNoteParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(number)/gmi)) {
        navigation.push({ name: param.name, type: 'number', array: false })
        CreateNumberParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(select)/gmi)) {
        navigation.push({ name: param.name, type: 'select', array: false })
        CreateSelectParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(animation)/gmi)) {
        navigation.push({ name: param.name, type: 'animation', array: false })
        CreateAnimationParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(actor)/gmi)) {
        navigation.push({ name: param.name, type: 'actor', array: false })
        CreateActorParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(class)/gmi)) {
        navigation.push({ name: param.name, type: 'class', array: false })
        CreateClassParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(skill)/gmi)) {
        navigation.push({ name: param.name, type: 'skill', array: false })
        CreateSkillParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(item)/gmi)) {
        navigation.push({ name: param.name, type: 'item', array: false })
        CreateItemParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(weapon)/gmi)) {
        navigation.push({ name: param.name, type: 'weapon', array: false })
        CreateWeaponParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(armor)/gmi)) {
        navigation.push({ name: param.name, type: 'armor', array: false })
        CreateArmorParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(enemy)/gmi)) {
        navigation.push({ name: param.name, type: 'enemy', array: false })
        CreateEnemyParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(troop)/gmi)) {
        navigation.push({ name: param.name, type: 'troop', array: false })
        CreateTroopParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(state)/gmi)) {
        navigation.push({ name: param.name, type: 'state', array: false })
        CreateStateParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(tileset)/gmi)) {
        navigation.push({ name: param.name, type: 'tileset', array: false })
        CreateTilesetParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(common_event)/gmi)) {
        navigation.push({ name: param.name, type: 'common_event', array: false })
        CreateCommonEventParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(switch)/gmi)) {
        navigation.push({ name: param.name, type: 'switch', array: false })
        CreateSwitchParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(variable)/gmi)) {
        navigation.push({ name: param.name, type: 'variable', array: false })
        CreateVariableParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(map)/gmi)) {
        navigation.push({ name: param.name, type: 'map', array: false })
        CreateMapParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(file)/gmi)) {
        navigation.push({ name: param.name, type: 'file', dir: param.dir, array: false })
        CreateFileParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
    if (type.match(/(boolean)/gmi)) {
        navigation.push({ name: param.name, type: 'file', dir: param.dir, array: false })
        CreateBooleanParam(param_div, param, navigation, plugin_json, plugin_name);
        return;
    }
}

function ClearStructContainerDivs() {
    const struct_containers = document.getElementsByClassName(`struct-container-div`);
    for (let i = 0; i < struct_containers.length; i++) {
        const struct_container = struct_containers[i];
        if (struct_container.parentElement) {
            struct_container.parentElement.removeChild(struct_container);
        }
        if (struct_container.parentElement) {
            struct_container.parentElement.remove();
        }
    }
}

function ClearArrayContainerDivs() {
    const array_containers = document.getElementsByClassName(`array-container-div`);
    for (let i = 0; i < array_containers.length; i++) {
        const array_container = array_containers[i];
        if (array_container.parentElement) {
            array_container.parentElement.removeChild(array_container);
        }
        if (array_container.parentElement) {
            array_container.parentElement.remove();
        }
    }
}

function ClearMapContainerDivs() {
    const map_displays = document.getElementsByClassName("map-display-div");
    for (let i = 0; i < map_displays.length; i++) {
        const map_display = map_displays[i];
        if (map_display.parentElement) {
            map_display.parentElement.removeChild(map_display);
        }
        if (map_display.parentElement) {
            map_display.parentElement.remove();
        }
    }
}

function ClearContainerDivs() {
    ClearStructContainerDivs();
    ClearArrayContainerDivs();
    ClearMapContainerDivs();
}

async function DrawPluginMainParameters(name) {
    const display_area = document.getElementById(`display-area`);
    display_area.style.display = 'flex';
    ClearContainerDivs();
    const file_name = name.slice(0, name.indexOf('.'));
    const parameter_list_div = document.getElementById(`parameter-selection-list`);
    parameter_list_div.innerHTML = "";
    const plugin_obj = await LoadPluginObjectFromFile(file_name);
    if (!plugin_obj) {
        console.error(`No plugin data for ${file_name}.`)
    }
    const project_json = await LoadProjectPluginJsonFile(file_name);
    if (!project_json) {
        console.error(`No plugin json file in project folder for ${file_name}.`);
    }
    const plugin_name = plugin_obj.name;
    const params = plugin_obj.params;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (!param.type) continue;
        const button = document.createElement('button');
        button.id = "plugin-main-parameter-button";
        button.className = "plugin-main-parameter-button";
        button.textContent = param.alias || param.name;
        button.onmouseenter = function () {
            const editor_msg = document.getElementById(`editor-message`);
            editor_msg.textContent = param.desc || "No Description.";
        }
        button.onclick = function () {
            CreateParamDisplay(param, [], project_json, plugin_name);
            const test_window = this._test_window;
            if (test_window) {
                if (test_window.closed) {
                    this._test_window = null;
                } else {
                    if (test_window.TriggerRefresh) {
                        test_window.TriggerRefresh();
                    }
                }
            }
        }
        parameter_list_div.appendChild(button);
    }
}

function UpdatePluginList() {
    const display_area = document.getElementById(`display-area`);
    display_area.style.display = 'flex';
    const struct_containers = document.getElementsByClassName(`struct-container-div`);
    for (let i = 0; i < struct_containers.length; i++) {
        const struct_container = struct_containers[i];
        if (struct_container.parentElement) {
            struct_container.parentElement.removeChild(struct_container);
        }
        if (struct_container.parentElement) {
            struct_container.parentElement.remove();
        }
    }
    const search_input = document.getElementById('plugin-search-bar').value;
    const list_buttons = document.getElementsByClassName('plugin-load-button');
    for (let i = 0; i < list_buttons.length; i++) {
        const btn = list_buttons[i];
        const name = btn.textContent;
        if (!search_input || name.match(search_input)) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    }
}