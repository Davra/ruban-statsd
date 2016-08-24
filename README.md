# ruban-statsd

### Running StatsD
##### Setting up the server

To run StatsD server, clone the StatsD repo from etsy into a newly created folder. The following git link will work: 
> https://github.com/etsy/statsd.git

Then clone the ruban StatsD repo to get the integration files and clients into the same folder. Place the following files from the 'ruban-stasd/Ruban StatsD Files' folder into there appropriate locations:
- rubanConfig.js : StatsDServer_dir/
- ruban-monitor-console.js : StatsDServer_dir/backends

Change rubanconfig.js to point at the server of your choice.

Then execute the following command to start the server:
> node stats.js rubanconfig.js 

##### Setting up a client
To run a client, download your client folder and configure all information in the config files. 
Install the client with npm, then launch the service with:
> node <Service Name>.js

All clients are responsible for sending metric definitions to ruban for the information they're sending. They have metric definitions already present in the definitions.json. If you wish to add more definitions to the metrics array, please edit with the following template: 	
		{
		  "name":"com.davranetworks.<dot seperated metric name>",
		  "label":"<metric name>",
		  "group":"davra networks",
		  "semantics":"metric",
		  "units":"<unit>"
		}

### What is StatsD?
StatsD is a software package used to aggregate metrics from multiple sources and report them to a place of your choosing with a custom written backend. 
