import request from 'supertest'
import { app } from '../app'
import { prisma } from '../database/prisma'


describe("UsersControllers", () => {

    let user_id: string

    afterAll(async () => {
        await prisma.user.deleteMany({where: {id: user_id}})
    })

    test("should create a new user successufully", async () => {
        const response = await request(app).post('/users').send({
            name:"Test user",
            email:"testuser@email.com",
            password:"password123"
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("id")
        expect(response.body.name).toBe("Test user")

        user_id = response.body.id
    })


    test("should throw an error when user with same email already exists", async () => {
        const response = await request(app).post('/users').send({
            name:"Duplicate user",
            email:"testuser@email.com",
            password:"password123"
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Este e-mail já está em uso.")
    })

    test("should throw a validation error if email is invalid.", async () => {
        const response = await request(app).post('/users').send({
            name:"Invalid email user",
            email:"invalid email",
            password:"password123"
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("validation error")
    })
})

