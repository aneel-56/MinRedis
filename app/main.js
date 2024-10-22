const net = require("net");
const fs = require("fs");
console.log("Logs from your program will appear here!");

const store = new Map();
const arguments = new Map();

const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    const [fileDir, fileName] = [
      process.argv[1] ? process.argv[2] : null,
      process.argv[3] ? process.argv[4] : null,
    ];
    if (fileName && fileDir) {
      arguments.set("dir", fileDir);
      arguments.set("dbfilName", fileName);
    }

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
    if (commands[2] === "CONFIG" && commands[4] === "GET") {
      const param = commands[4]; // The parameter being requested, either "dir" or "dbfilename"

      // Check if the requested parameter exists in the Map
      if (arguments.has(param)) {
        const value = arguments.get(param);

        // Construct RESP array with the parameter and its value
        const res = `*2\r\n$${param.length}\r\n${param}\r\n$${value.length}\r\n${value}\r\n`;
        connection.write(res);
      } else {
        connection.write("$-1\r\n"); // If parameter not found
      }
    } else connection.write("+PONG\r\n");
  });
});

server.listen(6379, "127.0.0.1");
