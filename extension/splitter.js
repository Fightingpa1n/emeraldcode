const vscode = require('vscode');
const cfg = require('./configuration');
const { getCommentDefinitionFromEditor } = require('./comment');

const CFG_SPLITTERS = "splitters";

/** Splitter class */
class Splitter {
    /**
     * Creates an instance of Splitter.
     * @param {string} key - The key of the Splitter.
     * @param {string} format - The format of the Splitter.
    */
    constructor(key, format) {
        this.key = key;
        this.format = format;
    }

    /** gets the key of the Splitter @returns {string} */
    getKey() {return this.key;}
    
    /** gets the format of the Splitter @returns {string} */
    getFormat() {return this.format;}

    /** checks if the Splitter has a placeholder (%s) for selected text @returns {boolean} */
    hasPlaceholder() {return this.format.includes('%s');}

    /**
     * Gets the formatted text with the placeholder replaced by the provided text.
     * @param {string} text - The text to replace the placeholder with.
     * @returns {string} The formatted text with the placeholder replaced.
    */
    getFormattedText(text) { //get formatted text with placeholder replaced by text
        if (this.hasPlaceholder()) {return this.format.replace('%s', text);}
        else {return this.format;}
    }

    /** 
     * Prepares the Splitter to a selection object for the QuickPick UI.
     * @returns {Object} An object representing the selection.
    */
    prepareSelection() {
        return {
            label: this.getKey(),
            description: this.getFormattedText("Sample"),
            splitter: this
        };    
    }

    /**
     * Gets the offset from the end of the format to the placeholder (if it has one).
     * @return {number} The offset from the end of the format to the placeholder.
    */
    getOffsetFromEnd() {
        const parts = this.format.split('%s');
        return parts[1] ? parts[1].length : 0;
    }
}   

/**
 * Gets an Array of all splitters from the configuration.
 * @returns {Array<Splitter>} An array of Splitter objects.
*/
function getAllSplitters() {
    const config = cfg.getConfig(); //get main config object
    const splitters = config.get(CFG_SPLITTERS) || []; //get splitters from config
    return splitters.map(s => new Splitter(s.key, s.format)); //map splitters to Splitter objects
}

/**
 * Gets a Splitter by its key.
 * @param {string} key - The key of the Splitter to retrieve.
 * @returns {Splitter|null} The Splitter object if found, otherwise null.
*/
function getSplitter(key) {
    const splitters = getAllSplitters(); //get all splitters
    return splitters.find(s => s.getKey() === key) || null; //find splitter by key
}

/**
 * Uses the QuickPick UI to wait for the user to select a Splitter.
 * @returns {Promise<Splitter|null>} A promise that resolves to the selected Splitter or null if no selection was made.
*/
async function selectSplitter() {
    const splitters = getAllSplitters();
    const items = splitters.map(splitter => splitter.prepareSelection());
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Choose a splitter'
    });
    if (selected && selected !== null) { //if selected is not null or undefined
        if (typeof selected === 'object') {return selected.splitter;}
        else if (typeof selected === 'string') {return getSplitter(selected);}
    } return null; //if no splitter selected, return null
}

function doSplit(splitter) {
    const editor = vscode.window.activeTextEditor;
    if (splitter === null || splitter === undefined) {vscode.window.showErrorMessage('No splitter selected.'); return;}
    if (!editor) {vscode.window.showErrorMessage('No active editor found.'); return;}
    
    const selection = editor.selection;
    if (!(selection.start.line !== selection.end.line)) { //if selection is in a single line
        const commentDef = getCommentDefinitionFromEditor(editor);
        const selectedText = editor.document.getText(selection);
        
        const formattedText = splitter.getFormattedText(selectedText);
        const fullText = commentDef.formatText(formattedText); //format the text with comment chars

        editor.edit(editBuilder => {
            editBuilder.replace(selection, fullText); //replace the selection with the formatted text
        }).then(() => {
            // Calculate the new cursor position (cursorStart + fullText.length - cursorOffset)
            const cursorStart = editor.document.offsetAt(selection.start); //get the start of the cursor
            const cursorOffset = splitter.getOffsetFromEnd() + commentDef.end.length; //calculate the cursor offset from the end of the formatted text
            const finalCursorOffset = cursorStart + fullText.length - cursorOffset;
            const newPosition = editor.document.positionAt(finalCursorOffset); //get the new position of the cursor
            const newSelection = new vscode.Selection(newPosition, newPosition); //create a new selection with the new position
            editor.selection = newSelection; //set the new selection
            editor.revealRange(newSelection); //reveal the new selection in the editor
        });
    }
}

//Export
module.exports = {
    Splitter,
    getAllSplitters,
    getSplitter,
    selectSplitter,
    doSplit,
};
