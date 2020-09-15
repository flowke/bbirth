
const http = require('http');
const url = require('url');
const exec = require('child_process').exec;

let mime = {
  json: 'application/json'
}

class Incom extends http.ServerResponse {
  json(data, msg, code){
    try {
      data = JSON.stringify({
        code: data === null ? (code || 1) : (code || 0),
        msg: msg || 'ok',
        data: data || undefined
      })
    } catch (error) {
      data = JSON.stringify({code: code, msg: 'internal responsed JSON format error'})
    }
    this.setHeader('Content-type', mime.json)
    this.end(data)
  }
}

function catchErr(fn, errorcallback){

  return function(...rest){
      try {
        fn(...rest)
      } catch (error) {
        errorcallback && errorcallback(error,...rest)
      }

  }

}

let server = http.createServer({
  ServerResponse: Incom
}, catchErr((req, res) => {

  let urlObj = url.parse(req.url);
  
  if(urlObj.pathname==='/recoder'){
    exec('echo nums', (error, stdout, stderr)=>{
      console.log('msg:',stdout);
      console.log('err:',stderr);
    })
    
    res.end()

  }

  res.json({a:'c'})

}, (err, req, res)=>{
  res.json(null, 'internal error')
}))

process.on('exit', err=>{
  console.log('process err: ', err);
})

server.on('error', err=>{
  console.log(err);
})

server.listen(8999);