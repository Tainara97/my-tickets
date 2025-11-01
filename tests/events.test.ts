import prisma from "../src/database";
import app from "index";
import supertest from "supertest";
import { createNewEvent, createNewEventBody } from "./factories/event-test";

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

describe("POST /events", () => {
    it("should create a new event", async () => {
        const data = createNewEventBody();
        const { status } = await api.post("/events").send(data);
        expect(status).toBe(201);
    })

    it("should return 409 when event name already exist", async () => {
        const data = createNewEventBody();
        await api.post("/events").send(data);

        const { status, text } = await api.post("/events").send(data);

        expect(status).toBe(409);
        expect(text).toBe(`Event with name ${data.name} already registered.`);
    })
})

describe("PUT /events/:id", () => {
    it("should update an event", async () => {
        const event = await createNewEvent();
        const updateEvent = createNewEventBody();

        const { status, body } = await api
            .put(`/events/${event.id}`)
            .send(updateEvent);

        expect(status).toBe(200);
        expect(body).toMatchObject({
            id: event.id,
            name: updateEvent.name,
            date: updateEvent.date.toISOString()
        })
    })

    it("should return 409 when event name already exist", async () => {
        const event1 = await createNewEvent();
        const event2 = await createNewEvent();

        const { status, text } = await api
            .put(`/events/${event2.id}`)
            .send({
                name: event1.name,
                date: event2.date.toISOString()
            })

        expect(status).toBe(409);
        expect(text).toBe(`Event with name ${event1.name} already registered.`);
    })
})

afterAll(async () => {
    await prisma.$disconnect();
});