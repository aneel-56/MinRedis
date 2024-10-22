const net = require("net");
const fs = require("fs");
console.log("Logs from your program will appear here!");

const store = new Map();
const arguments = new Map();

const server = net.createServer((connection) => {
  arguments.set(process.argv[1], process.argv[2]);
  arguments.set(process.argv[3], process.argv[4]);
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    // const [, , dir, path, dbfilename, file] = process.argv;
    // console.log([dir, path, dbfilename, file]);
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
    if(commands[2] === "config" && commands[3] === "GET"){
      return `*2\r\n$${arguments.size}\r\n${arguments.get(dir)}\r\n${argumnets.get(dbfileName)\r\n}`
    }

    if (commands[2] === "PING") connection.write("+PONG\r\n");
  });
});

server.listen(6379, "127.0.0.1");
