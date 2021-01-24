<script lang="ts">
    import { onMount } from "svelte"
    import type { User } from "../types";

    let text = ''
    let todos: Array<{text: String, completed: boolean, id: number}> = [];
    export let user: User;
    export let accessToken: string;
    onMount( async () =>{
        window.addEventListener("message", async (event) => {
                const message = event.data;
                switch(message.type) {
                    //adds a new todo
                    // case 'new-todo':
                    //     todos = [{text: message.value, completed: false}, ...todos];
                    //     break;
                }
            });
        const response = await fetch(`${apiBaseURL}/todo`, {
            method: "GET",
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const payload = await response.json();
        todos = payload.todos;
    })                        
</script>
<style>
    .completed{
        text-decoration: line-through;
    }    
</style>
<div>Hello: {user.name} </div>
<form 
    on:submit= { async (e) =>{
        e.preventDefault()
        const response = await fetch(`${apiBaseURL}/todo`, {
            method: "POST",
            body: JSON.stringify({
                text,
            }),
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`
            },
        });
        const todo = await response.json();
        todos = [todo, ...todo];
        text = ""; 
    }}>
    <input bind:value="{text}"/>
</form>
<ul>
    {#each todos as todo (todo.id)}
        <li 
            class = {(todo.completed ? "completed" : "")}
            on:click={() => {
               todo.completed = !todo.completed;
            }}
        >{text}</li>
    {/each}
</ul>
