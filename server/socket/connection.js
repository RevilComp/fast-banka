const { checkLogin } = require("../controllers/general");

const handleSocketJoin = async (socket, params) => {
  const token = params.token;
  if (!token) {
    return socket.disconnect();
  }
  const user = await checkLogin({ cookies: { token } });
  if(!user) return socket.disconnect();
  if(user?.pool){
    socket.join(user.pool.toString());
  }
  else if(user?.type === "god"){
    socket.join("god");
  
  }

};

module.exports = socketUpdate = async (socket) => {
  if (!socket.handshake.query) return socket.disconnect();
    const params = socket.handshake.query;
    handleSocketJoin(socket, params);
};
