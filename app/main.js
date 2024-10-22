const net = require("net");
console.log("Logs from your program will appear here!");

const store = new Map();
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const commands = Buffer.from(data).toString().split("\r\n");
    console.log(commands);

    if (commands[0] === "--dir") {
      console.log(commands[0]);
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
    if (commands[2] == "ECHO") {
      const str = commands[4];
      const l = str.length;
      return connection.write("$" + l + "\r\n" + str + "\r\n");
    }

    if (commands[2] === "config") {
      store.set("dir", path);
      store.set("dbfilename", file);
      let result = store.get(value);
    }
    if (commands[2] === "PING") connection.write("+PONG\r\n");
  });
});
//
server.listen(6379, "127.0.0.1");
