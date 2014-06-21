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
    var stack = (node.uses || []).concat(node[req.method] || []);

    var idx = 0;

    next_layer();

    function next_layer(err) {
      if (err) return next(err);

      var fn = stack[idx++];
      if (!fn) return next(err);

      try {
        fn(req, res, next_layer);
      } catch (err) {
        next(err);
      }
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
