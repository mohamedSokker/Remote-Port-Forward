1- The Server Has sshd Running is 192.168.1.7
2- The Target  PC has VNC Server is 192.168.1.5
3- First By using ForwardIn it makes the Server(192.168.1.7) Listen at port ${localPort} and forward any tcp connection to 192.168.1.5 
4- Whe Can listen the tcp connection on PC(192.168.1.5) by the event on("tcp connection")
5- Then we Create a Connection between PC(192.168.1.5) and its Target Server eg (VNC Server with Port 5900) 
6- Then We Pipe its Stream by the stream from tcp connection and pipe it back to Us
