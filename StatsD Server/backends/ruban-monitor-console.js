/*jshint node:true, laxcomma:true */
/* CLI Test Command Structure:
echo "metric_name:metric_value|type_specification" | nc -u -w0 127.0.0.1 8125 */

var util = require('util');
var http = require('http');
var defs = require('./monitorMetrics.json');

function RubanBackend(startupTime, config, emitter){

  var isDevice = false;

  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  this.config = config;

  console.log("Backend Loaded!");
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
  console.log("Checking If Monitor device Exists ...");
  isAlreadyRubanDevice(config, 'Ruban Monitor', function(err, booleanResult){
    if(booleanResult === true){
      uploadDefinitions(config, defs, function(err, result){
        if(err){
          console.log(err);
        }
        if(result){
          console.log(result);
        }
      });
    } else {
      console.log('Device not found. Creating Device ..');
      createDevice(config, function(){
        console.log('Device Created! \nLaunching Monitor!');
      });
    }
  });
}


RubanBackend.prototype.flush = function(timestamp, metrics) {
  console.log('Flushing Ruban stats at ', new Date(timestamp * 1000).toString());

  var timers = metrics.timers;
  var data = [];
  var timestamp = (new Date).getTime();
  for (var timer in timers) {
    var values = timers[timer];
    for (var index =0; index < values.length; index++) {
      if (values[index] > 0) {
        data.push({ UUID: this.config.appKey, timestamp: timestamp, name: "davra.response.times", value: values[index], msg_type: "datum"});
	       console.log("Pushed Data!");
      }
    }
  }

  var gauges = metrics.gauges;
  console.log(gauges);
  for (var gauge in gauges) {
    console.log(gauge);
    var value = gauges[gauge];
    if (value > 0) {
      console.log("Bigger");
      var tbp = { UUID: this.config.appKey, timestamp: timestamp, name: gauge, value: value, msg_type: "datum", }
      console.log(tbp);
      data.push(tbp);
       console.log("Pushed Data!");
    }
  }

  console.log("Sending!")
  if (data.length > 0) {
    sendDataToRuBAN(this.config, data);
  }
};

//http.get.hello.response_time
function parseKey(key) {
  return key;
}

function uploadDefinitions(config, defs, callback){
  var mess = JSON.stringify(defs);
  var req = postRequest(config.rubanUrl, "/api/v1/iotdata/meta-data", mess);
  req.end(mess);
  callback(null, true);
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

function putRequest(host, url, body) {
  return new http.request({
    hostname: host,
    port: 58000,
    path: url,
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
    }
  });
}

function isAlreadyRubanDevice(config, devicename, callback){
	getRequest(config.rubanUrl, '/eem/api/v1/devices', function(err, body){
		if(err) {
			console.log(err);
			process.exit(0);
		}
		var jsonRes = JSON.parse(body);
    for(key in jsonRes.records){
      for(item in jsonRes.records[key]){
          if(item === 'name'){
            var check = jsonRes.records[key][item];
            if(check === devicename){
              callback (null, true)
              return;
            }
          }
      }
    }
    callback(null, false);
	});

}

function getRequest(host, url, callback) {
    var req = new http.get({
    hostname: host,
    port: 58000,
    path: url
    }, function(res){
	    //console.log('STATUS: ' + res.statusCode);
  	    //console.log('HEADERS: ' + JSON.stringify(res.headers));

	    var bodyChunks = [];
  	    res.on('data', function(chunk) {
    	    	bodyChunks.push(chunk);
  	    }).on('end', function() {
    	    var body = Buffer.concat(bodyChunks);
            	//console.log('BODY: ' + body);
		      callback(null, body.toString());

  	    })
    });
    req.on('error', function(e){
	console.log("Error: " + e.message);
	callback(err, null)
	});

}

function createDevice(config, callback) {
  var data = {
    "serialNumber": config.appKey,
    "name": "Ruban Monitor",
    "ipAddress": config.rubanUrl
  };
  console.log("Data created! AppKey: " + config.appKey)
  var body = JSON.stringify(data);
  var request = postRequest(config.rubanUrl, "/eem/api/v1/devices", body);
  request.end(body)
  callback();
}

function sendDataToRuBAN(config, data) {
  console.log("Sending Stats ..");
  var body = JSON.stringify(data);
  var request = putRequest(config.rubanUrl, "/api/v1/iotdata", body);
  request.end(body, function(err, res){
  	if(err) console.log(err);
  });
}

RubanBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'console', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new RubanBackend(startupTime, config, events);
  return true;
};
