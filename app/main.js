const net = require("net");
const fs = require("fs");
console.log("Logs from your program will appear here!");

const store = new Map();
const dataStore = new Map(); // Store for configuration and other data

// Parse command-line arguments for --dir and --dbfilename
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    const [, , dir, path, dbfilename, file] = process.argv;

    if (commands[2] === "SET") {
      connection.write("+OK\r\n"); // Redis protocol for success
      store.set(commands[4], commands[6]);
      if (commands[10]) {
        setTimeout(() => {
          store.delete(commands[4]);
        }, commands[10]);
      }
    }

    if (commands[2] === "GET") {
      const res = store.get(commands[4]);
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
      dataStore.set("dir", path);
      dataStore.set("dbfilename", file);
      let result = dataStore.get(value);
      const responseArr = [
        `$${value.length}\r\n${value}\r\n`,
        `$${result.length}\r\n${result}\r\n`,
      ];
      const redisResponse = `*${responseArr.length}\r\n${responseArr.join("")}`;
      connection.write(redisResponse);
    }
    if (commands[2] === "PING") connection.write("+PONG\r\n");
  });
});

server.listen(6379, "127.0.0.1");
