const Song=require("../model/songModel");
const factory=require("./factoryHandler");
exports.addSong=factory.createOne(Song);
exports.getAllSong=factory.getAll(Song);
exports.getOneSong=factory.getOne(Song);
exports.updateSongInfo=factory.updateOne(Song);
exports.deleteSong=factory.deleteOne(Song)
