var os = require('os');
var config = require('./config.json');
var definitions = require('./definitions.json');
var http = require('http');
var dgram = require('dgram');
var _ = require('underscore');

var HOST_IP = '127.0.0.1';
var HOST_PORT = 8125;

uploadDefinitions(config, definitions, function(err, boolean){
	if(err) console.log(err);
	console.log(boolean)
});

setInterval(getHostStats, 5000, reportToHost);

function getHostStats(callback){
  var cpuUsage = os.loadavg();
  var freeMem = os.freemem();
  var totalMem = os.totalmem();
  var memPercent = Math.round(100 - ((freeMem/totalMem)*100));
  var cpuPretty = Math.round(cpuUsage[0]*100);
  console.log("Memory Usage: " + memPercent + "%");
  console.log("Cpu Usage: " + cpuPretty + "%");
  var data = {
    "mem" : memPercent,
    "cpu" : cpuPretty
  } ;
  console.log(data);
  callback(data);
}

function uploadDefinitions(config, defs, callback){
  var mess = JSON.stringify(defs);
  var req = postRequest(config.RubanHost, "/api/v1/iotdata/meta-data", mess);
  req.end(mess);
  callback(null, true);
}

function reportToHost(data) {
  var keys = Object.keys(data);
  console.log(keys);

  var completed = _.after(keys.length, function(){
    console.log("Messages Sent!");
  });

  _.each(keys, function(metric, index){
    var client = dgram.createSocket('udp4');
    switch(metric){
      case 'mem':
        var message = "com.davranetworks.mem.usage:" + data.mem + "|g"
        console.log(message);
        break;
      case 'cpu':
        var message = "com.davranetworks.cpu.usage:" + data.cpu + "|g"
        console.log(message);
        break;
    }
  client.send(message, 0, message.length, 8125, '127.0.0.1', function(err, bytes) {
      if (err) throw err;
      console.log('UDP message sent to ' + '127.0.0.1' +':'+ 8125);
      client.close();
  });
  completed();
  });
}

 function postRequest(host, url, body) {
   return new http.request({
     hostname: host,
     port: 58000,
     path: url,
     method: "POST",
     headers: {
         "Content-Type": "application/json",
         "Content-Length": Buffer.byteLength(body)
     }
   });
 }
//
// function putRequest(host, url, body) {
//   return new http.request({
//     hostname: host,
//     port: 58000,
//     path: url,
//     method: "PUT",
//     headers: {
//         "Content-Type": "application/json",
//         "Content-Length": Buffer.byteLength(body)
//     }
//   });
// }
//
// function getRequest(host, url, callback) {
//     var req = new http.get({
//     hostname: host,
//     port: 58000,
//     path: url
//     }, function(res){
// 	    //console.log('STATUS: ' + res.statusCode);
//   	    //console.log('HEADERS: ' + JSON.stringify(res.headers));
//
// 	    var bodyChunks = [];
//   	    res.on('data', function(chunk) {
//     	    	bodyChunks.push(chunk);
//   	    }).on('end', function() {
//     	    var body = Buffer.concat(bodyChunks);
//             	//console.log('BODY: ' + body);
// 		      callback(null, body.toString());
//
//   	    })
//     });
//     req.on('error', function(e){
// 	console.log("Error: " + e.message);
// 	callback(err, null)
// 	});
//
// }
