import fastify from "fastify";
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { generateSlug } from "./utils/generate-slug";

const app = fastify()

const prisma = new PrismaClient({
    log: ['query']
})

app.post("/events", async (request, reply) => {
    const createEventSchema = z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
    })

    const { title, details, maximumAttendees } = createEventSchema.parse(request.body) //validação dos dados 
    const slug = generateSlug(title)
    const eventWithSameSlug = await prisma.evemt.findUnique({
        where: {
            slug
        }
    })

    if (eventWithSameSlug !== null) {
        throw new Error('Another event with same title already exists')
    }

    const event = await prisma.evemt.create({
        data: {
            title: title,
            details: details,
            maximumAttendees: maximumAttendees,
            slug: slug,
        }
    })

    return reply.status(201).send({ eventId: event.id })
})



app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running')
})