const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    if (commands[2] === "ECHO") {
      process.stdout.write(commands[4]);
      connection.write(commands[4]);
    }
    console.log(commands);
    connection.write("+PONG\r\n");
  });
});
//
server.listen(4492, "127.0.0.1");
