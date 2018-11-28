const neo4j = require("neo4j-driver");

async function test() {
  const driver = neo4j.v1.driver(
    "bolt://localhost:6687",
    neo4j.v1.auth.basic("api-server-test", "api-server-test")
  );

  const sessionOne = driver.session();
  const sessionTwo = driver.session();

  const transactionOne = sessionOne.beginTransaction();
  const transactionTwo = sessionTwo.beginTransaction();

  try {
    await transactionOne.run(`MERGE (n:TestNode {id: $id})`, {id: "1"});
    await transactionTwo.run(`CREATE CONSTRAINT ON (book:Book) ASSERT book.isbn IS UNIQUE`);

    await transactionOne.commit();
    await transactionTwo.commit();
  } finally {
    sessionOne.close();
    sessionTwo.close();
  }

  console.log("done!");
}

test().then(() => {
  process.exit(0);
});
