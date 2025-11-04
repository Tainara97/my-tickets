import { faker } from "@faker-js/faker";
import prisma from "../../src/database";
import { createNewEvent } from "./event-test";

export function createNewTicketBody(eventId: number) {
    return {
        code: faker.lorem.words(2),
        owner: faker.name.fullName(),
        eventId
    };
}

export async function createNewTicket() {
    const event = await createNewEvent();
    const { code, owner, eventId } = createNewTicketBody(event.id);

    return await prisma.ticket.create({
        data: { code, owner, eventId }
    });
}

export async function createUsedTicket() {
    const event = await createNewEvent();
    const ticketData = createNewTicketBody(event.id);

    const ticket = await prisma.ticket.create({
        data: { ...ticketData, used: true }
    });

    return ticket;
}

export function ticketWithInvalidEventId() {
    return {
        code: faker.lorem.words(2),
        owner: faker.name.fullName(),
        eventId: 9999
    };
}
