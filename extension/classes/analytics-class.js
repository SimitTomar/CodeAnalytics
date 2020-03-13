const fs = require("fs");
const vscode = require("vscode");
const ts_stopwatch = require("ts-stopwatch");
const stopwatch = new ts_stopwatch.Stopwatch();
const {TOTAL_USED_TIME, FILE_NAME, DATE_TIME, CURRENT_EVENT_TIME, LAST_TOTAL_USED_TIME, CNTR, TOTAL_LINES} = require('../config/analytics-constants');


class CodeAnalytics {
    constructor() {
        this.settings = this.getConfig();
        this.timeout = this.settings.get('timeout');
        this.currentEventTime = CURRENT_EVENT_TIME;
        this.lastTotalUsedTime = LAST_TOTAL_USED_TIME;
        this.cntr = CNTR;
        this.totalLines = TOTAL_LINES;
        this.codeAnalytics = {
            'dateTime': DATE_TIME,
            'fileName': FILE_NAME,
            'totalUsedTime': TOTAL_USED_TIME
        };

        //Listening workspace configurations change
        vscode.workspace.onDidChangeConfiguration(this.getConfig, this);
    }

    updateCodeAnalytics() {
        // Get the current text editor
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Get the Language and the File Name of the opened Document
        let doc = editor.document;
        let docFileName = doc.fileName;
        let docLanguageId = doc.languageId;

        // Capture the Last and Current time at which an event is trigerred
        this.lastEventTime = this.currentEventTime;

        // Start the Stopwatch
        stopwatch.start();
        this.currentEventTime = (stopwatch.getTime()) / 1000;
        this.currentEventTime = Math.round(this.currentEventTime);

        // Calculate the Total time the Person has been coding
        if (this.currentEventTime - this.lastEventTime < this.timeout) {
            this.lastTotalUsedTime = this.lastTotalUsedTime + (this.currentEventTime - this.lastEventTime);
        }
        else {
            this.lastTotalUsedTime = this.lastTotalUsedTime + this.settings.timeTracker.timeout;
        }

        console.log(`${JSON.stringify(this.codeAnalytics, null)}`);

        // Put the Total Used Time and File Name in the codeAnalytics Object
        this.codeAnalytics.dateTime = new Date;
        this.codeAnalytics.fileName = docFileName;
        this.codeAnalytics.totalUsedTime = this.lastTotalUsedTime;
        // console.log('__dirname', __dirname);


        //Append the Code Analytics in the Log File
        fs.appendFileSync(`${__dirname}/activity.log`, `${JSON.stringify(this.codeAnalytics, null)}\n`);
    }

    getConfig() {
        this.settings = vscode.workspace.getConfiguration('timeTracker');
        return this.settings;
    }

    dispose() {
    }
}


module.exports = CodeAnalytics;