'use strict';

/**
 * Deploy by running ssh commands sequentially.
 * This tool will first get the list of IP on a A DNS record Set
 * then, it will loop over the IPs to run the SSH commands to deploy.
 *
 * @author Nicolas Ritouet
 */

const dir = require('direktor'),
      dns = require('dns'),
      fs = require('fs'),
      co = require('co'),
      argv = require('yargs').argv,
      readlineSync = require('readline-sync'),
      thunkify = require('thunkify'),
      resolve = thunkify(dns.resolve4);

const hostname = argv.hostname,
      username = argv.username || 'centos';

const passphrase = readlineSync.question('If your private key is encrypted, please, enter the passphrase: ', { hideEchoBack: true });

co(function* () {
  const getServerIPs = yield resolve(hostname);
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


let getPrivateKey = function() {
  const privateKeyPath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.ssh/id_rsa';
  return fs.readFileSync(privateKeyPath);
}
