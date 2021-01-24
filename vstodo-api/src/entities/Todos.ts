import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Todo extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")//incase display name is null
    task: string;

    @Column("boolean", { default: false })
    completed: boolean;
    @Column()
    creatorID: number;
            //(related to | field)      
    @ManyToOne(() => User, (u) => u.todos)
    @JoinColumn({ name: "creatorID"})
    owner: Promise<User> 
}
