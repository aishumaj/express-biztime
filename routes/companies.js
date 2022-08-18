/** Routes about companies. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns `{companies: [{code, name}, ...]}
` */

router.get("/", async function (req, res, next) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});


/** GET /[code] - return data about one company: 
 *  `{company: {code, name, description}}` */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});


/** POST / - create company from data; 
 * return `{company: {code, name, description}}` */

router.post("/", async function (req, res, next) {
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]);
  const company = results.rows[0];

  return res.status(201).json({ company });
});


// /** PATCH /[code] - update fields in cat; return `{cat: cat}` */

// router.patch("/:code", async function (req, res, next) {
//   if ("code" in req.body) throw new BadRequestError("Not allowed");

//   const code = req.params.code;
//   const results = await db.query(
//     `UPDATE cats
//          SET name=$1
//          WHERE code = $2
//          RETURNING code, name`,
//     [req.body.name, code]);
//   const cat = results.rows[0];

//   if (!cat) throw new NotFoundError(`No matching cat: ${code}`);
//   return res.json({ cat });
// });


// /** DELETE /[code] - delete cat, return `{message: "Cat deleted"}` */

// router.delete("/:code", async function (req, res, next) {
//   const code = req.params.code;
//   const results = await db.query(
//     "DELETE FROM cats WHERE code = $1 RETURNING code", [code]);
//   const cat = results.rows[0];

//   if (!cat) throw new NotFoundError(`No matching cat: ${code}`);
//   return res.json({ message: "Cat deleted" });
// });


module.exports = router;
