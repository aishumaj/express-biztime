"use strict";

/** Routes about invoices. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns `{invoices: [{id, comp_code}, ...]}
` */

router.get("/", async function (req, res, next) {
  const results = await db.query("SELECT id, comp_code FROM invoices ORDER BY id");
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
    "SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1", [id]);
    const invoice = invoices.rows[0];
    
    if (!invoice) throw new NotFoundError(`No matching company: ${code}`);
    
    const compCode = invoice.comp_code
    const companies = await db.query(
      "SELECT code, name, description FROM companies WHERE code = $1", [compCode]);
    const company = companies.rows[0];

    delete invoice.comp_code
    invoice.company = company;


  return res.json({ invoice });
});


// /** POST / - create company from data;
//  * return `{company: {code, name, description}}` */

// router.post("/", async function (req, res, next) {
//   const results = await db.query(
//     `INSERT INTO invoices (code, name, description)
//          VALUES ($1, $2, $3)
//          RETURNING code, name, description`,
//     [req.body.code, req.body.name, req.body.description]);
//   const company = results.rows[0];

//   return res.status(201).json({ company });
// });


// /** PUT /[code] - update fields in existing company;
//  *  return `{company: {code, name, description}}` */

// router.put("/:code", async function (req, res, next) {
//   if ("code" in req.body) throw new BadRequestError("Not allowed");

//   const {name, description} = req.body;
//   const results = await db.query(
//     `UPDATE invoices
//          SET name=$1,
//           description = $2
//          WHERE code = $3
//          RETURNING code, name, description`,
//     [name, description, req.params.code]);
//   const company = results.rows[0];

//   if (!company) throw new NotFoundError(`No matching company: ${code}`);
//   return res.json({ company });
// });


// /** DELETE /[code] - delete company, return `{status: "deleted"}` */

// router.delete("/:code", async function (req, res, next) {
//   const code = req.params.code;
//   const results = await db.query(
//     "DELETE FROM invoices WHERE code = $1 RETURNING code", [code]);
//   const company = results.rows[0];

//   if (!company) throw new NotFoundError(`No matching company: ${code}`);
//   return res.json({ status: "deleted" });
// });


module.exports = router;
