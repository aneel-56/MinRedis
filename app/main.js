const net = require("net");
console.log("Logs from your program will appear here!");

const store = new Map();
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    if (commands[0] === "SET") {
      store.set(commands[1], commands[2]);
      connection.write("+OK\r\n"); // Redis protocol for success
    }

    if (commands[0] === "GET") {
      connection.write(
        "$" + store.size + "\r\n" + store.get(commands[1]) + "\r\n"
      );
    } else {
      connection.write("+PONG\r\n");
    }

    // *2\r\n $5 \r\n ECHO \r\n $3 \r\n hey \r\n
    // if (commands[2] == "ECHO") {
    //   const str = commands[4];
    //   const l = str.length;
    //   return connection.write("$" + l + "\r\n" + str + "\r\n");
    // }
  });
});
//
server.listen(6379, "127.0.0.1");
