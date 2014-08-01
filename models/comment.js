(function() {
  var Comment, Persist, Blog, User,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Persist = require("../db/persist");

  module.exports = Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment(obj) {
      var key, val;
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        this[key] = val;
      }
    }

    Comment.prototype.user = function*() { return yield* User.find(this.userId); };

    Comment.prototype.taggedUsers = function*() { return yield* User.find(this.taggedUserIds); };

    Comment.prototype.threadable = function*() {
      var klass = (this.threadableType === 'Blog' ? Blog : void 0);
      return yield* klass.find(this.threadableId);
    };

    return Comment;

  })(Persist);

  User = require("./user");
  Blog = require("./blog");

}).call(this);
