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

  let _checkTheSubstrInStr = (substr, str) => (str.indexOf(substr)!==-1);//received args= encoded strs
  function _checkTheSubstrByWords (wordsAsSubstr, str) {
    //console.log(`RECEIVED: str= ${str}, wordsAsSubstr= ${wordsAsSubstr}`);
    str = encodeURIComponent(String(str).toLowerCase());
    wordsAsSubstr = encodeURIComponent(String(wordsAsSubstr).toLowerCase());
    //console.log(`ENCODED: str= ${str}, wordsAsSubstr= ${wordsAsSubstr}`);
    var flag = false;
    let words = wordsAsSubstr.split("%20"),
      _flags = [];
    console.log(words);
    words.map( function (wrd, i, wrdsArr) {
      // Global flag as result
      flag = _checkTheSubstrInStr (wrd, str);
      // Array of results
      _flags[i] = _checkTheSubstrInStr (wrd, str);
    }, this);
    if (_flags.indexOf ( false ) !== -1) flag = false;
    return flag;
  }
  var resultArr = filesArr.filter(function(item, index){
    return _checkTheSubstrByWords (query.substr, item);
  });

  resultArr = resultArr.map((item, index) => {
    return  '{"title": "' + item +'",' +
            '"mp3": "' + callxFolder + '/' + item + '"}'
  });
  response.writeHead(200, {"Content-Type": "text/plain"});
  //console.log("[" + resultArr.join(",") + "]");
	response.end("[" + resultArr.join(",") + "]");
}
function removeFile(response, pathToRead, query){
  let { fileName } = query;
  fileName = decodeURIComponent(fileName).replace('&amp;', '&');
  //console.log(`REMOVE FILE CALLED FOR: ${fileName}`);
  fs.exists(pathToRead, function(exists){
		if(exists){
			//console.log(colors.green(`FILE EXISTS: ${pathToRead}`));
      fs.unlink((pathToRead + '/' + fileName), function(err){
        if(err) {
          console.log(colors.red(`${err}`));
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.end(`${err}`);
          return;
        }
        else {
          //console.log(colors.green('File deleted successfully.'));
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.end(`${fileName} removed successfully.`);
          return;
        }
      });
		}else{
      console.log(colors.red(`FILE DOES NOT EXISTS: ${pathToRead}`));
      // Send to Front-end...
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.end(`${fileName} does not exists!`);
    }
	});
  //...
}
var server = http.createServer((req, res) => {
  // query checking
  var urlParsed = url.parse(req.url, true);
  switch(urlParsed.pathname){
  case '/filter':
    sendFilesList(res, callxFolder, urlParsed.query);
    return;
  case '/removeFile':
    removeFile(res, callxFolder, urlParsed.query);
    return;
  default: break;
  }

  // return pages & tools to Front-end:
  var filePath = false;
  switch(req.url){
    case "/": filePath = projectFolder + "/index.html"; break;
    default: filePath = projectFolder + req.url;
  };
  filePath = decodeURIComponent(filePath);
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
