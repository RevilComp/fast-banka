const cron = require("node-cron");
const Users = require("../schemas/users");
// @ts-ignore
const logger = require("pino")();
class WebsiteUsers {
  constructor() {
    this.websiteUsers = [];
    cron.schedule("*/5 * * * *", () => {
      this.refreshWebsiteUsers();
    });
  }
  getUsers() {
    return this.websiteUsers || [];
  }
  async refreshWebsiteUsers() {
    const users = await Users.find({ type: "website" }).lean();
    if (!users) {
      logger.error("Website users not found");
      return [];
    }
    this.websiteUsers = users;
    return users;
  }
}
module.exports = new WebsiteUsers();
