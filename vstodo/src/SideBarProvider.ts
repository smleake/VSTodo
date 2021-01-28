import * as vscode from "vscode";
import { auth } from "./auth";
import { apiBaseURL } from "./constants";
import { getNonce } from "./getNonce";
import { TokenManager } from "./TokenManager";
export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  constructor( private readonly _extensionUri: vscode.Uri) {}
 
  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
       this._extensionUri,
       vscode.Uri.joinPath(this._extensionUri, "media"),
       vscode.Uri.joinPath(this._extensionUri, "webviews/componets")
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "logout": {
            TokenManager.setToken('');
            break;
        }
        case "get-token": {
            webviewView.webview.postMessage({type: 'token', value: TokenManager.getToken()});
            break;
        }
        case "authenticate": {
          auth(() => {
            webviewView.webview.postMessage(
              {type: 'token',
              value: TokenManager.getToken()});
          });
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }
  
  private _getHtmlForWebview(webview: vscode.Webview) {

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleTodoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "todos.css")
    )


    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src *; img-src https: data: vscode-webview: ${webview.cspSource}; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${webview.cspSource};"
        />
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${styleTodoUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
          const apiBaseURL = ${JSON.stringify(apiBaseURL)}; <!-- stringified to put quotations around -->
        </script>
			</head>
      <body>
        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}