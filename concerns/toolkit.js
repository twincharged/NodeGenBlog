(function() {

  // Yup, I messed around with some prototypes, idgaf. For testing...

  String.prototype.pluralize = function() {
    if (this.slice(-1) === "y") {
      return "" + (this.slice(0, -1)) + "ies";
    } else {
      return "" + this + "s";
    }
  };

  Object.values = function(obj) {
    var key, _i, _len, _ref, _results;
    _ref = Object.keys(obj);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _results.push(obj[key]);
    }
    return _results;
  };

  Array.prototype.uniq = function() {
    var arr;
    arr = this;
    return arr.reverse().filter(function(e, i, arr) {
      return arr.indexOf(e, i + 1) === -1;
    }).reverse();
  };

  Array.prototype.collect = function(attr) {
    var a, arr, obj, _i, _len;
    arr = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      obj = this[_i];
      a = obj[attr];
      if (a) {
        arr.push(a);
      }
    }
    return arr;
  };

  Array.arraysEqual = function(a, b) {
    if (a === b) {
      true;
    }
    if (a == null || b == null) {
      false;
    }
    if (a.length != b.length) {
      return false;
    }
  };

  Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
  };

}).call(this);
