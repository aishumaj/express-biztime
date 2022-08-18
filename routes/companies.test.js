// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test1', 'Test Company 1', 'This is a test')
    RETURNING code, name, description`);
  testCompany = result.rows[0];
});


/** GET /companies - returns `{companies: [{code, name}, ...]}}` */

describe("GET /companies", function () {
  test("Gets a list of 1 company", async function () {
    const resp = await request(app).get(`/companies`);
    expect(resp.body).toEqual({
      companies: [{code: testCompany.code, name: testCompany.name}],
    });
  });
});
// end


// /** GET /cats/[id] - return data about one cat: `{cat: cat}` */

// describe("GET /cats/:id", function () {
//   test("Gets single cat", async function () {
//     const resp = await request(app).get(`/cats/${testCat.id}`);
//     expect(resp.body).toEqual({ cat: testCat });
//   });

//   test("Respond with 404 if not found", async function () {
//     const resp = await request(app).get(`/cats/0`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
// // end


// /** POST /cats - create cat from data; return `{cat: cat}` */

// describe("POST /cats", function () {
//   test("Create new cat", async function () {
//     const resp = await request(app)
//         .post(`/cats`)
//         .send({ name: "Ezra" });
//     expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({
//       cat: { id: expect.any(Number), name: "Ezra" },
//     });
//   });
// });
// // end


// /** PATCH /cats/[id] - update cat; return `{cat: cat}` */

// describe("PATCH /cats/:id", function () {
//   test("Update a single cat", async function () {
//     const resp = await request(app)
//         .patch(`/cats/${testCat.id}`)
//         .send({ name: "Troll" });
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({
//       cat: { id: testCat.id, name: "Troll" },
//     });
//   });

//   test("Respond with 404 if nout found", async function () {
//     const resp = await request(app).patch(`/cats/0`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
// // end


// /** DELETE /cats/[id] - delete cat,
//  *  return `{message: "Cat deleted"}` */

// describe("DELETE /cats/:id", function () {
//   test("Delete single a cat", async function () {
//     const resp = await request(app)
//         .delete(`/cats/${testCat.id}`);
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({ message: "Cat deleted" });
//   });
// });
// // end


afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});

