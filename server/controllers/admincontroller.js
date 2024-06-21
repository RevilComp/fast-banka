const { checkLogin, checkPermission } = require("./general");
const Users = require("../schemas/users");
const { PERMISSIONS } = require("../consts/Permissions");
const { USER_TYPES } = require("../consts/UserTypes");
const addUser = async (req, res) => {
  const {
    email,
    hash,
    firstName,
    lastName,
    type,
    title,
    office,
    tel,
    permissions,
    parentAccount,
  } = req.body;
  const getUser = await checkLogin(req);
  if (
    getUser.type === USER_TYPES.admin ||
    getUser.type === USER_TYPES.super_admin ||
    checkPermission(false, getUser.permissions, PERMISSIONS.USER_MANAGEMENT.key)
  ) {
    const newUser = await new Users({
      email,
      hash,
      firstName,
      lastName,
      type,
      title,
      office,
      tel,
      permissions,
      parentAccount,
    }).save();
    return res.send({ status: "ok" });
  }

  return res.send({
    status: "fail",
    message: "Sadece adminler kullanıcı ekleyebilir",
  });
};

module.exports = {
  addUser,
};
