

async function DisplayPluginParameters(filename) {
    const plugin_obj = await (LoadPluginObjectFromFile(filename));
    if (!plugin_obj) {
        const message = document.getElementById('editor-message');
        if (message) {
            message.textContent = `Failed to load plugin object file.`;
        }
    }
    const parameters = plugin_obj.params;
    const structs = plugin_obj.structs;
}

function PlayTest() {
    this._test_window = window.open(`/project/index.html`)
}

function OpenEngine() {
    nw.Shell.openItem(`${process.cwd()}/project/game.rmmzproject`);
}

async function AddPlugin() {
    const base_path = process.cwd();
    try {
        const synrec_sync_plugin = fs.readFileSync(`${base_path}/res/Synrec_Master_Editor.js`, 'utf8');
        fs.writeFileSync(`${base_path}/project/js/plugins/Synrec_Master_Editor.js`, synrec_sync_plugin);
        alert(`Master Editor RPG Maker Plugin Installed In Project Directory.\n\rInstall using RPG Maker Engine.`)
    } catch (e) {
        console.error(e);
    }
}