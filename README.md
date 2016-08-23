# ruban-statsd

### Running StatsD
##### Setting up the server
To run StatsD server, clone the StatsD repo from etsy. The following git link will work: 
> https://github.com/etsy/statsd.git

Then clone the ruban StatsD repo to get the integration files and clients. Place the following files from the 'Ruban StatsD Files' folder into there appropriate locations:
- rubanConfig.js : StatsDServer_dir/
- monitorMetrics.json : StatsDServer_dir/backends
- ruban-monitor-console.js : StatsDServer_dir/backends

Then execute the following command to start the server:
> node stats.js rubanConfig.js 

##### Setting up a client
To run a client, download your client folder and configure all information in the config files. Then launch the service with:
> node <Service Name>.js

### What is StatsD?
StatsD is a software package used to aggregate metrics from multiple sources and report them to a place of your choosing with a custom written backend. 
