// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';
import { Stopwatch } from "ts-stopwatch";
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from 'constants';
// import { settings } from 'cluster';
import * as vscode from 'vscode';
import { fstat } from 'fs';
import * as fs from 'fs';
import * as es from 'event-stream';


const stopwatch = new Stopwatch();

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
        

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "TimeTracker" is now active!');

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

class WordCounter {

    constructor(){
        //Listening workspace configurations change
        vscode.workspace.onDidChangeConfiguration(this.getConfig, this);
    }

    private _statusBarItem: StatusBarItem =  window.createStatusBarItem(StatusBarAlignment.Left);

    settings = this.getConfig();
    timeout = this.settings.get('timeout');
    codeAnalytics = {
        'totalUsedTime': 0,
        'fileName': '',
        'dateTime': new Date
    };

    lastEventTime:number;
    currentEventTime: number = 0;
    lastTotalUsedTime: number = 0;
    currentTotalUsedTime: number;
    cntr: number = 0;
    totalLines: number = 0;


      

    public updateWordCount() {

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        // Get the Language anf the File Name of the opened Document
        let doc = editor.document;
        let docFileName = doc.fileName;
        let docLanguageId = doc.languageId;

        // Capture the Last and Current time at which an event is trigerred
        this.lastEventTime = this.currentEventTime;
        console.log('lastEventTime', this.lastEventTime);

        // Start the Stopwatch
        stopwatch.start();
        this.currentEventTime = (stopwatch.getTime())/1000;
        this.currentEventTime = Math.round(this.currentEventTime);
        console.log('currentEventTime', this.currentEventTime);

        // Calculate the Total time the Person has been coding
        if (this.currentEventTime - this.lastEventTime < this.timeout){
            this.lastTotalUsedTime = this.lastTotalUsedTime + (this.currentEventTime - this.lastEventTime);
        } else{
            this.lastTotalUsedTime = this.lastTotalUsedTime + this.settings.timeTracker.timeout;
        }

        console.log('lastTotalUsedTime', this.lastTotalUsedTime);

        // Put the Total Used Time and File Name in the CodeStats Object
        this.codeAnalytics.totalUsedTime = this.lastTotalUsedTime;
        this.codeAnalytics.fileName = docFileName;
        this.codeAnalytics.dateTime = new Date;

        //Append the Code Analytics in the Log File
        fs.appendFileSync('/Users/simtomar/Desktop/CodeAnalytics/src/CodeAnalytics.log', `${JSON.stringify(this.codeAnalytics, null)}\n`);


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

    public _getWordCount(doc: TextDocument): number {

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
    
    public getConfig() {
        this.settings = vscode.workspace.getConfiguration('timeTracker');
        return this.settings;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter) {

        this._wordCounter = wordCounter;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update the counter for the current file
        this._wordCounter.updateWordCount();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {        
        this._wordCounter.updateWordCount();
    }
}


class CodeAnalytics{

    public generateHtmlReport(){

        let codeStats: any = [];

        fs
        .createReadStream('/Users/simtomar/Desktop/CodeAnalytics/src/CodeAnalytics.log')
        .pipe(es.split())
        .pipe(es.map(function(line, cb){
                    codeStats.push(line);
                    cb(null, line)
                })
        )


        return codeStats;

    }


}

