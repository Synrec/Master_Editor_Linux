//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

async function PreloadAssets() { }

window.onload = async function () {
    await PreloadAssets();
    SceneManager.run(Scene_Boot);
};