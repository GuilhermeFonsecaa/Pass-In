import { prisma } from '../src/lib/prisma'

async function seed() {
    await prisma.event.create({
        data: {
            id: '9e9f19a0-6b9c-4254-8c9f-8a6f6dd6a807',
            title: 'Unite Summit',
            slug: 'unite-summit',
            details: "Um evento p/ devs apaixonados por código",
            maximumAttendees: 120
        }
    })
}

seed().then(() => {
    console.log('Database seeded!')
    prisma.$disconnect()
})
