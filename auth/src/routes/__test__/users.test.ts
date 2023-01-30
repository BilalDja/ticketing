import request from "supertest";
import { app } from "../../app";

describe("User Sign up", () => {
  it("returns 201 successful signup", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
  });

  it("returns 400 with invalid email", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid",
        password: "password",
      })
      .expect(400);
  });

  it("returns 400 with invalid password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "p",
      })
      .expect(400);
  });

  it("returns 400 with missing email and password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@eamil.com",
      })
      .expect(400);

    await request(app)
      .post("/api/users/signup")
      .send({
        password: "password",
      })
      .expect(400);
  });

  it("returns 400 with the same email", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(400);
  });

  it("should sets a cookie after a successful sign up", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
    expect(response.get("Set-Cookie")).toBeDefined();
  });
});

describe("User Sign in", () => {
  it("should return 400 if the email doesnt exist", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(400);
  });

  it("should return 400 when we supply an incorrect password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "valid@email.com",
        password: "passcode",
      })
      .expect(400);
  });

  it("should return 201 with cookie when we supply a correct email and  password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
    const response = await request(app)
      .post("/api/users/signin")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(200);
    expect(response.get("Set-Cookie")).toBeDefined();
  });
});

describe("User Sign out", () => {
  it("Should return 200 with set cookie", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "valid@email.com",
        password: "password",
      })
      .expect(201);
    const response = await request(app)
      .post("/api/users/signout")
      .send({})
      .expect(200);
    expect(response.get("Set-Cookie")).toBeDefined();
  });
});

describe("User Current User", () => {
  it("should return details of the current user", async () => {
    const cookie = await signup();
    const response = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie)
      .send()
      .expect(400);
    expect(response.body.currentUser.email).toEqual("test@test.com");
  });
  it("should response with null if user not authenticated", async () => {
    const response = await request(app)
      .get("/api/users/currentuser")
      .send()
      .expect(200);
    expect(response.body.currentUser).toBeNull();
  });
});
