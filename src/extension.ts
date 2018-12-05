'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as cb from 'clipboardy';
import { MongoConnectController, LookupResult } from './mongo.connect';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Start mongo connection
    let mcc = new MongoConnectController("mongodb://localhost:27017", "", "portal");
    mcc.initialiseConnection().then(() => {
        if (mcc) {
            //mcc.listDocuments("test_collection");
            //mcc.findOneUnknownCollection("TEST");
            //Crank up the clipboard watcher and wait for mongo _id to be copied before asking if they want to look up
            setInterval(() => {
                if (checkClipboardForMongoId()) {
                    console.log("Found id in clipboard: ", checkClipboardForMongoId());
                    mcc.findOneUnknownCollection(checkClipboardForMongoId()).then((result: LookupResult) => {
                        if(result && result.dataModel) {
                            vscode.window.showInformationMessage(JSON.stringify(result.dataModel, null, 2));
                        }
                    });
                }
            }, 5000);

        }
        console.log("CONNECTION SUCCESSFUL");
    });

    let myHoverProvider = vscode.languages.registerHoverProvider('javascript', {
        provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
            console.log("Hover detected");
            return new vscode.Hover("I am a hover!");
        }
    });

    //let myDebugProvider = vscode.debug.registerDebugConfigurationProvider("node", undefined);
    // vscode.debug.activeDebugSession.onDidChangeActiveDebugSession((session: vscode.DebugSession | undefined) => {
    //     if(session) {
    //         session.
    //     }
    // }); 

    context.subscriptions.push(myHoverProvider);
    //context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function checkClipboardForMongoId(): string {
    let clipboard = cb.readSync();
    if (clipboard) {
        if (typeof clipboard === 'string' && clipboard.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)) {
            return clipboard;
        } else {
            return "";
        }
    } else {
        return "";
    }
}