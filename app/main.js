const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    if (commands[2] == "ECHO") {
      const res = commands[4];
      const len = res.length;
      //   process.stdout.write(commands[4]);
      connection.write("$" + len + "\r\n" + res + "\r\n");
    }
    // console.log(commands);
    // connection.write("+PONG\r\n");
  });
});
//
server.listen(6379, "127.0.0.1");
