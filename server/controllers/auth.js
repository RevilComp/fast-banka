const speakeasy = require("speakeasy");
const Users = require("../schemas/users");

const bcrypt = require("bcryptjs");
const config = require("../config");
var jwt = require("jsonwebtoken");

const createJWT = (user) => {
  var JWT = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      type: user.type,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    config.privateKey
  );
  return JWT;
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(202).send({ message: "Log Outed Successfully!" });
  } catch (e) {
    res.send("ok");
  }
};

const login = async (req, res) => {
  let { username, password, gaCode } = req.body;

  username = username.trim();
  let findUser = await Users.findOne({ username });

  if (findUser) {
    if (findUser?.secret) {
      const verified = speakeasy.totp.verify({
        secret: findUser.secret,
        encoding: "base32",
        token: gaCode,
      });
      if (!verified) {
        return res.send({
          status: "fail",
          message: "GA doğrulama kodu geçersiz. Loglandı.",
        });
      }
    }

    const comparePassword = await bcrypt.compare(password, findUser.hash);
    const token = createJWT(findUser);
    if (comparePassword) {
      await Users.findByIdAndUpdate(findUser._id, {
        lastLoginDate: new Date(),
      });
      res.cookie("token", token); // set token to the cookie
      delete findUser.hash;
      res
        .status(200)
        .send({ status: "success", token: token, profile: findUser });
    }

    // else {
    //   // new errorHandler(res, 500, 13)
    //   res.send({ status: "fail", message: "Kullanıcı adı veya şifre hatalı." });
    // }
  }

  //   else {
  //     // new errorHandler(res, 404, 13)
  //     res.send({ status: "fail", message: "Kullanıcı adı kayıtlı değil." });
  //   }

  // * More secure
  return res.send({
    status: "fail",
    message: "Kullanıcı adı veya şifre hatalı.",
  });
};

module.exports = {
  login,
  logOut,
};
