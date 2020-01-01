const {SMTPServer} = require('smtp-server');
const shinobiApi = require('./shinobi-api.js');
const config = process.env.hasOwnProperty('CONFIG') ? JSON.parse(process.env.CONFIG) : require('./config.js');

const server = new SMTPServer({
  // disable STARTTLS to allow authentication in clear text mode
  disabledCommands: ['STARTTLS'],

  // By default only PLAIN and LOGIN are enabled
  authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],

  // Accept messages up to 10 MB
  size: 10 * 1024 * 1024,

  hidePIPELINING: true,

  // Allow only users with username and password from config
  onAuth(auth, session, callback) {
    let username = config.SMTP_USER;
    let password = config.SMTP_PASS;

    // check username and password
    if (
      auth.username === username &&
      (auth.method === 'CRAM-MD5' ?
        auth.validatePassword(password) // if cram-md5, validate challenge response
        :
        auth.password === password) // for other methods match plaintext passwords
    ) {
      return callback(null, {
        user: 'userdata' // value could be an user id, or an user object etc. This value can be accessed from session.user afterwards
      });
    }

    return callback(new Error('Authentication failed'));
  },

  //grab the sender address, pull out the shinobi monitor ID, and trigger a motion event via the API
  async onMailFrom (address, session, callback) {
    console.log(`${new Date().toString()}   incoming mail from: ${address.address}`);

    let monitorId = address.address.split('@')[0];

    await shinobiApi.triggerMotionForMonitor(monitorId);

    callback();
  },


});

server.on('error', err => {
  console.log('Error occurred');
  console.log(err);
});

// start listening
server.listen(config.SERVER_PORT, config.SERVER_HOST);
console.log(`SMTP server started!`);
