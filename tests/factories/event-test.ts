import { faker } from "@faker-js/faker";
import prisma from "../../src/database";

export function createNewEventBody() {
    return {
        name: faker.lorem.words(2),
        date: faker.date.future()
    }
}

export async function createNewEvent() {
    const { name, date } = createNewEventBody();
    return await prisma.event.create({
        data: {name, date}
    })
}
