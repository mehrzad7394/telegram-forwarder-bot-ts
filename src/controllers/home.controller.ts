const createError = require("../utils/createError.js");
const User = require("../models/user.model.js");

const getDetail = async (req, res, next) => {
  try {
    let user = await User.findOne(
      { token: req.headers["token"] },
      { token: false, password: false }
    );
    return res.status(200).json(user);
  } catch (error) {
    next(createError(400, error));
  }
};

module.exports = { getDetail };
