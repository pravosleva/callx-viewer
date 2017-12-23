"use strict";
var http = require('http'),
  iconvlite = require('iconv-lite'),
  port = 8080,
  domain = '127.0.0.1',
  fs = require('fs'),
  projectFolder = '.',
  //callxFolder = 'C:/Users/amstel/callx/allcalls', // not works
  callxFolder = './test-audio', // not works too
  path = require('path'),
  colors = require('colors'),
  url = require('url'),
  mime = require('mime');
function send404(res){
  res.writeHead(404, {"Content-Type": "text/plain"});
  res.write("Error 404: Resource not found");
  res.end();
};
function sendFile(response, filePath, fileContents){
	response.writeHead(200, {"Content-Type": mime.getType(path.basename(filePath))});
	response.end(fileContents);
};
function sendFilesList(response, pathToRead, query){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  var filesArr = fs.readdirSync(pathToRead);
  // needs to filter filesArr names by query.substr
  function areTheSubstrInStr(substr, str){
    str = encodeURIComponent(String(str).toLowerCase());substr = encodeURIComponent(String(substr).toLowerCase());
    if(str.indexOf(substr)!==-1){return true}else{return false};
  }
  var resultArr = filesArr.filter(function(item, index){
    return areTheSubstrInStr(query.substr, item);
  });

  resultArr = resultArr.map((item, index) => {
    return  '{"title": "' + item +'",' +
            '"mp3": "' + callxFolder + '/' + item + '"}'
  });
  response.writeHead(200, {"Content-Type": "text/plain"});
  //console.log("[" + resultArr.join(",") + "]");
	response.end("[" + resultArr.join(",") + "]");
}
var server = http.createServer((req, res) => {
  // query checking
  var urlParsed = url.parse(req.url, true);
  if(urlParsed.pathname === "/filter"){//console.log("filter detected urlParsed.query.substr=" + urlParsed.query.substr);
    sendFilesList(res, callxFolder, urlParsed.query);
    return;
  }
  // return pages & tools to Front-end:
  var filePath = false;

  switch(req.url){
    case "/": filePath = projectFolder + "/index.html"; break;
    default: filePath = projectFolder + req.url;
  };
	fs.exists(filePath, function(exists){
    console.log(colors.yellow(filePath));
		if(exists){
			fs.readFile(filePath, function(err, data){
				if(err){send404(res)}else{sendFile(res, filePath, data);}
			})
		}else{console.log(colors.red(req.url));send404(res);}
	});
});
server.listen(port, domain);
console.log(colors.inverse("Server running on http://" + domain + ":" + port));
