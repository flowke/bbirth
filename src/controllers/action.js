const events = require('../lib/events');


const action = (req, res) => {

  // 停止
  if(req.query.acname === 'stop'){
    events.stopRecord();
  }

  res.sendJson({});

  return Promise.resolve(req.body);
};

module.exports = action;
