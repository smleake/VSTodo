import * as vscode from 'vscode';
import { apiBaseURL } from './constants';
import * as polka from 'polka';
import { TokenManager } from './TokenManager';
export const auth = (fn: () => void) => {
    //initialize server, polka is very similar to express
    const app = polka(); 
    app.get("/auth/:token", async (req, res) => {
        const { token } = req.params;
        //if there is no token, display error
        if(!token){
            res.end(`<h1>something went wrong</h1>`);
            return;
        }
        TokenManager.setToken(token);
        fn();
        res.end(`<h1>auth was successful</h1>`);
    })
    app.listen(54321, (err: Error) => {
        if( err ){
            vscode.window.showErrorMessage(err.message);
        }
        else{
            vscode.commands.executeCommand(
                'vscode.open',
                vscode.Uri.parse(`${apiBaseURL}/auth/github`)
            );
        }
    })
};