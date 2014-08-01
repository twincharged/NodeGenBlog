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
    var blogAtts, sharedBlog, user111, user222, userAtts;
    userAtts = Faker.user();
    userAtts['id'] = 111;
    user111 = yield* User.create(userAtts);
    userAtts['id'] = 222;
    user222 = yield* User.create(userAtts);
    blogAtts = Faker.publicBlog();
    blogAtts['id'] = 1234;
    blogAtts['taggedUserIds'] = [user111.id, user222.id];
    sharedBlog = yield* user111.createBlog(blogAtts);
    yield* user222.createShare(sharedBlog, {
      body: "Here is a cool blog!"
    });
    describe("Blog", function() {

      it("should relate tagged users", function*() {
        var blog;
        blog = yield* Blog.find(1234);
        (yield* blog.taggedUsers()).collect('id').should.containEql(111, 222);
      });
    });
  });

}).call(this);
