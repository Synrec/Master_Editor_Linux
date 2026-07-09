function AddKeyboardShortcuts() {
    document.addEventListener('keydown', function (event) {
        if (
            (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key === 'r'
            ) ||
            (
                event.keyCode == 116
            )
        ) {
            event.preventDefault();
            window.location.reload();
        }
    });
}

async function SavePluginObjectToFile(data, name) {
    const file_name = name.slice(0, name.indexOf('.'));
    const json_str = JSON.stringify(data);
    const origin_path = process.cwd();
    if (!fs.existsSync(`${origin_path}/app/_plugins`)) {
        fs.mkdirSync(`${origin_path}/app/_plugins`);
    }
    fs.writeFileSync(`${origin_path}/app/_plugins/${file_name}.json`, json_str);
}

async function LoadPluginObjectFromFile(filename) {
    const origin_path = process.cwd();
    if (!fs.existsSync(`${origin_path}/app/_plugins`)) {
        fs.mkdirSync(`${origin_path}/app/_plugins`);
    }
    if (!fs.existsSync(`${origin_path}/app/_plugins/${filename}.json`)) return;
    let file = null;
    file = await fs.readFileSync(`${origin_path}/app/_plugins/${filename}.json`, 'utf8');
    if (file) {
        try {
            const parsed_file = JSON.parse(file);
            return parsed_file;
        } catch (e) {
            console.error(e);
            return file;
        }
    }
    return file_returned;
}

function LoadProjectPluginFile(name) {
    try {
        const file = fs.readFileSync(`./project/js/plugins/${name}`, 'utf8')
        return file;
    } catch (e) {
        return null;
    }
}

function LoadProjectPluginJsonFile(name) {
    try {
        const file = fs.readFileSync(`./project/js/plugins/data/${name}.json`, 'utf8')
        if (file) {
            try {
                return JSON.parse(file);
            } catch (e) {
                return null;
            }
        }
        return file;
    } catch (e) {
        return null;
    }
}

function IsValidSynrecPlugin(name, search) {
    const all = fs.readdirSync(`./project/js/plugins/`)
        .filter((file) => {
            return (
                file.match(`.js`) &&
                !IsInvalidPlugin(file)
            );
        })
    const list = all.filter((name) => {
        if (!search) return true;
        const regex = new RegExp(`(${search})`, 'gi')
        return name.match(regex);
    })
    return list.includes(name);
}

async function GetPluginLoadList(search) {
    const plugin_keys = Object.keys($plugins);
    const plugins = plugin_keys.map((key) => {
        const plugin_data = $plugins[key]
        const name = `${plugin_data.name}.js`;
        if (IsValidSynrecPlugin(name, search)) {
            const loaded = plugin_data.status;
            try {
                return {
                    name,
                    loaded,
                    exists: false,
                    data: plugin_data
                };
            } catch (e) {
                return null;
            }
        }
    }).filter(Boolean)
    return plugins;
}

async function LoadSynrecPlugins(search) {
    search = search || "";
    const list_area = document.getElementById(`plugin-list`);
    const message_area = document.getElementById(`editor-message`);
    const load_list = await GetPluginLoadList(search);
    list_area.textContent = `LOADING.....`;
    if (!fs.existsSync(`./project`)) {
        list_area.textContent = ``;
        message_area.textContent = `Project directory not found`;
        return;
    }
    if (!fs.existsSync(`./project/js`)) {
        list_area.textContent = ``;
        message_area.textContent = `Project javascript directory not found`;
        return;
    }
    if (!fs.existsSync(`./project/js/plugins`)) {
        list_area.textContent = ``;
        message_area.textContent = `Project javascript plugins directory not found`;
        return;
    }
    fs.readdir(`./project/js/plugins`, (err, dir) => {
        if (err) {
            list_area.textContent = ``;
            message_area.textContent = `Error:${err}`;
        } else {
            list_area.textContent = ``;
            const list = dir.filter((file) => {
                return IsValidSynrecPlugin(file, search);
            })
            if (list.length > 0) {
                const plugin_file_names = []
                load_list.forEach((loaded_plugin) => {
                    const name = loaded_plugin.name;
                    if (name) {
                        loaded_plugin.file = LoadProjectPluginFile(name);
                        loaded_plugin.exists = list.some((file) => {
                            return file == name;
                        })
                        CreatePluginListButton(name, list_area, loaded_plugin);
                        UpdateSynrecPlugin(loaded_plugin);
                        plugin_file_names.push(name.slice(0, name.indexOf('.')));
                    }
                })
                CreatePluginsLoadJSON(plugin_file_names);
                message_area.textContent = "Plugins loaded. Select one to continue.";
            } else {
                message_area.textContent = "No synrec plugins loaded.";
            }
        }
    });
    this._loaded_plugins = load_list;
}

function IsStructType(type_text) {
    return (type_text || "").match(/(struct)<(\S+)>/gmi);
}

function GetStructName(type_text) {
    const match = (type_text || "").match(/(struct)<(\S+)>/gmi)[0];
    if (!match) return type_text;
    const name = match
        .replace(`struct<`, '')
        .replace(`>`, '')
        .replace(`[]`, '');
    return name;
}

function GetSetValue(original_file, plugin_data, def, path) {
    if (Array.isArray(def)) {
        def = def.map((obj) => {
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                obj = obj;
            }
            return obj;
        })
    } else {
        try {
            def = JSON.parse(def);
            if (Array.isArray(def)) {
                def = def.map((obj) => {
                    try {
                        obj = JSON.parse(obj);
                    } catch (e) {
                        obj = obj;
                    }
                    return obj;
                })
            }
        } catch (e) {
            def = def;
        }
    }
    let target_obj = original_file || plugin_data.parameters;
    if (!original_file) {
        for (let i = 0; i < path.length; i++) {
            const path_data = path[i];
            const path_name = path_data.name;
            target_obj = target_obj[path_name];
            if (Array.isArray(target_obj)) {
                target_obj = target_obj.map((obj) => {
                    try {
                        obj = JSON.parse(obj);
                    } catch (e) {
                        obj = obj;
                    }
                    return obj;
                })
            } else {
                try {
                    target_obj = JSON.parse(target_obj);
                    if (Array.isArray(target_obj)) {
                        target_obj = target_obj.map((obj) => {
                            try {
                                obj = JSON.parse(obj);
                            } catch (e) {
                                obj = obj;
                            }
                            return obj;
                        })
                    }
                } catch (e) {
                    target_obj = target_obj;
                }
            }
            if (target_obj === undefined) {
                return def;
            }
            if (Array.isArray(target_obj)) {
                const index = path_data._index;
                if (isNaN(index)) {
                    return target_obj;
                }
                target_obj = target_obj[index];
            }
        }
        return target_obj || def;
    } else {
        for (let i = 0; i < path.length; i++) {
            const path_data = path[i];
            const path_name = path_data.name;
            const index = path_data._index;
            if (!target_obj) {
                return def;
            }
            target_obj = target_obj[path_name];
            if (target_obj) {
                if (target_obj.list) {
                    if (!isNaN(index)) {
                        target_obj = target_obj.list[index];
                        if (target_obj.gen) {
                            const gen = target_obj.gen;
                            if (!gen.no_struct) {
                                target_obj = target_obj.gen;
                            }
                        }
                    } else {
                        return target_obj.list;
                    }
                }
                if (target_obj.gen) {
                    const gen = target_obj.gen;
                    if (!gen.no_struct) {
                        target_obj = target_obj.gen;
                    } else {
                        target_obj = gen.value;
                    }
                }
            }
        }
        if (typeof target_obj == 'object') {
            if (target_obj.gen) {
                target_obj = target_obj.gen
            }
        }
        return target_obj || def;
    }
}

function GenerateStructList(original_file, plugin_data, path, gen_data) {
    if (original_file) {
        return GenerateStructListCustom(original_file, path);
    } else {
        return GenerateStructListPlugin(plugin_data, path, gen_data);
    }
}

function GenerateStructListCustom(original_file, path) {
    let target = original_file;
    for (let i = 0; i < path.length; i++) {
        const path_data = path[i];
        const path_name = path_data.name;
        try {
            target = JSON.parse(target);
            target = target[path_name];
        } catch (e) {
            target = target[path_name];
        }
        if (target.gen && !target.list) {
            try {
                target.gen = JSON.parse(target.gen);
                target = target.gen;
            } catch (e) {
                target = target.gen;
            }
        } else if (target.list && i < (path.length - 1)) {
            const index = path_data._index;
            if (!isNaN(index)) {
                try {
                    target.list = JSON.parse(target.list);
                    try {
                        target.list[index] = JSON.parse(target.list[index]);
                        target = target.list[index];
                    } catch (e) {
                        target = target.list[index];
                    }
                } catch (e) {
                    try {
                        target.list[index] = JSON.parse(target.list[index]);
                        target = target.list[index];
                    } catch (e) {
                        target = target.list[index];
                    }
                }
            } else break
        }
    }
    if (!target) {
        return [];
    }
    return target.list || [];
}

function GenerateNestedStructListPlugin(array, path, index) {
    let path_name = path[index];
    let need_continue = index < path.length;
    return array.map((data) => {
        try {
            data = JSON.parse(data);
            if (!need_continue) return data;
            const param_names = Object.keys(data);
            param_names.forEach((key) => {
                if (Array.isArray(data[key])) {
                    data[key] = GenerateNestedStructListPlugin(data[key])
                }
            })
            return data;
        } catch (e) {
            return data;
        }
    })
}

function GetParsedDataKey(data_key) {
    try {
        return JSON.parse(data_key)
    } catch (e) {
        return data_key;
    }
}

function GenerateStructListPlugin(plugin_data, path, gen_data) {
    let params = null;
    try {
        params = plugin_data.parameters;
    } catch (e) {
        return [];
    }
    let target = plugin_data.parameters;
    for (let i = 0; i < path.length; i++) {
        const path_data = path[i];
        // path_data._index = JSON.parse(JSON.stringify(i));
        const path_name = path_data.name;
        try {
            target = JSON.parse(target[path_name]);
        } catch (e) {
            target = target[path_name];
        }
        if (Array.isArray(target)) {
            target = GenerateNestedStructListPlugin(target, path, i);
            i++;
        }
    }
    if (!target) {
        return [];
    }
    if (Array.isArray(target)) {
        const target_to_gen = target.map((data) => {
            try {
                const copy_gen = JSON.parse(JSON.stringify(gen_data));
                const data_keys = Object.keys(data);
                for (let d = 0; d < data_keys.length; d++) {
                    const key = data_keys[d];
                    if (copy_gen[key]) {
                        const data_key = GetParsedDataKey(data[key]);
                        if (Array.isArray(data_key)) {
                            let index = 0;
                            const path = JSON.parse(JSON.stringify(copy_gen[key].path));
                            copy_gen[key].list = data_key.map((data) => {
                                const path = JSON.parse(JSON.stringify(copy_gen[key].path));
                                let value = data;
                                try {
                                    value = JSON.parse(value);
                                } catch (e) {
                                    value = value;
                                }
                                const target_arr = path[path.length - 1];
                                if (target_arr) {
                                    try {
                                        target_arr._index = JSON.parse(JSON.stringify(index));
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                                index++;
                                return { value, path }
                            });
                        } else {
                            if (copy_gen[key].gen) {
                                const gen = copy_gen[key].gen;
                                const gen_keys = Object.keys(gen);
                                gen_keys.forEach((key) => {
                                    let data_value = data_key[key];
                                    try {
                                        data_value = JSON.parse(data_value);
                                    } catch (e) {
                                        data_value = data_value;
                                    }
                                    const ref = gen[key];
                                    if (
                                        !ref.gen &&
                                        !ref.list
                                    ) {
                                        ref.value = data_value;
                                    } else if (ref.gen) {
                                        if (ref.list && ref.gen.no_struct) {
                                            ref.list = (data_value || []).map((val) => {
                                                return {
                                                    value: val,
                                                    type: ref.gen.type,
                                                    path: ref.path
                                                }
                                            })
                                            let index = 0;
                                            ref.list.forEach((item) => {
                                                item.path[item.path.length - 1]._index = JSON.parse(JSON.stringify(index));
                                                index++;
                                            })
                                        } else {
                                            const gen_keys = Object.keys(ref.gen);
                                        }
                                    }
                                })
                            } else {
                                copy_gen[key].value = data_key;
                            }
                        }
                    }
                }
                return copy_gen;
            } catch (e) {
                console.error(e)
                return data;
            }
        })
        let index = 0;
        target_to_gen.forEach((list_itm) => {
            const itm_keys = Object.keys(list_itm);
            itm_keys.forEach((key) => {
                const param = list_itm[key];
                const target_arr = param.path[path.length - 1];
                if (target_arr) {
                    target_arr._index = JSON.parse(JSON.stringify(index));
                }
            })
            index++;
        })
        return target_to_gen
    }
    return target;
}

function GenerateStructKeys(data, all_structs, target_path, original_file, plugin_data, is_for_list, config_data) {
    const struct_obj = {};
    const params = data.params;
    params.forEach((param) => {
        const name = param.name;
        const type = param.type;
        if (!type) return;
        const array = param.is_array;
        const def = param.default;
        const is_struct = !!IsStructType(type);
        const copy_path = target_path.concat(
            JSON.parse(JSON.stringify(param))
        );
        struct_obj[name] = array ? { list: [], gen: {} } : {};
        if (is_struct) {
            const struct_name = GetStructName(type);
            const struct_data = all_structs.find((data) => {
                return data.name == struct_name;
            })
            if (struct_data) {
                const copied_data = JSON.parse(JSON.stringify(struct_data));
                if (!array) {
                    struct_obj[name] = {
                        gen: GenerateStructKeys(copied_data, all_structs, copy_path, original_file, plugin_data, !!is_for_list, config_data),
                        path: copy_path
                    };
                    struct_obj[name].gen = ProcessStructData(struct_obj[name].gen, copy_path, original_file, plugin_data, all_structs, config_data);
                } else {
                    struct_obj[name] = {
                        list: [],
                        gen: GenerateStructKeys(copied_data, all_structs, copy_path, original_file, plugin_data, true, config_data),
                        path: copy_path
                    };
                    let index = 0;
                    struct_obj[name].list = GenerateStructList(original_file, plugin_data, copy_path, struct_obj[name].gen);
                    struct_obj[name].list.forEach((list_itm) => {
                        const itm_keys = Object.keys(list_itm);
                        itm_keys.forEach((key) => {
                            const param = list_itm[key];
                            const target_arr = param.path[copy_path.length - 1];
                            if (target_arr) {
                                target_arr._index = JSON.parse(JSON.stringify(index));
                            }
                        })
                        index++;
                    })
                }
            } else {
                console.error(`Failed to load struct data.`);
                struct_obj[name] = {
                    list: [],
                    gen: {},
                    path: copy_path
                };
                return struct_obj
            }
        } else {
            let value = GetSetValue(original_file, plugin_data, def, copy_path);
            if (array) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = value;
                }
                struct_obj[name] = {
                    list: value.map((val) => {
                        return {
                            value: val,
                            path: copy_path
                        }
                    }),
                    gen: { type: type, no_struct: true },
                    path: copy_path
                };
                let index = 0;
                struct_obj[name].list.forEach((list_itm) => {
                    const itm_keys = Object.keys(list_itm);
                    itm_keys.forEach((key) => {
                        const param = list_itm[key];
                        const target_arr = param.path[copy_path.length - 1];
                        if (target_arr) {
                            target_arr._index = JSON.parse(JSON.stringify(index));
                        }
                    })
                    index++;
                })
            } else {
                struct_obj[name] = {
                    value: is_for_list ? def : GetSetValue(original_file, plugin_data, def, copy_path),
                    path: copy_path
                };
            }
        }
    })
    return struct_obj;
}

async function UpdateSynrecPlugin(loaded_plugin) {
    if (!loaded_plugin) return;
    const file = loaded_plugin.file;
    const name = loaded_plugin.name;
    const configuration_data = await ConvertFileToJSON(file, name);
    await SavePluginObjectToFile(configuration_data, name);
    await UpdateProjectEditorObject(configuration_data, name);
}

async function CreatePluginsLoadJSON(names) {
    console.log(names);
    const names_str = JSON.stringify(names);
    const base_path = process.cwd();
    if (!fs.existsSync(`${base_path}/project`)) {
        console.error(`"project" folder does not exist.`);
        return;
    }
    if (!fs.existsSync(`${base_path}/project/js`)) {
        console.error(`project javascript folder does not exist.`);
        return;
    }
    if (!fs.existsSync(`${base_path}/project/js/plugins`)) {
        console.error(`project javascript plugins folder does not exist.`);
        return;
    }
    fs.writeFileSync(`${base_path}/project/js/plugins/_master_editor.txt`, names_str, 'utf8');
}

function ProcessKeyComparision(orig_data, plugin_data, nav, mod_data) {
    if (!orig_data) {
        return mod_data;
    }
    const keys = Object.keys(mod_data);
    return mod_data;
}

function NestedProcessPluginListParam(array, path, cur_indx) {
    array.forEach((itm) => {
        let nested_target = itm;
        for (let i = cur_indx + 1; i < path.length; i++) {
            const path_data = path[i];
            const path_name = path_data.name;
            nested_target = nested_target[path_name];
            try {
                nested_target = JSON.parse(nested_target);
            } catch (e) {
                nested_target = nested_target;
            }
            if (path_data.is_array) {
                nested_target = nested_target.map((itm) => {
                    try {
                        itm = JSON.parse(itm);
                    } catch (e) {
                        itm = itm;
                    }
                    return itm;
                })
                nested_target = NestedProcessPluginListParam(nested_target, path, i);
                break;
            } else {
                if (nested_target.gen) {
                    nested_target = nested_target.gen;
                } else if (nested_target.value) {
                    nested_target = nested_target.value;
                }
            }
        }
    })
    return array;
}

function ConvertListToGenData(gen_data, list, path) {
    const copy_path = JSON.parse(JSON.stringify(path));
    let gen_arr = [];
    gen_arr = list.map((list_item) => {
        try {
            list_item = JSON.parse(list_item);
        } catch (e) {
            list_item = list_item
        }
        const gen_obj = gen_data.gen;
        const gen_keys = Object.keys(gen_obj);
        gen_keys.forEach((key) => {
            const prop = gen_obj[key];
            prop.path = copy_path.concat(prop.path[prop.path.length - 1]);
            let value = list_item[key];
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = value;
            }
            const gen_obj_data = gen_obj[key];
            if (gen_obj_data.gen) {
                if (gen_obj_data.list || Array.isArray(value)) {
                    gen_obj_data.list = ConvertListToGenData(gen_obj_data, (value || []), path);
                    let index = 0;
                    gen_obj_data.list.forEach((list_itm) => {
                        const itm_keys = Object.keys(list_itm);
                        itm_keys.forEach((key) => {
                            const param = list_itm[key];
                            const target_arr = param.path[param.path.length - 1];
                            if (target_arr) {
                                target_arr._index = JSON.parse(JSON.stringify(index));
                            }
                        })
                        index++;
                    })
                } else {
                    const keys = Object.keys(gen_obj_data.gen);
                    keys.forEach((key) => {
                        if (!gen_obj_data.gen[key].gen) {
                            gen_obj_data.gen[key].value = value[key];
                        }
                    })
                }
            } else {
                gen_obj[key] = {
                    value: value,
                    path: gen_obj_data.path
                }
            }
        })
        return gen_obj
    })
    let index = 0;
    gen_arr.forEach((list_itm) => {
        const itm_keys = Object.keys(list_itm);
        itm_keys.forEach((key) => {
            const param = list_itm[key];
            const target_arr = param.path[gen_data.path.length - 1];
            if (target_arr) {
                target_arr._index = JSON.parse(JSON.stringify(index));
            }
        })
        index++;
    })
    return gen_arr || [];
}

function ProcessStructData(gen, path, original, plugin, all_structs, config_data) {
    const gen_keys = Object.keys(gen);
    const is_original = !!original;
    const plugin_params = plugin.parameters;
    let target = null;
    if (is_original) {
        target = original;
        for (let i = 0; i < path.length; i++) {
            const path_data = path[i];
            const path_name = path_data.name;
            target = target[path_name];
            try {
                target = JSON.parse(target);
            } catch (e) {
                target = target;
            }
            const index = path_data._index;
            if (path_data.is_array && !isNaN(index)) {
                if (!isNaN(index)) {
                    target = target.list[index];
                }
            } else {
                if (target.gen) {
                    target = target.gen;
                } else if (target.value) {
                    target = target.value;
                }
            }
        }
    } else {
        target = plugin_params;
        for (let i = 0; i < path.length; i++) {
            const path_data = path[i];
            const path_name = path_data.name;
            target = target[path_name];
            try {
                target = JSON.parse(target);
            } catch (e) {
                target = target;
            }
            if (path_data.is_array) {
                target = target.map((itm) => {
                    try {
                        itm = JSON.parse(itm);
                    } catch (e) {
                        itm = itm;
                    }
                    return itm;
                })
                target = NestedProcessPluginListParam(target, path, i);
                break;
            } else {
                if (target.gen) {
                    target = target.gen;
                } else if (target.value) {
                    target = target.value;
                }
            }
        }
    }
    gen_keys.forEach((key) => {
        let target_val = target[key];
        try {
            target_val = JSON.parse(target_val);
        } catch (e) {
            target_val = target_val;
        }
        let gen_data = gen[key];
        if (gen_data.gen) {
            if (gen_data.list) {
                if (is_original) {
                    gen_data.list = target_val.list;
                    gen_data.gen = target_val.gen
                } else {
                    gen_data.list = (target_val || []).map((item) => {
                        try {
                            item = JSON.parse(item);
                        } catch (e) {
                            item = item;
                        }
                        return item;
                    });
                    if (!is_original) {
                        let index = 0;
                        gen_data.list = gen_data.list.map((list_item) => {
                            const gen_obj = JSON.parse(JSON.stringify(gen_data.gen));
                            const gen_keys = Object.keys(gen_obj);
                            gen_keys.forEach((key) => {
                                let value = list_item[key];
                                try {
                                    value = JSON.parse(value);
                                } catch (e) {
                                    value = value;
                                }
                                const gen_obj_data = gen_obj[key];
                                const obj_path = gen_obj_data.path[gen_data.path.length - 1];
                                obj_path._index = JSON.parse(JSON.stringify(index));
                                if (gen_obj_data.gen) {
                                    if (gen_obj_data.list || Array.isArray(value)) {
                                        let index = 0;
                                        gen_obj_data.list = ConvertListToGenData(gen_obj_data, (value || []), gen_obj_data.path);
                                        gen_obj_data.list.forEach((list_itm) => {
                                            const itm_keys = Object.keys(list_itm);
                                            itm_keys.forEach((key) => {
                                                const param = list_itm[key];
                                                const target_arr = param.path[path.length - 1];
                                                if (target_arr) {
                                                    target_arr._index = JSON.parse(JSON.stringify(index));
                                                }
                                            })
                                            index++;
                                        })
                                    } else {
                                        const keys = Object.keys(gen_obj_data.gen);
                                        keys.forEach((key) => {
                                            if (!gen_obj_data.gen[key].gen) {
                                                gen_obj_data.gen[key].value = value[key];
                                            }
                                        })
                                    }
                                } else {
                                    gen_obj[key] = {
                                        value: value,
                                        path: gen_obj_data.path
                                    }
                                }
                            })
                            return gen_obj
                        })
                        gen_data.list.forEach((list_itm) => {
                            const itm_keys = Object.keys(list_itm);
                            itm_keys.forEach((key) => {
                                const param = list_itm[key];
                                const target_arr = param.path[gen_data.path.length - 1];
                                if (target_arr) {
                                    target_arr._index = JSON.parse(JSON.stringify(index));
                                }
                            })
                            index++;
                        })
                    }
                }
            } else {
                if (is_original) {
                    gen_data.gen = target_val.gen;
                } else {
                    const new_path = gen_data.path;
                    gen_data.gen = ProcessStructData(gen_data.gen, new_path, original, plugin, all_structs, config_data);
                }
            }
        } else {
            if (gen_data.value) {
                gen_data.value = is_original ? target_val.value : target_val;
            } else {
                gen[key] = {
                    value: target_val,
                    type: gen_data.type,
                    path: path
                }
            }
        }
    })
    return gen;
}

function ResetNavIndex(obj, nav_index, value, source_only) {
    if (obj.path) {
        obj.path[nav_index]._index = JSON.parse(JSON.stringify(value));
    }
    if (source_only) return;
    if (obj.gen) {
        const obj_gen = obj.gen;
        if (obj_gen.no_struct) {
            obj_gen.path[nav_index]._index = JSON.parse(JSON.stringify(value));
        } else {
            const gen_keys = Object.keys(obj_gen);
            for (let i = 0; i < gen_keys.length; i++) {
                const key = gen_keys[i];
                ResetNavIndex(obj_gen[key], nav_index, value, source_only);
            }
        }
    }
}

function DecreaseListPathIndex(obj, nav_index, source_only) {
    if (obj.path) {
        obj.path[nav_index]._index--;
    }
    if (source_only) return;
    if (obj.gen) {
        const obj_gen = obj.gen;
        if (obj_gen.no_struct) {
            obj_gen.path[nav_index]._index--;
        } else {
            const gen_keys = Object.keys(obj_gen);
            for (let i = 0; i < gen_keys.length; i++) {
                const key = gen_keys[i];
                DecreaseListPathIndex(obj_gen[key], nav_index);
            }
        }
    }
}

function GenerateLiteStructParam(struct_data, target_path, structs) {
    const struct_obj = {};
    const params = struct_data.params;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const name = param.name;
        const type = param.type;
        const array = param.is_array;
        const def = param.default;
        const is_struct = IsStructType(type);
        const copy_path = target_path.concat(
            JSON.parse(JSON.stringify(param))
        );
        struct_obj[name] = {};
        if (is_struct) {
            const struct_name = GetStructName(type);
            const struct_data = structs.find((data) => {
                return data.name == struct_name;
            })
            let value = def;
            if (array) {
                struct_obj[name].path = copy_path;
                struct_obj[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                struct_obj[name].list = [];
            } else {
                struct_obj[name].path = copy_path;
                struct_obj[name].gen = GenerateLiteStructParam(struct_data, copy_path, structs);
            }
        } else {
            let value = def;
            if (array) {
                struct_obj[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                struct_obj[name].list = [];
                struct_obj[name].path = copy_path;
            } else {
                struct_obj[name].gen = { value: value, type: type, array: array, no_struct: true, path: copy_path };
                struct_obj[name].path = copy_path;
            }
        }
    }
    return struct_obj;
}

function GenerateStructParam(value, struct_data, structs, original_file, plugin_data, def, target_path) {
    if (!struct_data) {
        return {};
    }
    const struct_obj = {};
    const params = struct_data.params;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const name = param.name;
        const type = param.type;
        const array = param.is_array;
        const def = param.default;
        const is_struct = IsStructType(type);
        const copy_path = target_path.concat(
            JSON.parse(JSON.stringify(param))
        );
        struct_obj[name] = {};
        if (is_struct) {
            const struct_name = GetStructName(type);
            const struct_data = structs.find((data) => {
                return data.name == struct_name;
            })
            let value = GetSetValue(original_file, plugin_data, def, copy_path);
            if (array) {
                if (!Array.isArray(value)) value = [];
                struct_obj[name].path = copy_path;
                struct_obj[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                let index = -1;
                struct_obj[name].list = (value || []).map((val) => {
                    index++;
                    const new_path = JSON.parse(JSON.stringify(copy_path));
                    const last_index = new_path.length - 1;
                    const last_path = new_path[last_index];
                    last_path._index = JSON.parse(JSON.stringify(index));
                    return {
                        gen: GenerateStructParam(val[index], struct_data, structs, original_file, plugin_data, def, new_path),
                        path: JSON.parse(JSON.stringify(new_path))
                    }
                })
            } else {
                struct_obj[name].path = copy_path;
                struct_obj[name].gen = GenerateStructParam(value, struct_data, structs, original_file, plugin_data, def, copy_path);
            }
        } else {
            let value = GetSetValue(original_file, plugin_data, def, copy_path);
            if (array) {
                if (!Array.isArray(value)) value = [];
                struct_obj[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                let index = 0;
                struct_obj[name].list = original_file ? value : value.map((val) => {
                    const new_path = JSON.parse(JSON.stringify(copy_path));
                    const last_index = new_path.length - 1;
                    const last_path = new_path[last_index];
                    last_path._index = JSON.parse(JSON.stringify(index));
                    index++;
                    return {
                        gen: { value: val, type: type, array: array, no_struct: true, path: copy_path },
                        path: JSON.parse(JSON.stringify(new_path))
                    }
                })
                struct_obj[name].path = copy_path;
            } else {
                struct_obj[name].gen = { value: value, type: type, array: array, no_struct: true, path: copy_path };
                struct_obj[name].path = copy_path;
            }
        }
    }
    return struct_obj;
}

async function UpdateProjectEditorObject(config_data, name) {
    const file_name = name.slice(0, name.indexOf('.'));
    const base_path = process.cwd();
    if (!fs.existsSync(`${base_path}/project`)) {
        console.error(`"project" folder does not exist.`);
        return;
    }
    if (!fs.existsSync(`${base_path}/project/js`)) {
        console.error(`project javascript folder does not exist.`);
        return;
    }
    if (!fs.existsSync(`${base_path}/project/js/plugins`)) {
        console.error(`project javascript plugins folder does not exist.`);
        return;
    }
    if (!fs.existsSync(`${base_path}/project/js/plugins/data`)) {
        fs.mkdirSync(`${base_path}/project/js/plugins/data`);
        return;
    }
    const plugin_data = $plugins.find((data) => {
        return data.name == file_name;
    })
    const has_file = fs.existsSync(`${base_path}/project/js/plugins/data/${file_name}.json`);
    const original_json = has_file ? fs.readFileSync(`${base_path}/project/js/plugins/data/${file_name}.json`, 'utf8') : null;
    const original_file = has_file ? JSON.parse(original_json) : null;
    const editor_configuration_json = {};
    const structs = config_data.structs;
    const params = config_data.params;
    const target_path = [];
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const name = param.name;
        const type = param.type;
        const array = param.is_array;
        const def = param.default;
        const is_struct = IsStructType(type);
        const copy_path = target_path.concat(
            JSON.parse(JSON.stringify(param))
        );
        editor_configuration_json[name] = {};
        if (is_struct) {
            const struct_name = GetStructName(type);
            const struct_data = structs.find((data) => {
                return data.name == struct_name;
            })
            let value = GetSetValue(original_file, plugin_data, def, copy_path);
            if (array) {
                const gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                editor_configuration_json[name].path = copy_path;
                editor_configuration_json[name].gen = gen;
                let index = -1;
                editor_configuration_json[name].list = value.map((val) => {
                    index++;
                    const new_path = JSON.parse(JSON.stringify(copy_path));
                    const last_index = new_path.length - 1;
                    const last_path = new_path[last_index];
                    last_path._index = JSON.parse(JSON.stringify(index));
                    return {
                        gen: GenerateStructParam(val[index], struct_data, structs, original_file, plugin_data, def, new_path),
                        path: JSON.parse(JSON.stringify(new_path))
                    }
                })
            } else {
                editor_configuration_json[name].path = copy_path;
                editor_configuration_json[name].gen = GenerateStructParam(value, struct_data, structs, original_file, plugin_data, def, copy_path);
            }
        } else {
            let value = GetSetValue(original_file, plugin_data, def, copy_path);
            if (array) {
                editor_configuration_json[name].gen = { value: null, type: type, array: array, no_struct: true, path: copy_path };
                let index = 0;
                editor_configuration_json[name].list = (value || []).map((obj) => {
                    if (original_file) {
                        const gen_obj = obj.gen;
                        const val = gen_obj.no_struct ? gen_obj.value : obj;
                        const new_path = JSON.parse(JSON.stringify(copy_path));
                        const last_index = new_path.length - 1;
                        const last_path = new_path[last_index];
                        last_path._index = JSON.parse(JSON.stringify(index));
                        index++;
                        return {
                            gen: { value: val, type: type.replace('[]', ''), array: array, no_struct: true, path: copy_path },
                            path: JSON.parse(JSON.stringify(new_path))
                        }
                    } else {
                        const val = obj;
                        const new_path = JSON.parse(JSON.stringify(copy_path));
                        const last_index = new_path.length - 1;
                        const last_path = new_path[last_index];
                        last_path._index = JSON.parse(JSON.stringify(index));
                        index++;
                        return {
                            gen: { value: val, type: type.replace('[]', ''), array: array, no_struct: true, path: copy_path },
                            path: JSON.parse(JSON.stringify(new_path))
                        }
                    }
                })
                editor_configuration_json[name].path = copy_path;
            } else {
                editor_configuration_json[name].gen = { value: value, type: type, array: array, no_struct: true, path: copy_path };
                editor_configuration_json[name].path = copy_path;
            }
        }
    }
    await SaveProjectEditorObject(editor_configuration_json, name);
}

async function UpdateOriginalFile(original, plugin_data, modified) {
    if (!original && !plugin_data) return modified;
    const params = plugin_data.parameters;
    const keys = Object.keys(modified);
    const nav = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const mod_data = modified[key];
        const orig_data = original ? original[key] : plugin_data[key];
        const new_nav = nav.concat(key);
        if (
            typeof mod_data == typeof orig_data
        ) {
            if (typeof mod_data == 'object') {
                modified[key] = ProcessKeyComparision(orig_data, plugin_data, new_nav, mod_data);
            } else {
                modified[key] = orig_data;
            }
        } else {
            continue;
        }
    }
    return modified;
}

async function SaveProjectEditorObject(data, name) {
    console.log(name, data)
    const json_str = JSON.stringify(data);
    const file_name = name.slice(0, name.indexOf('.'));
    const base_path = process.cwd();
    fs.writeFileSync(`${base_path}/project/js/plugins/data/${file_name}.json`, json_str, 'utf8');
    const test_window = window._test_window;
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

async function Generate_Editor_Plugin(params) {
    const base_path = process.cwd();
    const res_file = fs.readFileSync(`${base_path}/res/Synrec_Master_Editor.js`, 'utf8');
    const plugin_jsons = fs.readdirSync(`${base_path}/project/js/plugins/data/`);
    if (!Array.isArray(plugin_jsons)) return;
    if (plugin_jsons.length <= 0) return;
    const plugin_list = plugin_jsons.map((file_name) => {
        const name = file_name.slice(0, file_name.indexOf('.')).toLowerCase();
        return `"${name}"`;
    })
    const str_header = `
    const Synrec_Master_Editor = {};
    Synrec_Master_Editor.load_list = [${plugin_list}];
    Synrec_Master_Editor.plugin_data = {};
    `.replace(/[\t ]+(?:\s)/gmi, '');
    const plugin_file = str_header.concat(res_file);
    return plugin_file;
}

async function MakeProjectPluginFile() {
    const base_path = process.cwd();
    fs.writeFileSync(`${base_path}/project/js/plugins/Synrec_Master_Editor.js`, await Generate_Editor_Plugin(), 'utf8');
    alert(`Plugin file for RPG Maker has been generated. \nPlease remember  to install it.`)
}