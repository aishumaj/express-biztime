"use strict";

/** Routes about invoices. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns `{invoices: [{id, comp_code}, ...]}
` */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    "SELECT id, comp_code FROM invoices ORDER BY id");
  const invoices = results.rows;

  return res.json({ invoices });
});


/** GET /[id] - return data about one invoice:
 *  `{invoice: {id, amt, paid, add_date, paid_date,
 *      company: {code, name, description}}

` */

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const invoices = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id = $1`,
    [id]
  );
  const invoice = invoices.rows[0];

  if (!invoice) throw new NotFoundError(`No matching company: ${id}`);

  const compCode = invoice.comp_code;
  const companies = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1",
    [compCode]
  );
  const company = companies.rows[0];

  delete invoice.comp_code;
  invoice.company = company;


  return res.json({ invoice });
});


/** POST / - create invoice from data input { comp_code, amt };
 * return `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

router.post("/", async function (req, res, next) {
  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);
  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
});


/** PUT /[id] - update fields in existing invoice
 *  with input { amt };
 *  return `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

router.patch("/:id", async function (req, res, next) {
  if ("id" in req.body) throw new BadRequestError("ID must be a URL parameter."
  );

  const id = req.params.id;
  const amt = req.body.amt;

  const results = await db.query(
    `UPDATE invoices
         SET amt=$1
         WHERE id = $2
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ invoice });
});


/** DELETE /[id] - delete invoice, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  const results = await db.query(
    "DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ status: "deleted" });
});


module.exports = router;
