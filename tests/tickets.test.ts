import prisma from "../src/database";
import app from "index";
import supertest from "supertest";
import { createNewTicket } from "./factories/ticket-factory";
import { createNewEvent } from "./factories/event-test";

const api = supertest(app);

beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany();
})

describe("GET /tickets/:eventId", () => {
    it("should return all tickets from a specific event", async () => {
        const ticket = await createNewTicket();

        const { status, body } = await api.get(`/tickets/${ticket.eventId}`);

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: ticket.id,
                    code: ticket.code,
                    owner: ticket.owner,
                    eventId: ticket.eventId
                })
            ])
        );
    })

    it("should return an empty array when the event has no tickets", async () => {
        const event = await createNewEvent();

        const { status, body } = await api.get(`/tickets/${event.id}`);

        expect(status).toBe(200);
        expect(body).toEqual([]);
    });

    it("should return 404 when event not found", async () => {
        const { status, body } = await api.get("/tickets/9999");

        expect(status).toBe(200);
        expect(body).toEqual([]);
    });
})
