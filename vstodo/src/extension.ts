import * as vscode from 'vscode';
import { SidebarProvider } from "./SideBarProvider"
import { TokenManager } from './TokenManager';


export function activate(context: vscode.ExtensionContext) {
	TokenManager.globalState = context.globalState;
	context.subscriptions.push(
		vscode.commands.registerCommand("vstodo.refresh", async ()=> {
			await vscode.commands.executeCommand("workbench.action.closeSidebar")
			await vscode.commands.executeCommand("workbench.view.extension.vstodo-sidebar-view")
			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools")
			}, 500);
			
		})
	)
	const sideBarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vstodo-sidebar", //id in package.json
			sideBarProvider,
		)
	)
	//generate icon for add todo button
	const icon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	icon.text = '$(file-code) Add Todo';
	icon.command = 'vstodo.addTodo'
	icon.tooltip = 'Add a todo via VSTodo'
	icon.show();
	context.subscriptions.push(
		vscode.commands.registerCommand("vstodo.helloWorld", () =>{ 
			vscode.window.showInformationMessage(
				"token value is: " + TokenManager.getToken()
				);
		}
		)
	)	

	context.subscriptions.push( //adds a new todo from a selection in an active editor
		vscode.commands.registerCommand("vstodo.addTodo", () => {
			const { activeTextEditor } = vscode.window
			if(!activeTextEditor){
				vscode.window.showInformationMessage("No active text editor opened.");
				return;
			}
			const activeText = activeTextEditor.document.getText(activeTextEditor.selection);
			sideBarProvider._view?.webview.postMessage({
				type: 'new-todo',
				value: activeText,
			});
		})
	);
}
// this method is called when your extension is deactivated
export function deactivate() {}
