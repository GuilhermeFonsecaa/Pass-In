import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getAttendeeBadge(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .get("/attendees/:attendeeId/badge", {
            schema: {
                summary: 'Get an attendee badge',
                tags: ['attendees'],
                params: z.object({
                    attendeeId: z.coerce.number().int(), //coerce -> converter valor em número 
                }),
                response: {
                    200: z.object({
                        badge: z.object({
                            name: z.string(),
                            email: z.string(),
                            event: z.object({
                                title: z.string(),
                                details: z.string().nullable()
                            }),
                            checkInURL: z.string().url()
                        })
                    })
                },
            }
        },
            async (request, reply) => {
                const { attendeeId } = request.params;

                const attendee = await prisma.attendee.findUnique({
                    select: {
                        name: true,
                        email: true,
                        event: {
                            select: {
                                title: true,
                                details: true,
                            }
                        }
                    },
                    where: {
                        id: attendeeId
                    }
                })

                if (attendee === null) {
                    throw new Error("Attendee not found.")
                }

                const baseURL = `${request.protocol}:${request.hostname}`

                const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL)


                return reply.send({
                    badge: {
                        name: attendee.name,
                        email: attendee.email,
                        event: {
                            title: attendee.event.title,
                            details: attendee.event.details
                        },
                        checkInURL: checkInURL.toString()
                    }
                })
            })
}