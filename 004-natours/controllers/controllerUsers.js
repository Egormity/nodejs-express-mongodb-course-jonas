const ModelUser = require("../models/modelUser");

const HandlerFactory = require("./handlerFactory");

//
exports.getUsers = HandlerFactory.getAll({ Model: ModelUser });
exports.getUser = HandlerFactory.getOne({ Model: ModelUser });
exports.postUser = HandlerFactory.postOne({ Model: ModelUser });
exports.patchUser = HandlerFactory.patchOne({ Model: ModelUser });
exports.deleteUser = HandlerFactory.deleteOne({ Model: ModelUser });
