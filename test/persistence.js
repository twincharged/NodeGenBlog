(function() {
  var Faker, Persist, Blog, User, assert, fakedBlog, should;
  should = require("should");
  assert = require("assert");
  Blog = require("../models/blog");
  User = require("../models/user");
  Faker = require("./test_helpers/faker");
  Persist = require("../db/persist");
  require("../concerns/toolkit");
  require("co-mocha");

  fakedBlog = Faker.publicBlog();

  before(function() {
    fakedBlog['userId'] = 1;
    Blog.insert(fakedBlog);
    fakedBlog['userId'] = 3;
    Blog.insert(fakedBlog);
    fakedBlog['userId'] = 2;
    fakedBlog['flaggerIds'] = [1];
    Blog.insert(fakedBlog);
    fakedBlog['userId'] = 4;
    fakedBlog['flaggerIds'] = [2];
    Blog.insert(fakedBlog);
  });

  describe("PG finding and relating", function() {
    it("should fetch by id", function*() {
      var blog;
      blog = yield* Blog.find(1);
      blog.id.should.equal(1);
    });

    it("should fetch by attr", function*() {
      var blog;
      blog = yield* Blog.findBy({
        userId: 1
      });
      blog.collect('userId').should.containEql(1);
    });

    it("should relate with arrays", function*() {
      var blog, user;
      blog = yield* Blog.find(1);
      user = yield* blog.user();
      user.id.should.equal(blog.userId);
    });
  });

  before(function*() {
    var arr, blog;
    blog = yield* Blog.find(2);
    arr = [20, 35, 785, 96, 82];
    blog.atomicCat("flaggerIds", arr);
    blog = yield* Blog.find(1);
    blog.atomicAppend("flaggerIds", 2);
  });

  describe("PG array", function() {
    it("should atomicAppend mult to arrays", function*() {
      var arr, blog;
      arr = [20, 35, 785, 96, 82];
      blog = yield* Blog.find(2);
      blog.flaggerIds.should.containDeep(arr);
    });

    it("should atomicAppend arrays", function*() {
      var blog;
      blog = yield* Blog.find(1);
      blog.flaggerIds.should.containEql(2);
    });
  });

  before(function*() {
    var blog;
    blog = yield* Blog.find(2);
    blog.atomicRemove("flaggerIds", 1);
    blog = yield* Blog.find(3);
    blog.destroy();
  });

  describe("PG array", function() {
    it("should atomicRemove from arrays", function*() {
      var blog = yield* Blog.find(2);
      blog.flaggerIds.should.not.containEql(1);
    });

    it("should destroy row", function*() {
      var blog = yield* Blog.find(3);
      blog.should.be.empty;
    });
  });

  before(function*() {
    var uatts, user;
    uatts = Faker.user;
    uatts['id'] = 10;
    user = yield* User.create(uatts);
    user = yield* User.find(10);
    user.atomicAppend("followerIds", 2);
  });

  describe("PG array", function() {
    it("should atomicGet arrays", function*() {
      var ids, user;
      user = yield* User.find(10);
      ids = user.atomicGet('flaggerIds');
      ids.should.containEql(2);
    });
  });

  before(function*() {
    var blog;
    blog = yield* Blog.find(2);
    blog.update({
      body: "Hey there!",
      "public": false
    });
  });

  describe("PG update", function() {
    it("should update", function*() {
      var blog;
      blog = yield* Blog.find(2);
      blog["public"].should.equal(false);
      blog.body.should.equal("Hey there!");
    });
  });

}).call(this);
