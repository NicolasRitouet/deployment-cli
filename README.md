# Deploy CLI

A common pattern to discover the different instances of a given application is to store the IP of the instances on a record set (aka DNS Service Record Discovery).  
This record set can be resolved by the load-balancer easily and can start load-balance the requests automagically.  
It makes the deployment on the different instances also easier because the IP of the instances are stored on this record set.

This tool will resolve the record set of a given hostname and will run the necessary bash commands through SSH to run the deployment on the IP it found.

## Usage
`ssh-deploy -h auth.example.com -u centos -k /Users/nicolas/.ssh/work_ssh`


### Resources

http://jamesknelson.com/testing-in-es6-with-mocha-and-babel-6/
https://developer.atlassian.com/blog/2015/11/scripting-with-node/