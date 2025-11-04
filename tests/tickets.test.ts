import prisma from "../src/database";
import app from "index";
import supertest from "supertest";
import { createNewTicket, createNewTicketBody, createUsedTicket, ticketWithInvalidEventId } from "./factories/ticket-factory";
import { createNewEvent, createPastEvent } from "./factories/event-test";

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

    it("should return empty array when event not found", async () => {
        const { status, body } = await api.get("/tickets/9999");

        expect(status).toBe(200);
        expect(body).toEqual([]);
    });


})

describe("POST /tickets", () => {
    it("should create a new ticket", async () => {
        const event = await createNewEvent();
        const data = createNewTicketBody(event.id);

        const { status } = await api.post("/tickets").send(data);

        expect(status).toBe(201);

    });

    it("should return 404 when event not found", async () => {
        const invalidTicket = ticketWithInvalidEventId();

        const { status, text } = await api.post("/tickets").send(invalidTicket);

        expect(status).toBe(404);
        expect(text).toBe("Event with id 9999 not found.")
    });

    it("should return 403 when ticket is expired", async () => {
        const pastEvent = await createPastEvent();
        const ticketData = createNewTicketBody(pastEvent.id);

        const { status, text } = await api.post("/tickets").send(ticketData);

        expect(status).toBe(403);
        expect(text).toBe("The event has already happened.");
    });
})

describe("PUT /tickets/use/:id", () => {
    it("should mark a ticket as used", async () => {
        const ticket = await createNewTicket();

        const { status } = await api.put(`/tickets/use/${ticket.id}`);

        expect(status).toBe(204);
    });

    it("should return 403 if the event has already happened", async () => {
        const pastEvent = await createPastEvent();
        const ticketData = createNewTicketBody(pastEvent.id);

        const ticket = await prisma.ticket.create({ data: ticketData });

        const { status, text } = await api.put(`/tickets/use/${ticket.id}`);

        expect(status).toBe(403);
        expect(text).toBe("The event has already happened or ticket was already used.");
    });

    it("should return 403 if the ticket was already used", async () => {
        const usedTicket = await createUsedTicket();

        const { status, text } = await api.put(`/tickets/use/${usedTicket.id}`);

        expect(status).toBe(403);
        expect(text).toBe("The event has already happened or ticket was already used.")
    });

    it("should return 404 if the ticket does not exist", async () => {
        const {status, text} = await api.put("/tickets/use/9999");

        expect(status).toBe(404);
        expect(text).toBe("Ticket with id 9999 not found.");
    });
})

afterAll(async () => {
    await prisma.$disconnect();
});

