(function() {
  var Persist, coredis, pg, prepareArrayTable, prepareKeys, preparePlaceHolders, prepareTable, prepareZip, queryDoubleQuote, redis, redisKey, wrapper;
  pg = require("../concerns/co-pg/index")(require("pg"));
  redis = require('redis').createClient();
  wrapper = require('co-redis');
  coredis = wrapper(redis);
  require("../concerns/toolkit");

  module.exports = Persist = (function() {
    var connectionString;

    function Persist() {}


    connectionString = 'postgres://username:@localhost/nodegenblogdev';
    Persist.redis = redis;


    Persist.find = function*(id, limit, props) { // This could probably be a bit more concise.
      var isArray, placeHolders, qString, result, row, rows, table, _i, _len, _results;
      if (limit == null) {limit = 1000;}
      if (props == null) {props = "*";}
      isArray = Array.isArray(id);
      if (isArray && id.length === 0) {return [];}
      table = prepareTable(this.name);
      if (isArray) {
        placeHolders = preparePlaceHolders(id.length);
        qString = "SELECT " + props + " FROM " + table + " WHERE id IN (" + placeHolders + ") LIMIT " + limit;
      } else {
        qString = "SELECT " + props + " FROM " + table + " WHERE id=$1";
        id = [id];
      }
      result = yield* this.execute(qString, id);
      rows = result.rows;
      if (isArray) {
        _results = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          _results.push(new this(row));
        }
        return _results;
      } else {
        return new this(rows[0]);
      }
    };

    Persist.findBy = function*(obj, limit) {
      var keys, placeHolders, qString, result, table, vals, _i, _len, _ref, _ref1, _results;
      if (limit == null) {
        limit = 1000;
      }
      _ref = this.prepareQueryObject(obj), table = _ref.table, keys = _ref.keys, vals = _ref.vals, placeHolders = _ref.placeHolders;
      qString = "SELECT " + table + ".* FROM " + table + " WHERE " + keys + "=" + placeHolders + " LIMIT " + limit;
      result = yield* this.execute(qString, vals);
      _ref1 = result.rows;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        obj = _ref1[_i];
        _results.push(new this(obj));
      }
      return _results;
    };

    Persist.create = function*(obj) {
      var keys, placeHolders, qString, result, table, vals, _ref;
      obj['createdAt'] = new Date();
      _ref = this.prepareQueryObject(obj), table = _ref.table, keys = _ref.keys, vals = _ref.vals, placeHolders = _ref.placeHolders;
      qString = "INSERT INTO " + table + " (" + keys + ") VALUES (" + placeHolders + ") RETURNING *";
      result = yield* this.execute(qString, vals);
      return new this(result.rows[0]);
    };

    Persist.execute = function*(queryString, vals) {
      var client, connectResults, done, err, result;
      console.log("Executing vals(" + vals + "): " + queryString);
      connectResults = yield pg.connect_(connectionString);
      client = connectResults[0];
      done = connectResults[1];
      try {
        result = yield client.query_(queryString, vals);
      } catch (_error) {
        err = _error;
        console.error('Error with query: ', err);
      } finally {
        done();
      }
      return result;
    };

    Persist.insert = function(obj) {
      var keys, placeHolders, qString, table, vals, _ref;
      _ref = this.prepareQueryObject(obj), table = _ref.table, keys = _ref.keys, vals = _ref.vals, placeHolders = _ref.placeHolders;
      qString = "INSERT INTO " + table + " (" + keys + ") VALUES (" + placeHolders + ")";
      this.dryExecute(qString, vals);
    };

    Persist.dryExecute = function(queryString, vals) {
      console.log("Dry executing vals(" + vals + "): " + queryString);
      pg.connect(connectionString, function(err, client, done) {
        if (err) {
          console.error("Error fetching client from pool: " + err);
        }
        client.query(queryString, vals);
        done();
      });
    };

    Persist.prepareQueryObject = function(obj) {
      var vals;
      vals = Object.values(obj);
      return {
        table: prepareTable(this.name),
        keys: prepareKeys(Object.keys(obj)),
        vals: vals,
        placeHolders: preparePlaceHolders(vals.length)
      };
    };

    Persist.prototype.update = function(obj) {
      var con, keys, placeHolders, qString, table, updates, vals, _ref;
      obj['updatedAt'] = new Date();
      con = this.constructor;
      _ref = con.prepareQueryObject(obj), table = _ref.table, keys = _ref.keys, vals = _ref.vals, placeHolders = _ref.placeHolders;
      updates = prepareZip(keys, placeHolders);
      qString = "UPDATE " + table + " SET " + updates + " WHERE " + table + ".id=" + this.id;
      con.dryExecute(qString, vals);
    };

    Persist.prototype.destroy = function() {
      var con, qString, table;
      con = this.constructor;
      table = prepareTable(con.name);
      qString = "DELETE FROM " + table + " WHERE " + table + ".id = " + this.id;
      con.dryExecute(qString);
    };

    Persist.prototype.atomicAppend = function(field, value) {
      this.polyArrayFunc(field, value, "array_append", false);
    };

    Persist.prototype.atomicCat = function(field, values) {
      this.polyArrayFunc(field, values, "array_cat", true);
    };

    Persist.prototype.atomicRemove = function(field, value) {
      this.polyArrayFunc(field, value, "array_remove", false);
    };

    Persist.prototype.polyArrayFunc = function(field, value, arrayMethod, multipleVals) {
      var arrayWork, attr, table;
      table = prepareArrayTable(this.constructor.name);
      if (multipleVals === true) {
        arrayWork = "ARRAY[" + value + "]";
      } else {
        arrayWork = "" + value;
      }
      attr = queryDoubleQuote(field);
      this.constructor.dryExecute("UPDATE " + table + " SET " + attr + " = " + arrayMethod + "(" + attr + ", " + arrayWork + ") WHERE id = " + this.id);
    };

    Persist.prototype.atomicRelate = function*(field, relatedClass, limit) {
      var obj, relatedTable, result, table, _i, _len, _ref, _results;
      if (limit == null) {
        limit = 100;
      }
      table = prepareArrayTable(this.constructor.name);
      relatedTable = prepareTable(relatedClass.name);
      result = yield* relatedClass.execute("SELECT * FROM " + relatedTable + " WHERE id IN (SELECT unnest(" + (queryDoubleQuote(field)) + ") FROM " + table + " WHERE id = " + this.id + ") LIMIT " + limit);
      _ref = result.rows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        _results.push(new relatedClass(obj));
      }
      return _results;
    };

    Persist.prototype.atomicGet = function*(field) {
      var result, table;
      table = prepareArrayTable(this.constructor.name);
      result = yield* this.constructor.execute("SELECT " + (queryDoubleQuote(field)) + " FROM " + table + " WHERE id = " + this.id);
      return result.rows[0][field];
    };

    /* It's a shame I had to stick the Redis logic and the PG logic in the same file, but it wasn't necessary to build another
    super "class" for just six Redis functions. */


    Persist.prototype.redatomicAppend = function(field, value) {
      redis.sadd(redisKey(this, field), value);
    };

    Persist.prototype.redatomicCat = function(field, values) {
       redis.sadd(redisKey(this, field), values);
    };

    Persist.prototype.redatomicRemove = function(field, value) {
      redis.srem(redisKey(this, field), value);
    };

    Persist.prototype.redatomicGet = function*(field) {
      var id, ids, _i, _len, _results;
      ids = yield coredis.smembers(redisKey(this, field));
      _results = [];
      for (_i = 0, _len = ids.length; _i < _len; _i++) {
        id = ids[_i];
        _results.push(parseInt(id));
      }
      return _results;
    };

    Persist.prototype.redcount = function*(field) {
      return yield coredis.scard(redisKey(this, field));
    };

    Persist.prototype.redatomicRelate = function*(field, relatedClass) {
      var ids;
      ids = yield* this.redatomicGet(field);
      return yield* relatedClass.find(ids);
    };

    return Persist;

  })();

  queryDoubleQuote = function(str) {
    return "\"" + str + "\"";
  };

  redisKey = function(obj, field) {
    return "" + obj.constructor.name + ":" + obj.id + ":" + field;
  };

  prepareZip = function(a1, a2) {
    var a3, i;
    a3 = [];
    i = 0;
    while (i < a1.length) {
      a3.push("" + a1[i] + "=" + a2[i]);
      i++;
    }
    return a3;
  };

  prepareTable = function(klassName) {
    return queryDoubleQuote(klassName.toLowerCase().pluralize());
  };

  prepareKeys = function(keys) {
    var key, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      _results.push(queryDoubleQuote(key));
    }
    return _results;
  };

  preparePlaceHolders = function(numOfFields) {
    var num, _i, _results;
    _results = [];
    for (num = _i = 1; 1 <= numOfFields ? _i <= numOfFields : _i >= numOfFields; num = 1 <= numOfFields ? ++_i : --_i) {
      _results.push("$" + num);
    }
    return _results;
  };

  prepareArrayTable = function(klassName) {
    return prepareTable((klassName === "User" ? "Urelation" : klassName));
  };

}).call(this);
