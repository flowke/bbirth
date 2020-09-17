
const http = require('http');
const url = require('url');
const exec = require('child_process').exec;
const decodeUriComponent = require('decode-uri-component');


const {
  urlParamsToObj
} = require('./src/lib/utils');

let mime = {
  json: 'application/json'
}

class ServerResponse extends http.ServerResponse {
  
  json(data, msg, code){
    if (this.writableEnded) return
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
    return urlParamsToObj(decodeUriComponent(this.URL.query))
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

let idCache = {

}

let server = http.createServer({
  ServerResponse: ServerResponse,
  IncomingMessage
}, catchErr((req, res) => {

  if (req.URL.pathname === '/record') {
    console.log('record');

    if (!req.query.url) {
      res.json(null, 'no url')
      return
    }

    console.log(req.query.url);

    // 运行容器
    exec(`docker run -dit -P --rm -v $(pwd)/rebirth_alo7/logs:/etc/www/logs -v $(pwd)/rebirth_alo7/video:/root/Downloads -e MATERIAL_URL="${req.query.url}" rebb`, (error, stdout, stderr) => {
      // 返回容器id
      if (stdout) {

        res.json({
          id: stdout.replace(/\n/, '')
        })

      }

      if (stderr) res.json(null, stderr, 0)
      // console.log('msg:',stdout);
      // console.log('err:',stderr);
    })
    
    return
  }

  if(req.URL.pathname === '/stop'){
    let id = req.query.id;
    if(id){
      console.log('find id ' ,id);
      exec(`docker port ${id} 80`,(err, stdout)=>{
        console.log(err);
        if(stdout){
          let port = clean(stdout).split(':')[1];
          console.log('find port: ', port);

          if(port){
            http.request(`http://127.0.0.1:${port}/action?acname=stop`, {
              method: 'POST',
              timeout: 5000
            },res=>{
              res.on('end', () => {
                console.log('success close container ', id);
              });
              
            })
            res.json(null, 'done')
          }

          res.json(null, 'not valid id, no port', 0)

        }
        res.json(null, 'not valid id',0)
      })

      // res.json(null, 'done')
    }else{
      res.json(null, 'no id', 0)
    }
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

server.listen(8999,()=>{
  console.log('server listen on', 8999);
});


function clean(str){
  return str.replace('\n','')
}