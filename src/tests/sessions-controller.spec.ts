import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'

describe("SessionsControllers", () => {
    
    let user_id: string

    afterAll(async () => {
        await prisma.user.deleteMany({where: {id: user_id}})
    })

    test("should authenticate a user and get access token", async () => {

        const userResponse = await request(app).post('/users').send({
            name:"Test user",
            email:"auth_test_user@email.com",
            password:"password123"
        })

        user_id = userResponse.body.id

        const sessionResponse = await request(app).post('/sessions').send({
            email:"auth_test_user@email.com",
            password:"password123"
        })

        expect(sessionResponse.status).toBe(200)
        expect(sessionResponse.body).toHaveProperty("token")
        expect(sessionResponse.body.token).toEqual(expect.any(String))
    })
})
