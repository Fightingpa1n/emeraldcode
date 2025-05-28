const vscode = require('vscode');

function getConfig() {return vscode.workspace.getConfiguration('emeraldcode');}

function getSettings() { //get main Configuration object
    const config = getConfig();
    return { //return config object
        defaultStart: config.get('defaultStart') || '',
        defaultEnd: config.get('defaultEnd') || '',
        addCommentStyle: config.get('addCommentDefinition') || true,
        splitter1: config.get('splitter1') || "",
        splitter2: config.get('splitter2') || "",
        splitter3: config.get('splitter3') || "",
        splitter4: config.get('splitter4') || "",
    };
}

function getSetting(key) {
    const settings = getSettings();
    if (key in settings) {return settings[key];}
    else {return null;}
}


//Export
module.exports = {
    getConfig,
    getSettings,
    getSetting,
};
