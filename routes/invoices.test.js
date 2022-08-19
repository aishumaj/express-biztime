// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");

  let cResult = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test1', 'Test Company 1', 'This is a test')
    RETURNING code, name, description`);
  testCompany = cResult.rows[0];

  let iResult = await db.query(`
    INSERT INTO invoices(comp_code, amt, add_date)
    VALUES('test1', 500, '2022-08-18')
    RETURNING id, comp_code, amt, paid, add_date, paid_date`);
  testInvoice = iResult.rows[0];
});

/** GET /invoices - returns `{invoices: [{id, comp_code}, ...]}` */

describe("GET /invoices", function () {
  test("Gets a list of 1 invoice", async function () {
    const resp = await request(app).get(`/invoices`);
    expect(resp.body).toEqual({
      invoices:  [{id: testInvoice.id, comp_code: testInvoice.comp_code}]
    });
  });
});
// end

/** GET /invoices/[id] - return data about one invoice:
 * `{invoice: {id, amt, paid, add_date, paid_date,
 * company: {code, name, description}}` */

describe("GET /invoices/:id", function () {
  test("Gets single invoice", async function () {
    const resp = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(resp.body).toEqual({ invoice: {
      id: testInvoice.id,
        amt: testInvoice.amt,
        paid: testInvoice.paid,
        add_date: '2022-08-18T07:00:00.000Z',
        paid_date: null,
        company: testCompany
    } });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).get(`/invoices/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

// end

/** POST /invoices - create invoice from data input {comp_code, amt};
 * return `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

describe("POST /invoices", function () {
  const invoice2= {
    comp_code:"test1",
    amt: 200,
    add_date: "2022-08-18"
  };

  test("Create new invoice", async function () {
    const resp = await request(app).post(`/invoices`).send(invoice2);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ invoice: {
      id: expect.any(Number),
      comp_code: "test1",
      amt: "200.00",
      paid: false,
      add_date: "2022-08-18T07:00:00.000Z",
      paid_date: null
    } });
  });
});
// end

/** PATCH /invoices/[id] - update invoice with input { amt };
 * return `{invoice: {id, comp_id, amt, paid, add_date, paid_date}}` */

describe("PATCH /invoices/:id", function () {
  test("Update a single invoice", async function () {
    const resp = await request(app)
      .patch(`/invoices/${testInvoice.id}`)
      .send({ amt: 1000 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      invoice: {
        id: testInvoice.id,
        comp_code: "test1",
        amt: "1000.00",
        paid: false,
        add_date: "2022-08-18T07:00:00.000Z",
        paid_date: null
      },
    });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).patch(`/invoices/0`).send({amt:1000});
    expect(resp.statusCode).toEqual(404);
  });
});
// end

/** DELETE /invoices/[id] - delete invoice,
 *  return `{status: "deleted"}` */

describe("DELETE /invoices/:id", function () {
  test("Delete a single company", async function () {
    const resp = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ status: "deleted" });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).delete(`/invoices/0`);
    expect(resp.statusCode).toEqual(404);
  });
});
// // end

afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});
