const Client = require("ssh2").Client;
const fs = require("fs");
const net = require("net");

const sshConfig = {
  host: "192.168.1.7",
  port: 22,
  username: "osama",
  privateKey: fs.readFileSync("C:/users/sokker/.ssh/id_rsa"),
};

const screenIP = "192.168.1.5";

const addTcpConnection = async (localPort, remoteAddress, remotePort) => {
  try {
    const localAddress = "127.0.0.1";

    const conn = new Client();

    conn.on("ready", () => {
      console.log("SSH connection established. Creating tunnel...");

      conn.forwardIn(localAddress, localPort, (err) => {
        if (err) {
          console.error("Error creating tunnel:", err);
          conn.end();
        }

        console.log(
          `Tunnel established: ${localAddress}:${localPort} -> ${remoteAddress}:${remotePort}`
        );
      });

      conn.on("close", () => {
        console.log("connection closed");
      });

      conn.on("end", () => {
        console.log("connection ended");
      });

      conn.on("error", (err) => {
        console.log(`connection error: ${err.message}`);
      });
    });

    conn.on("tcp connection", (info, accept, reject) => {
      const stream = accept();
      console.log(info);
      try {
        const channel = net.createConnection(
          { host: screenIP, port: remotePort },
          () => {
            console.log("Server connected");
            channel.pipe(stream).pipe(channel);
          }
        );

        channel.on("close", () => {
          console.log(`Server closed`);
        });
        channel.on("end", () => {
          console.log(`Server Ended`);
        });
        channel.on("error", (err) => {
          console.log(`Server Error: ${err.message}`);
        });
      } catch (err) {
        console.log(`forward Error: ${err.message}`);
      }
    });

    conn.on("close", () => {
      console.log(`SSH Tunnel Closed`);
    });

    conn.on("error", (err) => {
      console.log(`tunnel error: ${err.message}`);
      setTimeout(() => {
        addTcpConnection(localPort, remoteAddress, remotePort);
      }, 5000);
    });

    conn.connect(sshConfig);
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

try {
  addTcpConnection(8000, screenIP, 5900);
} catch (err) {
  console.log(`addTcpConnection1 Error: ${err.message}`);
}

try {
  addTcpConnection(9000, screenIP, 22);
} catch (err) {
  console.log(`addTcpConnection2 Error: ${err.message}`);
}
