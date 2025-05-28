const vscode = require('vscode');
const path = require('path');
const cfg = require('./configuration');

const CFG_DISALLOWED_EXTENSIONS = "disallowedFileExtensions";


// function copyToClipboard(nameOnly) {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//         vscode.window.showErrorMessage('No active editor found.');
//         return;
//     }

//     const document = editor.document;
//     let copiedText = '';

//     const selection = editor.selection;
//     copiedText = selection.isEmpty
//         ? document.getText()
//         : document.getText(selection);

//     if (copiedText.length === 0) {
//         vscode.window.showErrorMessage('No text selected or document is empty.');
//         return;
//     }

//     let fileName = '';
//     const fullPath = document.uri.fsPath;
//     const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

//     if (!workspaceFolder || nameOnly) {
//         fileName = path.basename(fullPath);
//     } else {
//         const relativePath = path.relative(workspaceFolder.uri.fsPath, fullPath);
//         const normalizedPath = './' + relativePath.replace(/\\/g, '/'); // POSIX-style path
//         fileName = normalizedPath;
//         console.log('Relative path:', normalizedPath);
//         vscode.window.showInformationMessage(`Relative path: ${normalizedPath}`);
//     }

//     const finalText = `${fileName}: \`\`\`\n${copiedText}\n\`\`\``;

//     vscode.env.clipboard.writeText(finalText).then(() => {
//         vscode.window.showInformationMessage(`Copied to clipboard: ${fileName}`);
//     }, (err) => {
//         vscode.window.showErrorMessage(`Failed to copy to clipboard: ${err}`);
//     });
// }



/** A Helper class for file stuff */
class FileHelper {

    /**
     * Creates an instance of FileHelper.
     * @param {vscode.Uri} fileUri - The File uri aka the file path
    */
    constructor(fileUri) { 
        this.fileUri = fileUri;
    }

    /** gets the file name @returns {string} */
    getFileName() {return path.basename(this.fileUri.fsPath);}

    /** gets the file extension @returns {string} */
    getFileExtension() {return path.extname(this.fileUri.fsPath);}
    
    /** checks if the file extension is allowed based on the configuration @returns {boolean} */
    isAllowed() {return isFileExtensionAllowed(this.getFileExtension());}

    /** gets the relative file name from the workspace folder, if no workspace folder is found, it will return just the file name @returns {string} */
    getRelativeFileName() {
        const workspacefolder = vscode.workspace.getWorkspaceFolder(this.fileUri);
        if (!workspacefolder) {return this.getFileName();} //if no workspace folder, just return file name
        const relativePath = path.relative(workspacefolder.uri.fsPath, this.fileUri.fsPath); //get relative path
        return './' + relativePath.replace(/\\/g, '/'); //return relative path with POSIX-style
    }
    
    /**
     * Reads the content of the file.
     * @returns {Promise<string|null>} The content of the file as a string, or null if an error occurs.
    */
    async getFileContent() {
        try {
            const fileData = await vscode.workspace.fs.readFile(this.fileUri);
            const content = new TextDecoder('utf-8').decode(fileData);
            return content;
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to read file (${this.getFileName()}): ${err.message}`);
            return null;
        }
    }
}



/**
 * Gets the disallowed file extensions from the configuration.
 * @returns {Array<string>} An array of disallowed file extensions in lowercase.
*/
function getDisallowedFileExtensions() {
    const config = cfg.getConfig(); //get main config object
    const disallowedExtensions = config.get(CFG_DISALLOWED_EXTENSIONS) || []; //get disallowed file extensions from config
    return disallowedExtensions.map(ext => ext.toLowerCase()); //return as lowercase array
}

/**
 * Checks if the file extension is disallowed.
 * @param {string} fileExtension - The file extension to check.
 * @returns {boolean} True if the file extension is disallowed, otherwise false.
*/
function isFileExtensionAllowed(fileExtension) {
    const disallowedExtensions = getDisallowedFileExtensions(); //get disallowed file extensions
    return !disallowedExtensions.includes(fileExtension.toLowerCase()); //check if the file extension is in the disallowed list
}


/**
 * Copies the given text to the clipboard and shows a message.
 * @param {string} text - The text to copy to the clipboard.
*/
function copyToClipboard(text) {
    vscode.env.clipboard.writeText(text).then(() => {
        vscode.window.showInformationMessage('Copied to clipboard.');
    }, (err) => {
        vscode.window.showErrorMessage(`Failed to copy to clipboard: ${err}`);
    });
}

/**
 * Formats the content of a file for display.
 * @param {string} fileName - The name of the file.
 * @param {string} content - The content of the file.
 * @returns {string} The formatted content as a string.
*/
function formatFileContent(fileName, content) {
    return `${fileName}: \`\`\`\n${content}\n\`\`\``;
}

/**
 * Formats the selected content of a file for display.
 * @param {string} fileName - The name of the file.
 * @param {string} selectedText - The selected text in the file.
 * @param {number} from - The starting line number of the selection.
 * @param {number} to - The ending line number of the selection.
 * @returns {string} The formatted selected content as a string.
*/
function formatSelectedContent(fileName, selectedText, from, to) {
    return `${fileName} (${from}-${to}): \`\`\`\n${selectedText}\n\`\`\``;
}

/**
 * Gets the file helper for the current file in the active text editor.
 * @returns {FileHelper|null} An instance of FileHelper for the current file, or null if no active editor is found. 
*/
function getCurrentFileHelper() {
    const editor = vscode.window.activeTextEditor; //get active text editor
    if (!editor) {vscode.window.showErrorMessage('No active editor found.'); return null;} //if no active editor, return null
    const document = editor.document; //get document from editor
    return new FileHelper(document.uri); //return new FileHelper instance with the document uri
}

/**
 * Wrapper function to create a new FileHelper instance.
 * @param {vscode.Uri} fileUri - The file URI to create the FileHelper for.
 * @returns {FileHelper} A new instance of FileHelper.
*/
function getFileHelper(fileUri) {return new FileHelper(fileUri);}

//Export
module.exports = {
    FileHelper,
    getCurrentFileHelper,
    getFileHelper,
    getDisallowedFileExtensions,
    isFileExtensionAllowed,
    copyToClipboard,
    formatFileContent,
    formatSelectedContent,
};
