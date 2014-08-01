(function() {
  var Comment, Persist, Blog, User,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Persist = require("../db/persist");

  module.exports = User = (function(_super) {
    __extends(User, _super);

    function User(obj) {
      var key, val;
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        this[key] = val;
      }
    }

    User.create = function*(attrs) {
      var user = yield* User.__super__.constructor.create.call(this, attrs);
      this.createPremises(user.id);
      return user;
    };

    User.relationTable = function() { return "urelations"; };

    User.prototype.blogs = function*() { return yield* this.atomicRelate("ownedBlogIds", Blog); };

    User.prototype.followers = function*() { return yield* this.atomicRelate("followerIds", User); };

    User.prototype.followed = function*() { return yield* this.atomicRelate("followedIds", User); };

    User.prototype.followerIds = function*() { return yield* this.atomicGet("followerIds"); };

    User.prototype.followedIds = function*() { return yield* this.atomicGet("followedIds"); };

    User.prototype.flaggerIds = function*() { return yield* this.atomicGet("flaggerIds"); };

    User.prototype.blockedUserIds = function*() { return yield* this.redatomicGet("blockedUserIds"); };

    User.prototype.flag = function(poly) { poly.atomicAppend("flaggerIds", this.id); };

    User.prototype.blockUser = function(user) { this.redatomicAppend("blockedUserIds", user.id); };


    User.prototype.follow = function(user) {
      this.atomicAppend("followedIds", user.id);
      user.atomicAppend("followerIds", this.id);
    };

    User.prototype.unfollow = function(user) {
      this.atomicRemove("followedIds", user.id);
      user.atomicRemove("followerIds", this.id);
    };

    User.prototype.createBlog = function*(attrs) {
      attrs["userId"] = this.id;
      var blog = yield* Blog.create(attrs);
      this.atomicAppend("ownedBlogIds", blog.id);
      return blog;
    };

    User.prototype.createComment = function*(poly, attrs) {
      attrs['userId'] = this.id;
      attrs['threadableType'] = poly.constructor.name;
      attrs['threadableId'] = poly.id;
      var comment = yield* Comment.create(attrs);
      poly.redatomicAppend("commentIds", comment.id);
      return comment;
    };

    User.createPremises = function(userId) { this.dryExecute("INSERT INTO \"urelations\" (\"id\") VALUES ($1)", [userId]); };

    return User;

  })(Persist);

  Blog = require("./blog");
  Comment = require("./comment");

}).call(this);
