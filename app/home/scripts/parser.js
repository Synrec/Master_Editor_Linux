

function ParseParamName(line) {
    const match_data = line.match(/(\@(param)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@param', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamAlias(line) {
    const match_data = line.match(/(\@(text)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@text', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamParent(line) {
    const match_data = line.match(/(\@(parent)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@parent', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamDesc(line) {
    const match_data = line.match(/(\@(desc)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@desc', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamType(line) {
    const match_data = line.match(/(\@(type)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@type', '').trim();
        return line_conv;
    } catch (e) {
        return "text";
    }
}

function ParseParamDefault(line) {
    const match_data = line.match(/(\@(default)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@default', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamDirectory(line) {
    const match_data = line.match(/(\@(dir)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@dir', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamOption(line) {
    const match_data = line.match(/(\@(option)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@option', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseParamOptionValue(line) {
    const match_data = line.match(/(\@(value)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('@value', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ParseStructName(line) {
    const match_data = line.match(/(\~(struct~)).(.+)/gmi);
    try {
        const line_conv = match_data[0].replace('~struct~', '').replace(':', '').trim();
        return line_conv;
    } catch (e) {
        return "";
    }
}

function ConvertFileToJSON(file, name) {
    if (!name) return;
    const lines = file.split(/\n|\r/gmi);
    const file_obj = {};
    file_obj.name = name;
    file_obj.params = [];
    file_obj.structs = [];
    let param_read = false;
    let param_obj = {};
    let struct_obj = {};
    struct_obj.params = [];
    let struct_read = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        if (line.match(/(\~(struct~))/gmi)) {
            struct_obj = {};
            struct_obj.name = ParseStructName(line);
            struct_obj.params = [];
            struct_read = true;
            continue;
        }
        if (line.match(/(\@(param))/gmi)) {
            if (!param_read) {
                param_obj = {};
                param_obj.name = ParseParamName(line);
                param_read = true;
            } else {
                try {
                    if (struct_read) {
                        struct_obj.params.push(JSON.parse(JSON.stringify(param_obj)))
                    } else {
                        file_obj.params.push(JSON.parse(JSON.stringify(param_obj)));
                    }
                } catch (e) {
                    console.error(e);
                }
                param_obj = {};
                param_obj.name = ParseParamName(line);
                param_read = true;
            }
        }
        if (param_read) {
            if (line.match(/(\@(text))/gmi)) {
                param_obj.alias = ParseParamAlias(line);
            } else if (line.match(/(\@(desc))/gmi)) {
                param_obj.desc = ParseParamDesc(line);
            } else if (line.match(/(\@(type))/gmi)) {
                param_obj.type = ParseParamType(line);
                if (
                    param_obj.type == 'select' &&
                    !Array.isArray(param_obj.options)
                ) {
                    param_obj.options = [];
                }
                if (line.match(/(\[\])/gmi)) {
                    param_obj.is_array = true;
                }
            } else if (line.match(/(\@(default))/gmi)) {
                param_obj.default = ParseParamDefault(line);
            } else if (line.match(/(\@(default))/gmi)) {
                param_obj.parent = ParseParamParent(line);
            } else if (line.match(/(\@(option))/gmi)) {
                if (
                    !Array.isArray(param_obj.options)
                ) {
                    param_obj.options = [];
                }
                const option = { name: ParseParamOption(line) };
                const next_line = lines[i + 2];
                if (next_line.match(/(\@(value))/gmi)) {
                    option.value = ParseParamOptionValue(next_line);
                    i++;
                }
                if (!option.value) {
                    option.value = option.name;
                }
                param_obj.options.push(option);
            } else if (line.match(/(\@(dir))/gmi)) {
                param_obj.dir = ParseParamDirectory(line);
            } else if (!line) {
                try {
                    if (struct_read) {
                        struct_obj.params.push(JSON.parse(JSON.stringify(param_obj)))
                    } else {
                        file_obj.params.push(JSON.parse(JSON.stringify(param_obj)));
                    }
                } catch (e) {
                    console.error(e);
                }
                param_read = false;
                param_obj = null;
            }
        }
        if (line.match(/(^\s\*\/)/gmi)) {
            if (param_read) {
                try {
                    if (struct_read) {
                        struct_obj.params.push(JSON.parse(JSON.stringify(param_obj)))
                    } else {
                        file_obj.params.push(JSON.parse(JSON.stringify(param_obj)));
                    }
                } catch (e) {
                    console.error(e);
                }
                param_read = false;
                param_obj = null;
            }
            if (struct_read) {
                try {
                    file_obj.structs.push(JSON.parse(JSON.stringify(struct_obj)));
                } catch (e) {
                    console.error(e);
                }
                struct_read = false;
                struct_obj = null;
            }
        }
    }
    return file_obj;
}