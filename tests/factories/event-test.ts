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
        data: { name, date }
    })
}

export function wrongTypeEventBody() {
    return {
        name: 123,
        date: "not-a-date",
    };
}

export async function createPastEvent() {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    return await prisma.event.create({
        data: {
            name: "past-event",
            date: pastDate
        }
    });
}