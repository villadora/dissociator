var async = require('async');
var routington = require('routington');

function Diss() {
  var router = this.router = routington();

  router.use = function(path, middleware) {
    var nodes = router.define(path);
    nodes.forEach(function(node) {
      node.uses = node.uses || [];
      node.uses.push(middleware);
    });
  };

  ['get', 'put', 'post', 'delete', 'head'].forEach(function(method) {
    var M = method.toUpperCase();

    router[method] = function(path, handler) {
      var nodes = router.define(path);
      nodes.forEach(function(node) {
        node[M] = node[M] || [];
        node[M].push(handler);
      });
    };
  });

  router.del = router.delete;
}

Diss.prototype.handle = (req, res, next) {
  var match = this.router.match(url.parse(req.url).pathname)
  if (!match)
    return next();

  req.params = match.params;

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

module.exports = function() {
  return new Diss();
};

module.exports.Dissociator = Diss;