const config = process.env.hasOwnProperty('CONFIG') ? JSON.parse(process.env.CONFIG) : require('./config.js');

const axios = require('axios');
const shinobiApi = axios.create({
  baseURL: `${config.SHINOBIAPIURL}/${config.APIKEY}/motion/${config.GROUPKEY}`
});

module.exports = {
  triggerMotionForMonitor: async (monitorId) => {
    log(`will trigger motion event for monitorID=${monitorId}`);
    let response = await shinobiApi.get(`/${monitorId}?data={"plug":"thomsnodething","name":"motion","reason":"camera","confidence":100}`);
    log(`response from shinobi API: ${JSON.stringify(response.data)}`);
  }
}

log = (msg) => {
  console.log(`${new Date().toString()}   ${msg}`);
}
