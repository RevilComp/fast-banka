const express = require("express");
const route = express.Router();

const {
  websiteUsers,
  getUsers,
  addUser,
  deleteUser,
  connectRemote,
  updateAdmin,
  getUserBalance,
  getMutabakat,
  getSuperAdminMutabakat,
  getWebsiteMutabakat,
  setNotification,
  set2fa,
  remove2fa,
  listUsersByPool,
  searchUsers,
  changeWebsiteActive,
  createWebsiteUser,
  deleteWebsiteUser,
  editWebsiteUser,
} = require("../controllers/users");

route.get("/", async (req, res) => {
  await getUsers(req, res);
});

route.get("/website-users", async (req, res) => {
  await websiteUsers(req, res);
});

route.get("/mutabakat", async (req, res) => {
  await getMutabakat(req, res);
});

route.get("/mutabakat-website", async (req, res) => {
  await getWebsiteMutabakat(req, res);
});

route.get("/super-admin-mutabakat", async (req, res) => {
  await getSuperAdminMutabakat(req, res);
});

route.get("/profile", async (req, res) => {
  await getUsers(req, res);
});

route.get("/balance", async (req, res) => {
  await getUserBalance(req, res);
});

route.get("/connectremote", async (req, res) => {
  await connectRemote(req, res);
});

route.get("/search/:username", async (req, res) => {
  await searchUsers(req, res);
});

route.post("/createuser", async (req, res) => {
  await addUser(req, res);
});

route.post("/delete", async (req, res) => {
  await deleteUser(req, res);
});

route.post("/updateAdmin", async (req, res) => {
  await updateAdmin(req, res);
});

route.post("/set-notification", async (req, res) => {
  await setNotification(req, res);
});

route.post("/set-2fa", async (req, res) => {
  await set2fa(req, res);
});

route.post("/remove-2fa", async (req, res) => {
  await remove2fa(req, res);
});

route.get("/get-by-pool", async (req, res) => {
  await listUsersByPool(req, res);
});

route.post("/create-website-user", async (req, res) => {
  await createWebsiteUser(req, res);
});

route.post("/delete-website-user", async (req, res) => {
  await deleteWebsiteUser(req, res);
});

route.post("/edit-website-user", async (req, res) => {
  await editWebsiteUser(req, res);
});

route.post("/change-website-active", async (req, res) => {
  await changeWebsiteActive(req, res);
});


module.exports = route;
