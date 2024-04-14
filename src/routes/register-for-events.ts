import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvents(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post("/events/:eventId/attendees", {
            schema: {
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email()
                }),
                params: z.object({
                    eventId: z.string().uuid()
                }),
                response: {
                    201: z.object({
                        attendeeId: z.number()
                    })
                }
            }
        },
            async (request, reply) => {
                const { eventId } = request.params
                const { name, email } = request.body

                const attendeeFromEmail = await prisma.attendee.findUnique({
                    where: {
                        eventId_email: {
                            email,
                            eventId
                        }
                    }
                })

                if (attendeeFromEmail !== null) {
                    throw new Error('This e=mail is already registered for this event')
                }


                const [event, amountOfAttendeesForEvent] = await Promise.all([
                    //buscando evento
                    prisma.event.findUnique({
                        where: {
                            id: eventId
                        },
                    }),
                    
                    //quantidade de participantes no evento
                    prisma.attendee.count({
                        where: {
                            eventId,
                        }
                    })
                ])


                //se número de participantes for maior que o máximo que um evento suporta dar erro
                if (event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees) {
                    throw new Error('The maximum number of attendees for this event has been reached')
                }

                const attendee = await prisma.attendee.create({
                    data: {
                        name,
                        email,
                        eventId
                    }
                })
                return reply.status(201).send({ attendeeId: attendee.id })
            })
}