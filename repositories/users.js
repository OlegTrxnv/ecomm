//const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);
class UsersRepository extends Repository {
  async comparePasswords(saved, entered) {
    //saved: in repo - hashed password with salt, entered:password by attempted user
    const [hashed, salt] = saved.split(".");
    const hashedEnteredBuffer = await scrypt(entered, salt, 64);

    return hashed === hashedEnteredBuffer.toString("hex");
  }
  async create(attrs) {
    attrs.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");
    const buffer = await scrypt(attrs.password, salt, 64);

    const records = await this.getAll();
    const record = {
      ...attrs,
      password: `${buffer.toString("hex")}.${salt}`
      //{hashed password & salt}.{salt}
    };

    records.push(record);
    await this.writeAll(records);
    return record;
  }

}

// Exporting instance of the class, we only need one!
module.exports = new UsersRepository("users.json");
