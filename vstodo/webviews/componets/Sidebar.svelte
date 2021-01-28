<script lang="ts">

    import { onMount } from "svelte";
    import type { User } from "../types";
    import Todos from "./Todos.svelte";
    let accessToken = '';
    let loading = true;
    let user: User | null = null;

    onMount( async () =>{
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch(message.type) {
                case 'token':{
                    accessToken = message.value;
                    const response = await fetch(`${apiBaseURL}/me`, {
                            headers: {
                                authorization: `Bearer ${accessToken}`,
                            },
                        });
                    const data = await response.json();
                    user = data.user;
                    loading = false;  
                    break;
                }            
            }
        })
        tsvscode.postMessage({type: "get-token", value: null})
    })
</script>

{#if loading}
    <img class="loading" src="vscode-webview-resource://webviewview-vstodo-sidebar/file///c:/Users/leake/vscode_ext/vstodo/media/loading.gif" alt="loading..."/>
    {:else if user}
        <Todos user={user} accessToken={accessToken}/>
        <button class="secondary" on:click= {()=>{
                accessToken = '';
                user = null;
                tsvscode.postMessage({type: "logout", value: null})
        }}>
        logout
        </button>
    {:else}
        <button on:click={()=>{
            tsvscode.postMessage({type: "authenticate", value: null})
        }}>
        login in with GitHub
        </button>
{/if}