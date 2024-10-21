const net = require("net");
console.log("Logs from your program will appear here!");

const store = {};
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    if (commands[0] === "SET") {
      const key = commands[1];
      const value = commands[2];
      store[key] = value; // Store the key-value pair
      connection.write("+OK\r\n"); // Redis protocol for success
    }

    if (commands[0] === "GET") {
      const key = commands[1];
      const value = store[key]; // Retrieve the value from the store

      if (value) {
        const l = value.length;
        connection.write("$" + l + "\r\n" + value + "\r\n");
      } else {
        connection.write("+PONG\r\n");
      }
    }

    // *2\r\n $5 \r\n ECHO \r\n $3 \r\n hey \r\n
    if (commands[2] == "ECHO") {
      const str = commands[4];
      const l = str.length;
      return connection.write("$" + l + "\r\n" + str + "\r\n");
    }
  });
});
//
server.listen(6379, "127.0.0.1");
