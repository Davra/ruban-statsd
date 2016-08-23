var mqtt    = require('mqtt');
var configFile = require('./config');
var defsFile = require('./mosquitto-definitions');
var http = require('http');
var _ = require('underscore');
var fs = require('fs');
var dgram = require('dgram');
var client  = mqtt.connect(configFile.mosquittoUrl,{

        protocolId: 'MQIsdp',

        protocolVersion: 3

    });

function clearData(callback){
	data = null;
	callback();
}

client.on('connect', function () {
  	subscribeToTopics();
	uploadDefinitions(configFile, defsFile, function(err, result){
		console.log('Definition Upload Success? ' + result);	
	});
});

fs.watch('config.json', (eventType, filename) => {
  console.log(`event type is: ${eventType}`);
  if (eventType === 'change') {
    subscribeToTopics();
  }ls
});
 
client.on('message', function (topic, message) {
	console.log("Message Event recieved!");	
	var arrayTopicName = topic.toString().split("/");
	var statsTopicName = "org.mosquitto.";
	for(var i = 2; i < arrayTopicName.length ; i++ ){
			statsTopicName += arrayTopicName[i];
			if(!(i === (arrayTopicName.length - 1))){
				statsTopicName += ".";
			}
	}
	var pushedString = statsTopicName + ":" + message.toString() + "|g";
	data = {"message" : pushedString};
	reportToStatsHost(data);
});




function subscribeToTopics(){
	var topics = configFile.topics;
	for(element in topics){
		if((topics[element].value) === "true" || (topics[element].value) === "True"){
			client.subscribe(topics[element].topic);
		}
				
	}
}



function reportToStatsHost(data) {
	console.log("data belo from interval");
	console.log(data);
	if(data){
		console.log("interval again");
	  var client = dgram.createSocket('udp4');
	  	client.send(data.message, 0, data.message.length, configFile.StatsDPort, configFile.StatsDHost, function(err, bytes) {
	      		if (err) throw err;
	      		console.log('UDP message ' + data.message + ' sent to ' + configFile.StatsDHost +':'+ configFile.StatsDPort);
	      		client.close();
	  	});
	}
}


function uploadDefinitions(config, defs, callback){
  var mess = JSON.stringify(defs);
  var req = postRequest(configFile.RubanHost, "/api/v1/iotdata/meta-data", mess);
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




