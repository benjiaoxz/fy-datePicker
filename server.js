var PORT = 8888;    //监听端口

//支持的类型
var mime = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

var http = require('http');
var url = require("url");
var path = require("path");
var fs = require("fs");

http.createServer(function(request, response) {

    var pathname = url.parse(request.url).pathname;
    var realPath = __dirname + pathname;

    fs.exists(realPath, function(exists) {
        if (!exists) {
            response.writeHead(404, {'Content-Type': mime.html});
            response.write("<h2>404 not found</h2><p>This request URL " + pathname + " was not found on this server.</p>");
            response.end();
        } else {
            
            //如果是目录，重定向到这个目录下面的index.html中
            var stat = fs.lstatSync(realPath);
            if(stat.isDirectory()) {
                response.writeHead(301, {Location: pathname + 'index.html'});
                response.end();
            } else {
                var ext = path.extname(realPath);
                ext = ext ? ext.slice(1) : 'unknown';
                var contentType = mime[ext] || "text/plain";

                fs.readFile(realPath, "binary", function(err, file) {
                    if (err) {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end(err);
                    } else {
                        response.writeHead(200, {'Content-Type': contentType});
                        response.write(file, "binary");
                        response.end();
                    }
                 });
            }
          }
      });
    
      console.log('request resource at: ' + pathname);
}).listen(PORT);

console.log('Server runing at port: ' + PORT + '.');