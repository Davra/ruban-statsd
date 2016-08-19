var dgram  = require('dgram');

exports.start = function(config, callback, port) {
  var udp_version = config.address_ipv6 ? 'udp6' : 'udp4';
  var server = dgram.createSocket(udp_version, callback);
  server.bind(port, config.address || undefined);
  this.server = server;

  return true;
};
