
import prisma from "../model/prisma.js";
import bcryptjs from "bcryptjs"
import generateToken from "../utils/generateToken.js";
import { Request, Response } from "express";

export const signup = async (req: Request ,res: Response) => {
    try {
        const {fullname, username, password, confirmPassword, gender} = req.body;

        // Validate
        if(!fullname || !username || !password || !confirmPassword || !gender){
            res.status(400).json({error: "Please Fill In All The Fields"});
            return;
        }

        if(password !== confirmPassword){
            res.status(400).json({error: "Password don't match"});
            return;
        }

        // Check username
        const user = await prisma.user.findUnique(
            {
                where: {username}
            }
        )

        if(user){
            res.status(400).json({error: "Username already exists"});
            return;
        }


        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

        const newUser = prisma.user.create({
            data: {
                fullname,
                username,
                password: hashedPassword,
                gender,
                profilePic: gender === "male" ? boyProfilePic : girlProfilePic
            },
        });

        if (newUser) {
            // generate token 
            generateToken((await newUser).id, res);

            res.status(201).json({          
                id: (await newUser).id,
                fullname: (await newUser).fullname,    
                username: (await newUser).username,
                profilePic: (await newUser).profilePic
            });
        } else {
            res.status(400).json({
                error: "invalid user data"
            });
            return;
        }
        

    } catch (error: any) {
        console.log("Error in signup controller : ", error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({ where: {username}});

        if(!user){
            res.status(400).json({ error: "Invalid username" });
            return;
        };
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);

        if(!isPasswordCorrect){
            res.status(400).json({ error: "Invalid password" });
            return;
        };

        generateToken(user.id, res);

        res.status(201).json({          
            id: (await user).id,
            fullname: (await user).fullname,    
            username: (await user).username,
            profilePic: (await user).profilePic
        });

    } catch (error: any) {
        console.log("Error in signup controller : ", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully !" });
    } catch (error: any) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

		if (!user) {
			res.status(404).json({ error: "User not found" });
            return;
		}

		res.status(200).json({
			id: user.id,
			fullName: user.fullname,
			username: user.username,
			profilePic: user.profilePic,
		});
    } catch (error: any) {
        console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
};