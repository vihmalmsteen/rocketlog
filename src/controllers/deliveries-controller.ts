import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from 'zod';

class DeliveriesController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            user_id: z.string().uuid(),
            description: z.string(),
        })

        const { user_id, description } = bodySchema.parse(request.body);

        await prisma.delivery.create({
            data: {
                userId: user_id,
                description
            }
        })

        return response.status(201).json({ 
            message: 'Delivery created', 
            userId: user_id,
            description 
        })
    }


    async index(request: Request, response: Response) {

        const deliveries = await prisma.delivery.findMany({
            include: {
                user: {
                    select: {
                        name: true, 
                        email: true, 
                        id: true
                    }
                }
            }
        })

        return response.json(deliveries)
    }

    async updateStatus(request: Request, response: Response) {
        const paramsSchema = z.object({
            id: z.string().uuid()
        })
        
        const bodySchema = z.object({
            status: z.enum(['processing', 'shipped', 'delivered'])
        })

        const { id } = paramsSchema.parse(request.params)
        const { status } = bodySchema.parse(request.body)

        await prisma.delivery.update({
            data: { status },
            where: { id }
        })

        await prisma.deliveryLog.create({
            data: {
                deliveryId: id,
                description: `Delivery status updated to: ${status}.`
            }
        })

        return response.status(200).json({ 
            message: 'Delivery status atualizado com sucesso',
            delivery_id: id,
            status
        })
    }
}


export { DeliveriesController }