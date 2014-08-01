(function() {
  "use strict";
  var app, io, json, koa, model, router, server;
  koa = require("koa");
  json = require("koa-json");
  router = require("koa-router");
  app = koa();

  model = {
    user: require("./models/user"),
    blog: require("./models/blog"),
    comment: require("./models/comment")
  };

  app.use(json());
  app.use(router(app));

  app.get('/:klass/:id', function*() { // This fetches any id, any array of ids from any constructor#find function.
    this.body = yield* model[this.params.klass].find(this.params.id);
  });

  app.get('/:klass/:id/:action', function*() { /* This route is uber-cool. This is where the CS "class" type
    and its hardcore "extends" JS metaprogramming pays off. This route fetches every prototype "get" function in the repo
    This is because they all act as relations without arguments for the function, yada yada yada. For instance, it
    enables both user/1/followers and comment/3/threadable to work, even though they are unrelated. This one line of
    JS enables the grand majority of the functions in this repo to work flawlessly as a route. */
    this.body = yield* ((yield* model[this.params.klass].find(this.params.id))[this.params.action]());
  });

  app.blog('/:klass/:action/atts', function*() { // Untested. Meant for static or "class" functions such as klass#create.
    this.body = yield* model[this.params.klass][this.params.action](this.response.body);
  });

  server = require('http').Server(app.callback());
  io = require('socket.io')(server);
  server.listen(3000);

}).call(this);
