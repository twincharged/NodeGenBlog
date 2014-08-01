(function() {
  var Comment, Persist, Blog, User,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Persist = require("../db/persist");

  module.exports = Blog = (function(_super) {
    __extends(Blog, _super);

    function Blog(obj) {
      var key, val;
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        this[key] = val;
      }
    }

    Blog.prototype.destroy = function() {
      this.removeRelations();
      Blog.__super__.destroy.call(this, this);
    };

    Blog.prototype.user = function*() { return yield* User.find(this.userId); };

    Blog.prototype.comments = function*() { return yield* this.redatomicRelate("commentIds", Comment); };

    Blog.prototype.taggedUsers = function*() { return yield* User.find(this.taggedUserIds); };

    Blog.prototype.commentsCount = function*() { return yield* this.redcount("commentIds"); };

    Blog.prototype.commentIds = function*() { return yield* this.redatomicGet("commentIds"); };

    Blog.prototype.removeRelations = function() {
      var pseudoUser = new User({ id: this['userId'] });
      pseudoUser.atomicRemove("ownedBlogIds", this.id);
    };

    return Blog;

  })(Persist);

  User = require("./user");
  Comment = require("./comment");

}).call(this);
