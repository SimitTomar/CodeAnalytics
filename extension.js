"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
const vscode_1 = require("vscode");
const ts_stopwatch_1 = require("ts-stopwatch");
// import { settings } from 'cluster';
const vscode = require("vscode");
const fs = require("fs");
const es = require("event-stream");
const stopwatch = new ts_stopwatch_1.Stopwatch();
// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension is now active!');
    // create a new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);
    let generateReportDisposable = vscode.commands.registerCommand('extension.generateReport', () => {
        let codeAnalytics = new CodeAnalytics();
        codeAnalytics.generateHtmlReport();
    });
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
    context.subscriptions.push(generateReportDisposable);
}
exports.activate = activate;
class WordCounter {
    constructor() {
        this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this.settings = this.getConfig();
        this.timeout = this.settings.get('timeout');
        this.codeAnalytics = {
            'totalUsedTime': 0,
            'fileName': '',
            'dateTime': new Date
        };
        this.currentEventTime = 0;
        this.lastTotalUsedTime = 0;
        this.cntr = 0;
        this.totalLines = 0;
        //Listening workspace configurations change
        vscode.workspace.onDidChangeConfiguration(this.getConfig, this);
    }
    updateWordCount() {
        // Get the current text editor
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        // Get the Language anf the File Name of the opened Document
        let doc = editor.document;
        let docFileName = doc.fileName;
        let docLanguageId = doc.languageId;
        // Capture the Last and Current time at which an event is trigerred
        this.lastEventTime = this.currentEventTime;
        // console.log('lastEventTime', this.lastEventTime);
        // Start the Stopwatch
        stopwatch.start();
        this.currentEventTime = (stopwatch.getTime()) / 1000;
        this.currentEventTime = Math.round(this.currentEventTime);
        // console.log('currentEventTime', this.currentEventTime);
        // Calculate the Total time the Person has been coding
        if (this.currentEventTime - this.lastEventTime < this.timeout) {
            this.lastTotalUsedTime = this.lastTotalUsedTime + (this.currentEventTime - this.lastEventTime);
        }
        else {
            this.lastTotalUsedTime = this.lastTotalUsedTime + this.settings.timeTracker.timeout;
        }
        // console.log('lastTotalUsedTime', this.lastTotalUsedTime);
        console.log(`${JSON.stringify(this.codeAnalytics, null)}`);
        // Put the Total Used Time and File Name in the CodeStats Object
        this.codeAnalytics.totalUsedTime = this.lastTotalUsedTime;
        this.codeAnalytics.fileName = docFileName;
        this.codeAnalytics.dateTime = new Date;
        //Append the Code Analytics in the Log File
        fs.appendFileSync('/Users/simtomar/Desktop/CodeProductivity/CodeProductivity.log', `${JSON.stringify(this.codeAnalytics, null)}\n`);
        // // Get the current text editor
        // let editor = window.activeTextEditor;
        // if (!editor) {
        //     this._statusBarItem.hide();
        //     return;
        // }
        // let doc = editor.document;
        // // Only update status if a Markdown file
        // if (doc.languageId === "markdown") {
        //     let wordCount = this._getWordCount(doc);
        // // Update the status bar
        // this._statusBarItem.text = wordCount !== 1 ? `$(pencil) ${wordCount} Words` : '$(pencil) 1 Word';
        // this._statusBarItem.show();
        // } else {
        //     this._statusBarItem.hide();
        // }
    }
    _getWordCount(doc) {
        let docContent = doc.getText();
        // Parse out unwanted whitespace so the split is accurate
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        if (docContent !== "") {
            wordCount = docContent.split(" ").length;
        }
        return wordCount;
    }
    getConfig() {
        this.settings = vscode.workspace.getConfiguration('timeTracker');
        return this.settings;
    }
    dispose() {
        this._statusBarItem.dispose();
    }


}
class WordCounterController {
    constructor(wordCounter) {
        this._wordCounter = wordCounter;
        // subscribe to selection change and editor activation events
        let subscriptions = [];
        vscode_1.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode_1.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        // update the counter for the current file
        this._wordCounter.updateWordCount();
        // create a combined disposable from both event subscriptions
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable.dispose();
    }
    _onEvent() {
        this._wordCounter.updateWordCount();
    }
}
class CodeAnalytics {
    generateHtmlReport() {
        let fileData = {};
        let currentFileTime = 0;
        let lastFileTime = 0;
        let timeTakenByEachFile = 0;
        fs
            .createReadStream('/Users/simtomar/Desktop/CodeProductivity/CodeProductivity.log')
            .on('error', function (error) {
            console.log('Error:', error.message);
        })
            .pipe(es.split())
            .pipe(es.map(function (line, cb) {
            let lineData = JSON.parse(line);
            lastFileTime = currentFileTime; //0,0,2,8,10
            currentFileTime = lineData['totalUsedTime']; //0,2,8,10,20
            if (fileData.hasOwnProperty(lineData['fileName'])) {
                timeTakenByEachFile = (currentFileTime - lastFileTime) + fileData[lineData['fileName']]; //2,8,18
                fileData[lineData['fileName']] = timeTakenByEachFile; //2,8,18
            }
            else {
                timeTakenByEachFile = currentFileTime - lastFileTime; //0,2
                fileData[lineData['fileName']] = timeTakenByEachFile; //0,2
            }
            console.log('fileData', fileData);
            cb(null, line);
        }));
    }
}