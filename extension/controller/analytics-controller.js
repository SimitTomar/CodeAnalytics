const vscode = require("vscode");


class CodeAnalyticsController {
    constructor(codeAnalytics) {
        this._codeAnalytics = codeAnalytics;
        // subscribe to selection change and editor activation events
        let subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        // update the counter for the current file
        this._codeAnalytics.updateCodeAnalytics();
        // create a combined disposable from both event subscriptions
        this._disposable = vscode.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable.dispose();
    }
    _onEvent() {
        this._codeAnalytics.updateCodeAnalytics();
    }
}

module.exports = CodeAnalyticsController;