#!/usr/bin/env node --harmony --use_strict

'use strict';

/**
 * Deploy by running ssh commands sequentially.
 * This tool will first get the list of IP on a A DNS record Set
 * then, it will loop over the IPs to run the SSH commands to deploy.
 *
 * @author Nicolas Ritouet
 */


const dir = require('direktor'),
      chalk = require('chalk'),
      dns = require('dns'),
      fs = require('fs'),
      co = require('co'),
      readlineSync = require('readline-sync'),
      thunkify = require('thunkify'),
      resolve = thunkify(dns.resolve4),
      packagejson = require('../package.json');
      
const argv = require('yargs')
        .usage('\n'+ chalk.bold.underline(packagejson.name + ' v' + packagejson.version) + '\n\n' + 'Usage: $0 [options]')
        .option('h', {
          description: 'a hostname to resolve',
          alias: 'hostname',
          demand: true
        })
        .option('u', {
          description: 'the username to use to login',
          alias: 'username',
          default: 'centos'
        })
        .option('k', {
          description: 'path to the private key',
          alias: 'privatekey',
          default: '$HOME/.ssh/id_rsa'
        })
        .option('p', {
          description: 'if true, will prompt for passphrase, blocking execution',
          alias: 'passphrase',
          default: false
        })
        .example('$0 -h auth.example.com -u centos -k /Users/nicolas/.ssh/work_ssh')
        .epilog(chalk.bold(packagejson.name + ' v' + packagejson.version + ' by ' + packagejson.author))
        .argv;

const hostname = argv.hostname,
      username = argv.username || 'centos',
      askPassphrase = argv.passphrase || false;


let passphrase;
if (askPassphrase){
  passphrase = readlineSync.question('If your private key is encrypted, please, enter the passphrase: ', { hideEchoBack: true }); 
}

let getPrivateKey = function() {
  const privateKeyPath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.ssh/id_rsa';
  return fs.readFileSync(privateKeyPath);
}

co(function* () {
  let getServerIPs;
  try {
    getServerIPs = yield resolve(hostname);
  } catch (e) {
    console.log(chalk.bold(hostname) + ' could not be resolved.');
  }
  getServerIPs.forEach(ip => {
    const session = new dir.Session();
    console.log('starting deployment on server', ip);

      let task = new dir.Task({
          host: ip,
          port: 22,
          username: username,
          privateKey: getPrivateKey(),
          passphrase: passphrase
      });

      task.before = 'uptime';
      task.commands = 'sleep 5';

      session.tasks.push(task);

      session.execute(function(err) {
          console.log(err);
      });
  });


});


