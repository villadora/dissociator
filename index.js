var async = require('async');
var routington = require('routington');
var url = require('url');
var methods = require('methods');

function Diss() {
  var router = this.router = routington();
}

Diss.prototype.use = function(path, middleware) {
  var nodes = this.router.define(path);
  nodes.forEach(function(node) {
    node.uses = node.uses || [];
    node.uses.push(middleware);
  });
};

methods.forEach(function(method) {
  var M = method.toUpperCase();

  Diss.prototype[method] = function(path, handler) {
    var nodes = this.router.define(path);
    nodes.forEach(function(node) {
      node[M] = node[M] || [];
      node[M].push(handler);
    });
  };
});

Diss.prototype.del = Diss.prototype.delete;

Diss.prototype.routing = function() {
  var self = this;
  return function(req, res, next) {
    var match = self.router.match(url.parse(req.url).pathname);
    if (!match)
      return next();

    req.params = match.param;

    var node = match.node;
    var stacks = (node.uses || []).concat(node[req.method] || []);

    if (stacks && stacks.length) {
      async.series(stacks.map(function(fn) {
        return function(cb) {
          try {
            fn(req, res, cb);
          } catch (e) {
            cb(e);
          }
        }
      }), function(err) {
        next(err);
      });
    } else {
      next();
    }
  };
};

module.exports = function() {
  var diss = new Diss();

  var router = diss.routing();
  methods.forEach(function(m) {
    router[m] = diss[m].bind(diss);
  });

  router.use = diss.use.bind(diss);

  return router;
};

module.exports.Dissociator = Diss;