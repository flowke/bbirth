const events = require('../lib/events');
const {
  loggerServer
} = require('./log');

const action = (req, res) => {

  // 停止
  if(req.query.acname === 'stop'){
    loggerServer.info('action: stop')
    events.stopRecord();
  }

  res.sendJson({});

  return Promise.resolve(req.body);
};

module.exports = action;
