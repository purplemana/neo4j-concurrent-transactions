const neo4j = require("neo4j-driver");

async function test() {
  const driver = neo4j.v1.driver(
    "bolt://localhost:6687",
    neo4j.v1.auth.basic("api-server-test", "api-server-test"),
    {
      logging: {
        level: "info",
        logger: (level, message) => console.log(level + " " + message),
      },
    }
  );

  const sessionOne = driver.session();
  const sessionTwo = driver.session();

  const transactionOne = sessionOne.beginTransaction();
  const transactionTwo = sessionTwo.beginTransaction();

  try {
    console.log("This executes :)");
    await transactionOne.run(`MERGE (n:TestNode {id: $id}) RETURN n`, {id: "1"});
    console.log("Yep! :)");

    // Removing `return n` from the above query somehow doesn't hang the code.
    // console.log("This executes too :?");
    // await transactionOne.run(`MERGE (n:TestNode {id: $id})`, { id: "1" });

    console.log("This doesn't :(");
    console.log(
      "And it also hangs the Neo4j server :((. Kill this process with `Ctrl+C` or `Cmd+.`"
    );

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
