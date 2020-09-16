
const http = require('http');
const url = require('url');
const exec = require('child_process').exec;
const {
  urlParamsToObj
} = require('./src/lib/utils');

let mime = {
  json: 'application/json'
}

class ServerResponse extends http.ServerResponse {
  
  json(data, msg, code){
    try {
      data = JSON.stringify({
        code:  code === undefined ? 1 : 0,
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

class IncomingMessage extends http.IncomingMessage{

  get URL(){
    if (this._urlOBJ) return this._urlOBJ
    if(this.url){
      return this._urlOJB = url.parse(this.url)
    }
    return {}
  }
  get query(){
    return urlParamsToObj(this.URL.query)
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
  ServerResponse: ServerResponse,
  IncomingMessage
}, catchErr((req, res) => {

  if (req.URL.pathname === '/recoder') {
    console.log('recoder');

    if(!url) {
      res.json(null, 'no url')
      return
    }
    // 运行容器
    exec(`docker run -dit --rm -P  -v $(pwd)/rebirth_alo7/logs:/etc/www/logs -v $(pwd)/rebirth_alo7/video:/root/Downloads -e MATERIAL_URL="${req.query.url}" ret`, (error, stdout, stderr) => {
      // 返回容器id
      if (stdout) res.json({
        id: stdout
      })

      if (stderr) res.json(null, stderr)
      // console.log('msg:',stdout);
      // console.log('err:',stderr);
    })
    return
  }

  if(req.URL.pathname === '/stop'){
    res.json(null, 'done')
    return
  }

  res.json(null, 'do nothing')

}, (err, req, res)=>{
  console.log(err);
  res.json(null, 'internal error', 0)
}))

process.on('exit', err=>{
  console.log('process err: ', err);
})

server.on('error', err=>{
  console.log(err);
})

server.listen(8999);