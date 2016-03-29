var mongo = require('mongodb').MongoClient;

module.exports = function Database(callback) {
  var self = this;

  mongo.connect(process.env.MONGO_URI, function(err, db) {
    if (err) return console.log(err);
    self.collection = db.collection(process.env.MONGO_COLLECTION);
    callback();
  });

  this.latestURI = function(cb) {
    self.collection.find().sort({ $natural : -1 }).limit(3).toArray(function(err, data) {
      if (err) return cb(err);
      cb(null, data);
    });
  }

  this.findURI = function(uid, cb) {
    uid = Number(uid);
    self.collection.findOne({uid : uid}, function(err, data) {
      if (err) return cb(err);

      if (data === null) {
        return cb('');
      }
      cb(null, decodeURIComponent(data.url));
    });
  }


  this.insertURI = function(url, cb) {
    url = encodeURIComponent(url);

    self.collection.findOne({url : url}, function(err, data) {
      if (err) return cb(err);

      if (data !== null) {
          cb(null, data.uid);
      } else {
          self.collection.count(function(err, len) {
            if (err) return cb(err);
            self.collection.insert({
                url : url,
                uid : len
              }, function(err) {
                if (err) return cb(err);
                cb(null, len);
              });
        });
     }
    });
  }

  return this;
}
