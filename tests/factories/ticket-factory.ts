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
        data: {code, owner, eventId}
    });
}