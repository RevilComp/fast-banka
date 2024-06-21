const { sendCallBack } = require("../controllers/general");

module.exports = socketUpdate = (socket) =>
  socket.on("disconnecting", async (reason) => {
    const params = global.connections.find(
      (item) => item.socketId === socket.id,
    );
    global.connections = global.connections.filter(
      (e) => e.socketId != socket.id,
    );
    // console.log("disconnecting", global.connections);
    // if (params) {
    //     if (params.callback) {
    //         await sendCallBack({
    //             url: params.callback,
    //             type: params.type,
    //             user_id: params.user_id,
    //             user_name_surname: params.nameSurname,
    //             hash: params.hash,
    //             transaction_id: params.transaction_id,
    //             amount: params.amount,
    //             status: "fail",
    //             transactionUid: null,
    //             message: "User is disconnected from URL"
    //         })
    //     }
    // }
  });
