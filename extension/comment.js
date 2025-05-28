const vscode = require('vscode');
const cfg = require('./configuration');

const CFG_COMMENT_DEFS = "commentDef";

/** Comment Definition Class */
class CommentDefinition { //TODO: remove langId from class since comment Definitions should not be language-specific
    /**
     * Creates an instance of CommentDef
     * @param {string} langId - The language ID for which the comment style is defined.
     * @param {string} start - The starting comment character(s).
     * @param {string} end - The ending comment character(s).
    */
    constructor(langId, start, end) {
        this.langId = langId;
        this.start = start;
        this.end = end;
    }

    /** Gets the language ID for which the comment style is defined @returns {string} */
    getLangId() {return this.langId;}

    /** Gets the starting comment character(s) @returns {string} */
    getStart() {return this.start;}

    /** Gets the ending comment character(s) @returns {string} */
    getEnd() {return this.end;}

    /**
     * Gets the formatted comment text with start and end characters
     * @param {string} text - The text to be formatted as a comment.
     * @return {string} The formatted comment text with start and end characters.
    */
    formatText(text) {return `${this.getStart()}${text}${this.getEnd()}`;}

    /**
     * Prepares the CommentDefinition for export
     * @returns {Object} an object containing the langId, start, and end properties
    */
    prepareExport() {
        return {
            langId: this.getLangId(),
            start: this.getStart(),
            end: this.getEnd()
        };
    }
}

/**
 * Gets an Array of all Comment Definitions from the configuration.
 * @returns {Array<CommentDefinition>} An array of CommentDef objects.
*/
function getAllCommentDefinitions() {
    const config = cfg.getConfig();
    const commentDefs = config.get(CFG_COMMENT_DEFS) || [];
    return commentDefs.map(c => new CommentDefinition(c.langId, c.start, c.end));
}

/**
 * Gets a Comment Definition by its language ID.
 * @param {string} langId - The language ID for which the comment style is defined.
 * @returns {CommentDefinition|null} The CommentDefinition object if found, otherwise null.
*/
function getCommentDefinition(langId) {
    const commentDefs = getAllCommentDefinitions();
    return commentDefs.find(c => c.getLangId() === langId) || null;
}

/**
 * Checks if a Comment Definition exists for the given language ID.
 * @param {string} langId - The language ID to check.
 * @returns {boolean} True if a Comment Definition exists for the given language ID, otherwise false.
*/
function doesCommentDefinitionExist(langId) {
    const commentDefs = getAllCommentDefinitions();
    return commentDefs.some(c => c.getLangId() === langId);
}

/**
 * Adds a new Comment Definition to the configuration.
 * @param {CommentDefinition} commentDef - The CommentDefinition object to add.
*/
function addCommentDefinition(commentDef) {
    if (!doesCommentDefinitionExist(commentDef.getLangId())) {
        const commentDefs = getAllCommentDefinitions();
        commentDefs.push(commentDef);
        const exportDef = commentDefs.map(c => {return c.prepareExport();});
        cfg.getConfig().update(CFG_COMMENT_DEFS, exportDef, true).then(() => {
            vscode.window.showInformationMessage(`Comment style for ${commentDef.getLangId()} added.`);
        }, (err) => {
            vscode.window.showErrorMessage(`Failed to update comment styles: ${err}`);
        });
    }
}

/**
 * Gets the Comment Definition for the active editor's language.
 * if language not found in config, it uses the default commentDefinition
 * if addCommentDefinition is true, it will add a new CommentDefinition for said language with the default chars
 * @param {vscode.TextEditor} editor - The active text editor.
 * @returns {CommentDefinition} The CommentDefinition object for the active editor's language.
*/
function getCommentDefinitionFromEditor(editor) {
    const document = editor.document;
    const languageId = document.languageId;
    if (!doesCommentDefinitionExist(languageId)) {
        const defaultDef = new CommentDefinition(languageId, cfg.getSetting("defaultStart"), cfg.getSetting("defaultEnd"));
        if (cfg.getSetting("addCommentDefinition")) {addCommentDefinition(defaultDef);}
        return defaultDef;
    } else {return getCommentDefinition(languageId);}
}

//Export
module.exports = {
    CommentDefinition,
    getAllCommentDefinitions,
    getCommentDefinition,
    doesCommentDefinitionExist,
    addCommentDefinition,
    getCommentDefinitionFromEditor,
};