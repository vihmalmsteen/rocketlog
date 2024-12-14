import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from 'zod';
import { AppError } from "@/utils/appError";


class DeliveryLogsController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            delivery_id: z.string().uuid(),
            description: z.string(),
       })

        const { delivery_id, description } = bodySchema.parse(request.body);
    
       const delivery = await prisma.delivery.findFirst({where: { id: delivery_id }})

        if(!delivery) {
            throw new AppError('Delivery not found.', 404)
       }

       if(delivery.status === 'processing') {
            throw new AppError('Delivery is still being processed.', 400)
       }

       if(delivery.status === 'delivered') {
            throw new AppError('Delivery already delivered.', 400)
       }

        await prisma.deliveryLog.create({
            data: {
                deliveryId: delivery_id,
                description
            }
        })
    
        return response.status(201).json({ 
            message: 'Delivery log created', 
            delivery_id, 
            description 
        })
    }

    async show(request: Request, response: Response) {
        const paramsSchema = z.object({
            delivery_id: z.string().uuid()
        })

        const { delivery_id } = paramsSchema.parse(request.params)

        // include é como um join, pegando de delivery (FROM) e os dados das demais tabelas (use=true e logs=true)
        const delivery = await prisma.delivery.findFirst({
            where: { id: delivery_id },
            include: {
                user: true,
                logs: true
            }
        })

        if(!delivery) {
            throw new AppError('Delivery not found.', 404)
        }

        if(request.user?.role === "customer" && request.user.id !== delivery.userId) {
            throw new AppError('Delivery not from this customer. Unauthorized.', 401)
        }

        return response.json({ delivery })
    }
}


export { DeliveryLogsController }
