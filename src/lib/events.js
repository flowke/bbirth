const Emt = require('event');
const { module } = require('../webpack.config');

const EV = {
  STOP_RECORD: 'stop_record'
}

class Event extends Emt{

  constructor(){
    super();

  }

  onRecordStop(fn){
    this.on(EV.STOP_RECORD,fn)
  }
  stopRecord(){
    this.emit(EV.STOP_RECORD)
  }
}

module.exports = new Event()