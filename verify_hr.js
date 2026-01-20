/**
 * MongoDB Auto-Grader for HR Management Lab (5 Parts)
 * Checks: Create, Read, Update, Advanced Queries, Delete & Final Reset
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "hrDB";
const SUBMISSION_FILE = "solution_hr.mongodb";

async function verify() {
  let score = 0;
  const report = [];

  // 1. READ STUDENT FILE FOR STATIC ANALYSIS
  let fileContent = "";
  try {
    fileContent = fs.readFileSync(SUBMISSION_FILE, "utf8");
  } catch (err) {
    console.error("CRITICAL: solution_hr.mongodb not found!");
    process.exit(1);
  }

  // Helper to check regex matches in code
  const hasCommand = (pattern) => new RegExp(pattern).test(fileContent);

  /* -------------------------------------------------
     PART 1: CREATE (15 Points)
  ------------------------------------------------- */
  if (hasCommand("db.employees.insertOne") && hasCommand("db.employees.insertMany")) {
    score += 15;
    report.push("Part 1 (Create): PASS");
  } else {
    report.push("Part 1 (Create): FAIL (Missing insertOne or insertMany)");
  }

  /* -------------------------------------------------
     PART 2: READ (10 Points)
  ------------------------------------------------- */
  if (hasCommand("db.employees.find") && hasCommand("salary") && hasCommand("department")) {
    score += 10;
    report.push("Part 2 (Read): PASS");
  } else {
    report.push("Part 2 (Read): FAIL (Missing find or required fields)");
  }

  /* -------------------------------------------------
     PART 3: UPDATE (15 Points)
  ------------------------------------------------- */
  if (hasCommand("updateOne") && hasCommand("updateMany") && hasCommand("replaceOne")) {
    score += 15;
    report.push("Part 3 (Update): PASS");
  } else {
    report.push("Part 3 (Update): FAIL (Missing updateOne, updateMany, or replaceOne)");
  }

  /* -------------------------------------------------
     PART 4: ADVANCED QUERIES (15 Points)
  ------------------------------------------------- */
  // Checks for logical operators: $in, $and, $ne
  // We escape the $ for regex matching
  const hasIn = hasCommand("\\$in");
  const hasAnd = hasCommand("\\$and");
  const hasNe = hasCommand("\\$ne");

  if (hasIn && hasAnd && hasNe) {
    score += 15;
    report.push("Part 4 (Advanced): PASS ($in, $and, $ne found)");
  } else {
    report.push(`Part 4 (Advanced): FAIL (Missing operators: ${!hasIn?'$in ':''}${!hasAnd?'$and ':''}${!hasNe?'$ne':''})`);
  }

  /* -------------------------------------------------
     PART 5: DELETE & FINAL STATE (15 Points)
  ------------------------------------------------- */
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const employees = db.collection("employees");
    
    // Check code existence
    const hasDelete = hasCommand("deleteOne") && hasCommand("deleteMany");

    // Check Actual DB State (Should be 0 if System Reset ran)
    const count = await employees.countDocuments();

    if (hasDelete && count === 0) {
      score += 15;
      report.push("Part 5 (Delete): PASS (Commands found & Collection is empty)");
    } else if (count > 0) {
      report.push(`Part 5 (Delete): FAIL (Database not empty. Found ${count} docs. System Reset incomplete?)`);
    } else {
      report.push("Part 5 (Delete): FAIL (Missing delete commands)");
    }

  } catch (err) {
    report.push("DB Connection Error: " + err.message);
  } finally {
    await client.close();
  }

  /* -------------------------------------------------
     FINAL REPORT
  ------------------------------------------------- */
  console.log("========== HR Lab Auto-Grading Report ==========");
  report.forEach(r => console.log(r));
  console.log("-----------------------------------------------");
  console.log(`TOTAL SCORE: ${score} / 70`);

  // GitHub Classroom Requirement
  process.exit(score >= 50 ? 0 : 1);
}

verify();
