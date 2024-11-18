const net = require("net");
const fs = require("fs");
const path = require("path");
const { getKeyValues } = require("./rdbKey/rdbParser.js");
// console.log("Logs from your program will appear here!");

const dataStore = new Map(); // Store for configuration and other data
let rdb;

// Parse command-line arguments for --dir and --dbfilename
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");

    let dir = null;
    let dbfilename = null;
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--dir") {
        dir = args[i + 1];
      } else if (args[i] === "--dbfilename") {
        dbfilename = args[i + 1];
      }
    }
    if (dir && dbfilename) {
      dataStore.set("dir", dir);
      dataStore.set("dbfilename", dbfilename);
      const rdbFilePath = path.join(
        dataStore.get("dir"),
        dataStore.get("dbfilename")
      );

      try {
        rdb = fs.readFileSync(rdbFilePath);
        if (rdb) {
          const keyValues = getKeyValues(rdb);
          keyValues.forEach(([key, value]) => {
            dataStore.set(key, value); // Add each key-value pair to dataStore
          });
        }
        console.log(Buffer.from(rdb));
      } catch (err) {
        console.log("Error reading RDB file:", err.message);
      }
    }

    if (commands[2] === "SET") {
      connection.write("+OK\r\n"); // Redis protocol for success
      dataStore.set(commands[4], commands[6]);
      if (commands[10]) {
        setTimeout(() => {
          dataStore.delete(commands[4]);
        }, commands[10]);
      }
    }

    if (commands[2] === "GET") {
      const res = dataStore.get(commands[4]);
      if (res) {
        // Respond with bulk string if key exists
        connection.write("$" + res.length + "\r\n" + res + "\r\n");
      } else {
        // Respond with null bulk string if key does not exist
        connection.write("$-1\r\n");
      }
    }

    // *2\r\n $5 \r\n ECHO \r\n $3 \r\n hey \r\n
    if (commands[2] === "ECHO") {
      const str = commands[4];
      const l = str.length;
      return connection.write("$" + l + "\r\n" + str + "\r\n");
    }

    if (commands[2] === "CONFIG") {
      const value = commands[6];
      let result = dataStore.get(value);
      const responseArr = [
        `$${value.length}\r\n${value}\r\n`,
        `$${result.length}\r\n${result}\r\n`,
      ];
      const redisResponse = `*${responseArr.length}\r\n${responseArr.join("")}`;
      connection.write(redisResponse);
    }

    if (commands[2] === "KEYS") {
      // const redis_key = getKeyValues(rdb);
      const [redisKey, redisValue] = getKeyValues(rdb);
      const keys = [redisKey];
      console.log(keys);
      let response = `*${keys.length}\r\n`;
      keys.forEach((key) => {
        response += `$${key.length}\r\n${key}\r\n`;
      });
      connection.write(response);

      if (commands[2] === "KEYS" && commands[4] === "*") {
        console.log("******** Handling KEYS * Command ********");

        // Get all keys, excluding config entries
        console.log("**Actual Array");

        const keys = Array.from(dataStore.keys()).filter(
          (key) => key !== "dir" && key !== "dbfilename"
        );

        let response = `*${keys.length}\r\n`;
        keys.forEach((key) => {
          response += `$${key.length}\r\n${key}\r\n`; // Each key is its own bulk string
          console.log("Keys");
          console.log(keys);
        });

        console.log("KEYS * Response:", response);
        connection.write(response);
      }
    }

    if (commands[2] === "PING") connection.write("+PONG\r\n");
  });
});

server.listen(6379, "127.0.0.1");
