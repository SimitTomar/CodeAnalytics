"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
// const fs = require("fs");
// const es = require("event-stream");
const AnalyticsClass = require('./classes/analytics-class');
const AnalyticsController = require('./controller/analytics-controller');
const DashboardClass = require('./classes/dashboard-class');

const activate = (context) => {

    console.log('Congratulations, CodeAnalytics is now active!');
    let analyticsClass = new AnalyticsClass();
    let analyticsController = new AnalyticsController(analyticsClass);
    let generateDashboardDisposable = vscode.commands.registerCommand('extension.generateDashboard', () => {
        let dashboardClass = new DashboardClass();
        dashboardClass.generateHtml();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(analyticsController);
    context.subscriptions.push(analyticsClass);
    context.subscriptions.push(generateDashboardDisposable);
}
exports.activate = activate;