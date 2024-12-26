import { Request, Response } from "express";
import prisma from "../model/prisma.js";

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const { id:receiverId } = req.params;
        const senderId = req.user.id;

        // Tìm kiếm hoặc tạo mới conversation
        let conversation = await prisma.conversation.findFirst({
            where:{
                participantIds: {
                    hasEvery: [senderId, receiverId]
                },
            }
        });

        
        if(!conversation){
            conversation = await prisma.conversation.create({
                data: {
                    participantIds: {
                        set: [senderId, receiverId]
                    },
                }
            })
        }

        // Tạo tin nhắn mới
        const newMessage = await prisma.messages.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id
            }
        });

         // Cập nhật conversation với tin nhắn mới
         await prisma.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
        });

        // Socketio

        res.status(201).json(newMessage);

    } catch (error: any) {
        console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;

        const conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, userToChatId],
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    }
                }
            }
        });

        if(!conversation){
            res.status(200).json([]);
            return;
        };

        res.status(200).json(conversation.messages);

    } catch (error: any) {
        console.error("Error in getMessages: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}

export const getUsersForSideBar = async (req: Request, res: Response) => {
    try {
        const authUserId = req.user.id;
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: authUserId
                }
            }, 
            select: {
                id: true,
                fullname: true,
                profilePic: true
            },
        });

        res.status(200).json(users);

    } catch (error: any) {
        console.error("Error in getMessages: ", error.message);
		res.status(500).json({ error: "Internal server error" });
    }
}