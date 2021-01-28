<script lang="ts">
    import { onMount } from "svelte"
    import type { User } from "../types";
    import type { Todo } from "../types"
    let text = ''
    let todos: Array<Todo> = [];
    export let user: User;
    export let accessToken: string;

    async function addTodo(newText: string) {
        const response = await fetch(`${apiBaseURL}/todo`, {
            method: "POST",
            body: JSON.stringify({
                text: newText,
            }),
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`
            },
        });
        const {todo} = await response.json();
        todos = [todo, ...todos];
    }

    async function getTodos(): Promise<Todo[]>{
        const response = await fetch(`${apiBaseURL}/todo`, {
            method: "GET",
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const payload = await response.json();
        return payload.todos;
    }

    async function deleteTodo(todoID: number){
        const response = await fetch(`${apiBaseURL}/todo`, {
            method: "DELETE",
            body: JSON.stringify({
                text: todoID,
            }),
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        })
        const {todo} = await response.json();
        todos = todo;
    }
    onMount( async () => {
        window.addEventListener("message", async (event) => {
                const message = event.data;
                switch(message.type) {
                    //adds a new todo
                    case 'new-todo':
                        if(message.value === ""){
                            tsvscode.postMessage({type: "onError", value: "Text field must not be empty. Please enter at least one letter."})
                            return;
                        }
                        else if(message.value.length > 50){
                            tsvscode.postMessage({type: "onError", value: "Text field must be less than 50 characters."})
                            return;
                        }
                        addTodo(message.value);    
                        break;
                }
            });
            todos = await getTodos();
    })                      
</script>
    <div class="user-container">
        <div title="Go to GitHub" class="img-container">

            <a href="{user.profileURL}">
                <img class="profilePhoto" src="{user?.profilePicURL}" alt=""/>
            </a>
            
        </div>
        <div class="user-name">Hello, {user.name} </div>
    </div>    
<form 
    on:submit= { async (e) =>{
        e.preventDefault();
        if(text === ""){
           tsvscode.postMessage({type: "onError", value: "Todo must not be empty. Please enter at least one letter."})
           return;
        }
        else if(text.length > 50){
            tsvscode.postMessage({type: "onError", value: "Todo must be less than 50 characters."})
            text = "";
            return;
        }
        addTodo(text);   
        text = "";
    }}>
    <input bind:value="{text}"/>
</form>
{#if todos.length > 0}
    <ul>
        {#each todos as todo (todo.id)}
            <div class="todo-container">
                <div class="todo">
                    <li 
                        class:completed={todo.completed}
                        on:click={async () => {
                        todo.completed = !todo.completed;
                        const response = await fetch(`${apiBaseURL}/todo`, {
                            method: "PUT",
                            body: JSON.stringify({
                                id: todo.id,
                            }),
                            headers: {
                                    'content-type': 'application/json',
                                    authorization: `Bearer ${accessToken}`
                            }
                        })
                        await response.json();
                        }}
                    >{todo.task}</li>
                </div>
                <div class="trash-icon" title="Delete Todo">
                    <svg on:click={ async () => {
                        let tempText = todo.task;
                        deleteTodo(todo.id);
                        console.log({ todos });
                        todos = await getTodos();
                        console.log({ todos });
                        tsvscode.postMessage({type: "onInfo", value: "Task \'" + tempText + "\' has been successfully deleted."});
                        tempText = "";
                    }}
                    class="svg-baseline" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/>
                    </svg>
                </div>    
            </div>    
            {/each}

    </ul>
    {:else}
        <div class="empty-todos">Add a todo!</div>
{/if}    
{#if user}
    <button on:click= {()=>{
        if(text === ""){
            tsvscode.postMessage({type: "onError", value: "Text field must not be empty. Please enter at least one letter."})
            return;
        }
        else if(text.length > 50){
            tsvscode.postMessage({type: "onError", value: "Text field must be less than 50 characters."})
            return;
        }
        addTodo(text);
    }}
    >add todo</button>
{/if}
