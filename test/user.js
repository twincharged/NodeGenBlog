(function() {
  var Comment, Faker, Blog, User, assert, baseUser, should, user1, user2, user3;
  should = require("should");
  assert = require("assert");
  User = require("../models/user");
  Blog = require("../models/blog");
  Comment = require("../models/comment");
  Faker = require("./test_helpers/faker");
  require("../concerns/toolkit");
  require("co-mocha");

  baseUser = Faker.user();
  baseUser["id"] = 1;
  baseUser["username"] = 'ausername';
  user1 = new User(baseUser);
  baseUser["id"] = 2;
  baseUser["username"] = 'Johnnyboy';
  user2 = new User(baseUser);
  baseUser["id"] = 3;
  baseUser["username"] = 'thirduser';
  user3 = new User(baseUser);

  before(function*() {
    yield* User.create(user1);
    yield* User.create(user2);
    yield* User.create(user3);
  });

  describe("User finding", function() {
    it("should fetch by id", function*() {
      (yield* User.find(1)).id.should.equal(1);
    });

    it("should fetch by alt attribute", function*() {
      (yield* User.findBy({
        username: 'Johnnyboy'
      }))[0].id.should.exist;
    });
  });

  before(function() {
    user2.follow(user1);
    user1.follow(user2);
    user2.unfollow(user1);
  });

  describe("User following", function() {
    it("should follow", function*() {
      (yield* user1.followed()).collect('id').should.containEql(user2.id);
      (yield* user2.followers()).collect('id').should.containEql(user1.id);
    });
    it("should unfollow", function*() {
      (yield* user1.followers()).collect('id').should.not.containEql(user2.id);
      (yield* user2.followed()).collect('id').should.not.containEql(user1.id);
    });
  });

  before(function*() {
    var evAtts, blog, blogAtts;
    blogAtts = Faker.publicBlog();
    blogAtts['id'] = 100;
    blog = yield* user1.createBlog(blogAtts);
    blog.destroy();
    blogAtts['id'] = 400;
    yield* user2.createBlog(blogAtts);
  });

  describe("User relations", function() {
    it("should relate blog", function*() {
      var blog, blogs, _i, _len, _results;
      blogs = yield* user2.blogs();
      blogs.collect('id').should.containEql(400);
      _results = [];
      for (_i = 0, _len = blogs.length; _i < _len; _i++) {
        blog = blogs[_i];
        _results.push((yield* blog.user()).id.should.equal(user2.id));
      }
      return _results;
    });

    it("should unrelate user blog", function*() {
      (yield* user1.blogs()).collect('id').should.not.containEql(100);
    });

    it("should relate blog comment", function*() {
      var comment, blog;
      blog = yield* Blog.find(1);
      comment = yield* user1.createComment(blog, Faker.comment());
      (yield* comment.user()).id.should.equal(user1.id);
    });

  before(function*() {
    var commAtts, comment, blog, blogAtts;
    blogAtts = Faker.publicBlog();
    blogAtts['id'] = 200;
    blog = yield* user3.createBlog(blogAtts);
    user2.flag(blog);
    commAtts = Faker.comment();
    commAtts['id'] = 100;
    comment = yield* user2.createComment(blog, commAtts);
    user1.flag(comment);
    user1.flag(user2);
  });

  describe("User relations", function() {

    it("should flag blog", function*() {
      (yield* Blog.find(200)).flaggerIds.should.containEql(user2.id);
    });

    it("should flag comment", function*() {
      (yield* Comment.find(100)).flaggerIds.should.containEql(user1.id);
    });

    it("should flag user", function*() {
      (yield* user2.flaggerIds()).should.containEql(user1.id);
    });
  });


}).call(this);
