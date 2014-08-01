(function() {
  var Faker, Blog, User, assert, should;
  should = require("should");
  assert = require("assert");
  User = require("../models/user");
  Blog = require("../models/blog");
  Faker = require("./test_helpers/faker");
  require("../concerns/toolkit");
  require("co-mocha");

  before(function*() {
    var evAtts, blogAtts, user, userAtts;
    userAtts = Faker.user();
    userAtts['id'] = 456;
    user = yield* User.create(userAtts);
    blogAtts = Faker.publicBlog();
    blogAtts['id'] = 457;
    yield* user.createBlog(blogAtts);
  });

  describe("Comments", function() {
    it("should relate to blog", function*() {
      var comment, blog, user;
      blog = yield* Blog.find(457);
      user = yield* User.find(456);
      comment = yield* user.createComment(blog, Faker.comment());
      (yield* comment.threadable()).id.should.equal(blog.id);
      (yield* blog.comments()).collect('id').should.containEql(comment.id);
    });

}).call(this);
