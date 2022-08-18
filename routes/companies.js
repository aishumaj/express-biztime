"use strict";

/** Routes about companies. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET / - returns `{companies: [{code, name}, ...]}
` */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name FROM companies ORDER BY code`
  );
  const companies = results.rows;

  return res.json({ companies });
});

/** GET /[code] - return data about one company:
 *  `{company: {code, name, description, invoices: [id,...]}}` */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1",
    [code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  const invoices = await db.query(
    "SELECT id FROM invoices WHERE comp_code = $1", [code]
  );

  company.invoices = invoices.rows.map(r => r.id);

  return res.json({ company });
});

/** POST / - create company from data;
 * return `{company: {code, name, description}}` */

router.post("/", async function (req, res, next) {
  //add destructure from req.body
  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [code, name, description]
  );
  const company = results.rows[0];

  return res.status(201).json({ company });
});

/** PUT /[code] - update fields in existing company;
 *  return `{company: {code, name, description}}` */

router.put("/:code", async function (req, res, next) {
  //find my backticks
  if ("code" in req.body)
    throw new BadRequestError("Company code must be passed in URL");

  const { name, description } = req.body;
  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
         SET name=$1,
          description = $2
         WHERE code = $3
         RETURNING code, name, description`,
    [name, description, code]
  );
  const company = results.rows[0];
  
  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});

/** DELETE /[code] - delete company, return `{status: "deleted"}` */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code",
    [code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ status: "deleted" });
});

module.exports = router;
