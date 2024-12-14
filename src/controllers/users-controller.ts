import { Request, Response } from "express";
import { AppError } from "../utils/appError";
import { z } from 'zod'
import { hash } from 'bcrypt'
import { prisma } from '../database/prisma'


class UsersController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(2),
            email: z.string().email(),
            password: z.string().min(6)
        })

        const { name, email, password } = bodySchema.parse(request.body);
        const userWithSameEmail = await prisma.user.findFirst({where: { email }})
        
        if(userWithSameEmail) {
            throw new AppError("Este e-mail já está em uso.", 400)
        }

        const hashedPassword = await hash(password, 8);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const { id, role, createdAt, updatedAt } = user
        
        return response.status(201).json({
            "id": id,
            "name": name,
            "email": email,
            "role": role,
            "createdAt": createdAt,
            "updatedAt": updatedAt,
        });
    }
}


export { UsersController }
