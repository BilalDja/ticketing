import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose, { Types } from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

const createTickets = async (cookie?: string[]) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", cookie || signup())
    .send({
      title: "Valid Title",
      price: 30,
    });
};

describe("Create Ticket", () => {
  it("should has a route handler listening to /api/tickets for post request", async () => {
    const response = await request(app).post("/api/tickets").send({});
    expect(response.status).not.toEqual(404);
  });

  it("should be accessible only if user authenticated", async () => {
    return request(app).post("/api/tickets").send({}).expect(401);
  });

  it("should return a status other than 401", async () => {
    const cookie = signup();
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({});
    expect(response.status).not.toEqual(401);
  });

  it("should return error if invalide title provided", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        title: "",
        price: 10,
      })
      .expect(400);
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        price: 10,
      })
      .expect(400);
  });

  it("should return error if invalide price provided", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        title: "valid title",
        price: -10,
      })
      .expect(400);
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        title: "valid title",
      })
      .expect(400);
  });

  it("should create a ticket with valid inputs", async () => {
    let tickets = await Ticket.find();
    expect(tickets.length).toEqual(0);

    let title = "Valid Ticket Title";
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        title,
        price: 23,
      })
      .expect(201);

    tickets = await Ticket.find();

    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(23);
  });

  it("should publish an event", async () => {
    let title = "Valid Ticket Title";
    await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({
        title,
        price: 23,
      })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("Find Ticket", () => {
  it("should returns 404 if the ticket does not exist", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
  });

  it("should returns the ticket if it exists", async () => {
    const title = "Coloc";
    const price = 25;
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({ title, price })
      .expect(201);
    const { id } = response.body;
    const ticketResponse = await request(app)
      .get(`/api/tickets/${id}`)
      .send()
      .expect(200);
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });
});

describe("Fetch Tickets", () => {
  it("should return a list of Tickets", async () => {
    await createTickets();
    await createTickets();
    const response = await request(app).get("/api/tickets").expect(200);
    expect(Array.isArray(response.body)).toEqual(true);
    expect(response.body.length).toEqual(2);
  });
});

describe("Update Ticket", () => {
  it("should returns 404 if the provided id does not exist", async () => {
    const id = mongoose.Types.ObjectId;
    await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", signup())
      .send({
        title: "Valid title",
        price: 20,
      })
      .expect(404);
  });

  it("should returns 401 if the user unauthenticated", async () => {
    const response = await createTickets();
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .send({
        title: "Valid title",
        price: 20,
      })
      .expect(401);
  });
  it("should returns 401 if user does not own the ticket", async () => {
    const response = await createTickets();
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", signup())
      .send({
        title: "Valid title",
        price: 20,
      })
      .expect(401);
  });
  it("should returns 400 if the user provide invalide title or price", async () => {
    const cookie = signup();
    const response = await createTickets(cookie);
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "",
        price: 20,
      })
      .expect(400);
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "",
        price: -20,
      })
      .expect(400);
  });
  it("should update a ticket", async () => {
    const cookie = signup();
    const response = await createTickets(cookie);
    const title = "New Title";
    const price = 21;
    const ticketResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(200);
    expect(ticketResponse).toBeTruthy();
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);

    const fetchedTicket = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);
    expect(fetchedTicket).toBeTruthy();
    expect(fetchedTicket.body.title).toEqual(title);
    expect(fetchedTicket.body.price).toEqual(price);
  });

  it("should publish an event", async () => {
    const cookie = signup();
    const response = await createTickets(cookie);
    const title = "New Title";
    const price = 21;
    const ticketResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("should reject updates of a reserved ticket", async () => {
    const cookie = signup();
    const response = await createTickets(cookie);
    const title = "New Title";
    const price = 21;
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new Types.ObjectId().toHexString() });
    await ticket!.save();
    const ticketResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(400);
  });
});
