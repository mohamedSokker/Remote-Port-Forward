const Client = require("ssh2").Client;
const fs = require("fs");

const sshConfig = {
  host: "192.168.1.7",
  port: 22,
  username: "osama",
  privateKey: fs.readFileSync("/sdcard/shareit/id_rsa"),
};

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
        conn.forwardOut(
          info.srcIP,
          info.srcPort,
          remoteAddress,
          remotePort,
          (err, channel) => {
            if (err) {
              console.error("Error forwarding connection:", err);
              return reject();
            }

            channel.pipe(stream).pipe(channel);
          }
        );
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
  addTcpConnection(8000, "192.168.1.5", 5900);
} catch (err) {
  console.log(`addTcpConnection1 Error: ${err.message}`);
}

try {
  addTcpConnection(9000, "192.168.1.5", 22);
} catch (err) {
  console.log(`addTcpConnection2 Error: ${err.message}`);
}
