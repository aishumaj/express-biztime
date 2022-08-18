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
  testCompany.invoices = [];
});

/** GET /companies - returns `{companies: [{code, name}, ...]}}` */

describe("GET /companies", function () {
  test("Gets a list of 1 company", async function () {
    const resp = await request(app).get(`/companies`);
    expect(resp.body).toEqual({
      companies: [{ code: testCompany.code, name: testCompany.name }],
    });
  });
});
// end

/** GET /companies/[code] - return data about one company: `{company: company}` */

describe("GET /companies/:code", function () {
  test("Gets single company", async function () {
    const resp = await request(app).get(`/companies/${testCompany.code}`);
    expect(resp.body).toEqual({ company: testCompany });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).get(`/companies/0`);
    expect(resp.statusCode).toEqual(404);
  });
});
// // end

/** POST /companies - create company from data;
 * return `{company: {code, name, description}}` */

describe("POST /companies", function () {
  const test2 = {
    name: "Test Company 2",
    code: "test2",
    description: "Test 2 Description",
  };
  test("Create new company", async function () {
    const resp = await request(app).post(`/companies`).send(test2);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ company: test2 });
  });
});
// // end

/** PUT /companies/[code] - update company;
 * return `{company: {code, name, description}}` */

describe("PUT /companies/:code", function () {
  test("Update a single company", async function () {
    const resp = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "Troll", description: "Based under bridge" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      company: {
        code: testCompany.code,
        name: "Troll",
        description: "Based under bridge",
      },
    });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app)
    .put(`/companies/0`)
    .send({ name: "Troll", description: "Based under bridge" });
    debugger;
    expect(resp.statusCode).toEqual(404);
  });
});
// // end

/** DELETE /companies/[code] - delete company,
 *  return `{status: "deleted"}` */

describe("DELETE /companies/:code", function () {
  test("Delete a single company", async function () {
    const resp = await request(app).delete(`/companies/${testCompany.code}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ status: "deleted" });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).delete(`/companies/0`);
    expect(resp.statusCode).toEqual(404);
  });
});
// // end

afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});
