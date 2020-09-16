const hooks = require('./hooks');
const { CONTENT_TYPE_TEXT } = require('./constants');
const getRecord = require('../controllers/getRecord');
const logHandle = require('../controllers/logHandle');
const action = require('../controllers/action');
const recordFail = require('../controllers/recordFail');
const completeRecord = require('../controllers/completeRecord');

module.exports = (req, res) => {
  const router = {
    '/': (req, res) => {
      res.writeHead(200, CONTENT_TYPE_TEXT);
      res.end('');
    },
    '/getRecord': getRecord,
    '/completeRecord': completeRecord,
    '/recordFail': recordFail,
    '/logHandle': logHandle,
    '/action': action,
  };


  const routerController = router[req.pathname];
  if (typeof routerController === 'undefined') {
    return;

  }
  if (['/', '/getRecord', '/logHandle'].includes(req.pathname)) {
    return routerController(req, res);
  }

  hooks(req.pathname, routerController(req, res))
};
