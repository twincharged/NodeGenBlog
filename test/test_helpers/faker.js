(function() {
  var Fake;

  Fake = require("faker");
  require("../../concerns/toolkit");

  module.exports = {
    publicBlog: function() {
      return {
        body: Fake.Lorem.sentences(3),
        "public": true
      };
    },
    privateBlog: function() {
      return {
        body: Fake.Lorem.sentences(3),
        "public": false
      };
    },
    comment: function() {
      return {
        body: Fake.Lorem.sentences(3)
      };
    },
    user: function() {
      return {
        username: Fake.Internet.userName(),
        fullname: Fake.Name.findName(),
        email: Fake.Internet.email(),
        password: 'password'
      };
    }
  };

}).call(this);
