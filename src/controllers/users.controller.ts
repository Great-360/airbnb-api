import { Request, Response } from "express";
import { User, users } from "../models/users.model.js";
import { error } from "node:console";



export const getAllUsers = (req: Request, res: Response): void  => {
    res.json(users);
}
export const getUserById = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const user = users.find(user => user.id === id);
    if(!user) {
     res.status(404).json({error: "user not found"})
     return
    }
    res.json(user);
}

export const createUser = (req: Request, res:Response): void => {
    const { name, email, password, role} = req.body;

    if(!name || !email || !password || !role) {
        res.status(400).json({error: "missing required fields"});
        return;
    }
    const newUser: User = {
        id: users.length + 1,
        name,
        email,
        password,
        role
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
};

export const updateUser = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const user = users.find(user => user.id === id);
    if (!user) {
        res.status(404).json({error: "User not found"})
        return;
    }
    res.json(user)
}
export const deleteuser = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        res.status(404).json({error: "User not found"});
        return
    }
    const deletedUser = users.splice(userIndex, 1);
    res.json({message: "User deleted successfully", user: deletedUser[0]});
}
