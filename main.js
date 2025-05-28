// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const split = require('./extension/splitter');
const cfg = require('./extension/configuration');
const copy = require('./extension/copy');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
*/
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "emeraldcode" is now active!');

	//The command has been defined in the package.json file
	//Now provide the implementation of the command with  registerCommand
	//The commandId parameter must match the command field in package.json
	
	const copySelctionToClipboardCommand = vscode.commands.registerCommand('emeraldcode.copySelectionToClipboard', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {vscode.window.showErrorMessage('No active editor found.'); return;}
		const selection = editor.selection;
		if (selection.isEmpty) {vscode.window.showErrorMessage('No text selected.'); return;}

		const selectedText = editor.document.getText(selection);
		const fileHelper = copy.getCurrentFileHelper();
		if (fileHelper && fileHelper.isAllowed()) { //check if file extension is allowed
			const formattedContent = "\`\`\`\n"+selectedText+"\n\`\`\`"; //format selected content
			copy.copyToClipboard(formattedContent); //copy formatted content to clipboard
		} else {vscode.window.showErrorMessage('File type not allowed for copying.'); return;}
	}); context.subscriptions.push(copySelctionToClipboardCommand);

	const copyExplorerSelectionCommand = vscode.commands.registerCommand('emeraldcode.copyExplorerSelection', async (uri, uris) => {
		// 'uri' is the item that was right-clicked
		// 'uris' is an array of all selected items in the Explorer

		// If 'uris' is undefined, default to the single 'uri'
		const selectedUris = uris || [uri];

		let result = ""; // Initialize result string

		for (const fileUri of selectedUris) {
			const fileHelper = copy.getFileHelper(fileUri);
			if (fileHelper.isAllowed()) {
				const fileName = fileHelper.getFileName();
				const fileContent = await fileHelper.getFileContent();
				const formattedContent = copy.formatFileContent(fileName, fileContent);
				result += formattedContent + "\n\n";
			}
		}

		if (result) {copy.copyToClipboard(result.replace(/\n{2,}$/, ''));} //copy result to clipboard
	}); context.subscriptions.push(copyExplorerSelectionCommand);

	const copyRelativeExplorerSelectionCommand = vscode.commands.registerCommand('emeraldcode.copyRelativeExplorerSelection', async (uri, uris) => {
		// 'uri' is the item that was right-clicked
		// 'uris' is an array of all selected items in the Explorer

		// If 'uris' is undefined, default to the single 'uri'
		const selectedUris = uris || [uri];
		
		let result = ""; // Initialize result string
		
		for (const fileUri of selectedUris) {
			const fileHelper = copy.getFileHelper(fileUri);
			if (fileHelper.isAllowed()) {
				const fileName = fileHelper.getRelativeFileName();
				const fileContent = await fileHelper.getFileContent();
				const formattedContent = copy.formatFileContent(fileName, fileContent);
				result += formattedContent + "\n\n";
			}
		}
		
		if (result) {copy.copyToClipboard(result.replace(/\n{2,}$/, ''));} //copy result to clipboard
	}); context.subscriptions.push(copyRelativeExplorerSelectionCommand);


	const copyCurrentCommand = vscode.commands.registerCommand('emeraldcode.copyCurrent', async () => {
		const fileHelper = copy.getCurrentFileHelper();
		if (fileHelper && fileHelper.isAllowed()) { //check if file extension is allowed
			const fileName = fileHelper.getFileName(); //get file name
			const fileContent = await fileHelper.getFileContent(); //get file content
			const formattedContent = copy.formatFileContent(fileName, fileContent); //format file content
			copy.copyToClipboard(formattedContent); //copy formatted content to clipboard
		} else {vscode.window.showErrorMessage('File type not allowed for copying.'); return;}
	}); context.subscriptions.push(copyCurrentCommand);


	const copyRelativeCurrentCommand = vscode.commands.registerCommand('emeraldcode.copyRelativeCurrent', async () => {
		const fileHelper = copy.getCurrentFileHelper();
		if (fileHelper && fileHelper.isAllowed()) { //check if file extension is allowed
			const fileName = fileHelper.getRelativeFileName(); //get relative file name
			const fileContent = await fileHelper.getFileContent(); //get file content
			const formattedContent = copy.formatFileContent(fileName, fileContent); //format file content
			copy.copyToClipboard(formattedContent); //copy formatted content to clipboard
		} else {vscode.window.showErrorMessage('File type not allowed for copying.'); return;}
	}); context.subscriptions.push(copyRelativeCurrentCommand);


	const copySelectionCommand = vscode.commands.registerCommand('emeraldcode.copySelection', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {vscode.window.showErrorMessage('No active editor found.'); return;}
		const selection = editor.selection;
		if (selection.isEmpty) {vscode.window.showErrorMessage('No text selected.'); return;}

		const selectedText = editor.document.getText(selection);
		const fileHelper = copy.getCurrentFileHelper();
		if (fileHelper && fileHelper.isAllowed()) { //check if file extension is allowed
			const fileName = fileHelper.getFileName(); //get file name
			const formattedContent = copy.formatSelectedContent(fileName, selectedText, selection.start.line+1, selection.end.line+1);
			copy.copyToClipboard(formattedContent); //copy formatted content to clipboard
		} else {vscode.window.showErrorMessage('File type not allowed for copying.'); return;}

	}); context.subscriptions.push(copySelectionCommand);


	const copyRelativeSelectionCommand = vscode.commands.registerCommand('emeraldcode.copyRelativeSelection', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {vscode.window.showErrorMessage('No active editor found.'); return;}
		const selection = editor.selection;
		if (selection.isEmpty) {vscode.window.showErrorMessage('No text selected.'); return;}

		const selectedText = editor.document.getText(selection);
		const fileHelper = copy.getCurrentFileHelper();
		if (fileHelper && fileHelper.isAllowed()) { //check if file extension is allowed
			const fileName = fileHelper.getRelativeFileName(); //get file name
			const formattedContent = copy.formatSelectedContent(fileName, selectedText, selection.start.line+1, selection.end.line+1);
			copy.copyToClipboard(formattedContent); //copy formatted content to clipboard
		} else {vscode.window.showErrorMessage('File type not allowed for copying.'); return;}

	}); context.subscriptions.push(copyRelativeSelectionCommand);





	//Splitter
	const insertSplitterCommand = vscode.commands.registerCommand('emeraldcode.insertSplitter', async () => {
		const splitter = await split.selectSplitter();
		split.doSplit(splitter);
	}); context.subscriptions.push(insertSplitterCommand);

	// Splitter Presets
	const splitterCommand1 = vscode.commands.registerCommand('emeraldcode.splitter1', () => {
		split.doSplit(split.getSplitter(cfg.getSetting('splitter1')));
	}); context.subscriptions.push(splitterCommand1);

	const splitterCommand2 = vscode.commands.registerCommand('emeraldcode.splitter2', () => {
		split.doSplit(split.getSplitter(cfg.getSetting('splitter2')));
	}); context.subscriptions.push(splitterCommand2);

	const splitterCommand3 = vscode.commands.registerCommand('emeraldcode.splitter3', () => {
		split.doSplit(split.getSplitter(cfg.getSetting('splitter3')));
	}); context.subscriptions.push(splitterCommand3);

	const splitterCommand4 = vscode.commands.registerCommand('emeraldcode.splitter4', () => {
		split.doSplit(split.getSplitter(cfg.getSetting('splitter4')));
	}); context.subscriptions.push(splitterCommand4);
	
	// const copyFileCommand = vscode.commands.registerCommand('emeraldcode.copyFileToClipboard', () => {copyToClipboard(true);});
	// const copyRelativeFileCommand = vscode.commands.registerCommand('emeraldcode.copyRelativeFileToClipboard', () => {copyToClipboard(false);});
	// context.subscriptions.push(copyFileCommand);
	// context.subscriptions.push(copyRelativeFileCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
