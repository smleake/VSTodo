import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Todo } from "./Todos";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text", { nullable: true })//incase display name is null
    name: string;
    
    @Column("text")
    profileURL: string;

    @Column("text", { nullable: true })
    profilePicURL: string;

    @Column("text", { unique: true })
    githubID: string;
    //notice how names match up with other schema One to Many/Many to One
    @OneToMany(() => Todo, t => t.owner)
    todos: Promise<Todo[]>
}
