export type User = {
    id: string;
    name: string;
    profileURL: string;
    profilePicURL: string;
    githubId: string;
};
export type Todo = {
    task: string,
    completed: boolean, 
    id: number
}