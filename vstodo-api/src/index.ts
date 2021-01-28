//all of this is required to have persistent data
import "reflect-metadata";
require("dotenv-safe").config();
import express from 'express'
import {createConnection} from 'typeorm';
import { __prod__ } from "./constants";
import { join } from "path";
import { User } from "./entities/User"; //db
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport"; //auth
import jwt from 'jsonwebtoken'; //create access token
import cors from 'cors';
import { Todo } from "./entities/Todos";
import { isAuth } from "./isAuth";

const main = async () => { 
    await createConnection({ //comes from typeorm, creating a connection to our db
        type: 'postgres',
        database: 'vstodo',
        entities: [join(__dirname, './entities/*.*')], //joins 2 paths for reading information into the db
        logging: !__prod__,
        synchronize: !__prod__,
    });
   
    const app = express();
    app.use(cors({ origin: "*" }));
    
    // passport ------------------------------------------------------------------
    app.use(passport.initialize());
    //for parsing the body of the todos
    app.use(express.json());
    passport.serializeUser((user: any, done) => {
        done(null, user.accessToken);
    })
    passport.use(
        new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/github/callback"
        },
        async (_, __, profile, cb) => {
            let user = await User.findOne({ where: {githubID: profile.id}});
            if(user)
            {
                user.name = profile.displayName
                await user.save()
            }
            else{
                user = await User.create({ 
                    name: profile.displayName,
                    githubID: profile.id,
                    profileURL: profile.profileUrl,
                    profilePicURL: (profile.photos) ? profile.photos![0].value : undefined,
                }).save();
            }
            //callback
            cb(null, {
                accessToken: jwt.sign(
                    {
                        userID: user.id
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: "1y"
                    },
                )}
            );
        })        
    )   
    app.get("/auth/github", passport.authenticate("github", { session: false }));

    app.get(
      "/auth/github/callback",
      passport.authenticate("github", { session: false }),
      (req: any, res) => {
        res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
      }
    ); 
    // end of passport ---------------------------------------------------------------

    // this route basically checks to see if the user is valid or not
    app.get('/me', async ( req, res ) =>{
        //format: bearer TOKEN
        const authHeader = req.headers.authorization
        if(!authHeader) {
            res.send({ user: null })
            return;
        }
        const token = authHeader.split(" ")[1];
        if(!token) {
            res.send({ user: null })
            return;
        }
        let userID = ""
        try {
           const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
           userID = payload.userID
        } catch( err ){
            res.send({ user: null });
            console.log("error", err.message);
            return;
        }
        if(!userID){
            res.send({ user: null });
            return;
        }
        const user = await User.findOne(userID);
        res.send({ user });
    })
    // todo CRUD ---------------------------------------------------------------------------------
    app.get("/todo", isAuth, async (req, res) =>{
        const todos = await Todo.find({where: {creatorID: req.userID}, order: {id: "DESC"}});
        res.send({ todos })
    })
    app.delete("/todo", isAuth, async (req, _res) => {
        console.log(req.body.text)
        Todo.delete({id: req.body.text})
    })
    app.post("/todo", isAuth, async (req, res) => {
        const todo = await Todo.create({
          task: req.body.text,
          creatorID: req.userID,
        }).save();
        res.send({ todo });
    });
    app.put("/todo", isAuth, async (req, res) => {
        const todo = await Todo.findOne(req.body.id);
        if(!todo){
            res.send({todo: null});
            return;
        }
        if(todo.creatorID !== req.userID){
            throw new Error("Not authorized");
        }
        todo .completed = !todo?.completed
        await todo.save();
        res.send({ todo });
    })
    // end of todo CRUD --------------------------------------------------------------------------
    app.get('/', (_req, res) => {
        res.send("hello yoooo");
    })
    app.listen(3001, () => {
        console.log("listening")
    })
};
main();