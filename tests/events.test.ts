import prisma from "../src/database";
import app from "index";
import supertest from "supertest";
import { createNewEvent } from "./factories/event-test";

const api = supertest(app);

beforeEach(async () => {
    await prisma.event.deleteMany();
})

describe("GET /events", () => {
    it("should return all events", async () => {
        await createNewEvent();

        const { status, body } = await api.get("/events");

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    date: expect.any(String)
                })
            ])
        )
    })
})

describe("GET /events/:id", () => {
    it("should return a specific event", async () => {
        const event = await createNewEvent();

        const { status, body } = await api.get(`/events/${event.id}`);

        expect(status).toBe(200);
        expect(body).toMatchObject({
            id: event.id,
            name: event.name,
            date: event.date.toISOString()
        })
    })

    it("should return 404 when event does not exist", async () => {
        const { status, text } = await api.get("/events/9999");

        expect(status).toBe(404);
        expect(text).toBe("Event with id 9999 not found.");

    })
});

afterAll(async () => {
    await prisma.$disconnect();
});