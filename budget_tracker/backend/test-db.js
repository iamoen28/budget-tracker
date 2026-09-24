const pool = require("./db");

async function testDatabase() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS user,
        NOW() AS time
    `);

    console.log("DATABASE CONNECTION SUCCESSFUL");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testDatabase();