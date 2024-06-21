const Players = require("../schemas/players");
const BannedPlayers = require("../schemas/bannedplayers");
const { checkLogin, websiteCodeHandler } = require("./general");

const savePlayer = async ({ nameSurname, user_id, webSiteCode, website }) => {
  try {
    const newUser = new Players({
      nameSurname,
      user_id,
      website,
      webSiteCode,
    });
    await newUser.save();
  } catch (e) {
    console.log(e);
  }
};

const isPlayerBanned = async ({ nameSurname, user_id, webSiteCode }) => {
  const isExist = await BannedPlayers.findOne({
    nameSurname,
    user_id,
    // webSiteCode,
  });
  if (isExist) {
    return true;
  }
  return false;
};

const findPlayer = async ({ nameSurname, user_id, webSiteCode }) => {
  const isExist = await Players.findOne({ nameSurname, user_id, webSiteCode });
  return isExist ? true : false;
};

const handlePlayerTransactions = async (playerObj) => {
  try {
    if (!playerObj?.user_id) {
      console.log("user id yok", playerObj);
      return { isBanned: false };
    }
    const player = await findPlayer(playerObj);
    if (!player) {
      await savePlayer(playerObj);
    } else {
      const isBanned = await isPlayerBanned(playerObj);
      return { isBanned };
    }

    return { isBanned: false };
  } catch (e) {
    console.log(e);
    return { isBanned: false };
  }
};

const getPlayers = async (req, res) => {
  const {search} = req.body;

  if (!(await checkLogin(req, res))) {
    return res.status(500).send({status: "fail", message: "Lütfen giriş yapınız"});
  }

  const skip = isNaN(Number(req?.body?.skip)) ? 0 : Number(req?.body?.skip);
  const limit = isNaN(Number(req?.body?.limit))
    ? 100000000
    : Number(req?.body?.limit);

  let queryObject = {
    ...(search
      ? { nameSurname: { $regex: req.body.search, $options: "i" } }
      : undefined)
  }
  console.log("Filter", queryObject);
  const players = await Players.find(queryObject)
    .sort({ createdAt: -1 })
    .skip(skip || 0)
    .limit(limit)
    .lean();
  for await (const player of players) {
    player.isBanned = await isPlayerBanned(player);
    player.webSiteCode = await websiteCodeHandler(player.website);
  }
  res.send(players);
};

const getBannedPlayers = async (req, res) => {
  const filter = req.body?.filter || {};
  if (!(await checkLogin(req, res))) {
    return res.status(500).send({status: "fail", message: "Lütfen giriş yapınız"});
  }

  const bannedPlayers = await BannedPlayers.find(filter);
  res.send(bannedPlayers);
};

const banPlayer = async (req, res) => {
  const playerId = req.body?.playerId;
  if (!playerId) return res.status(500).send("player id fail");
  if (!(await checkLogin(req, res))) {
    return res.status(500).send("fail");
  }
  const player = await Players.findOne({ _id: playerId });
  const user = await checkLogin(req, res);

  const bannedPlayer = new BannedPlayers({
    user_id: player?.user_id,
    nameSurname: player?.nameSurname,
    playerId: playerId,
    doneBy: user?._id,
  });
  await bannedPlayer.save();
  res.send({status: "success", message: "Kullanıcı başarıyla banlandı"});
};

module.exports = {
  savePlayer,
  isPlayerBanned,
  handlePlayerTransactions,
  findPlayer,
  getPlayers,
  getBannedPlayers,
  banPlayer,
};
