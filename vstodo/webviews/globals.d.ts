import * as vscode from "vscode"
import path from "path"
declare global {
    const tsvscode: {
        postMessage: ({type: string, value: string}) => void;
    }
    const apiBaseURL: string;
}