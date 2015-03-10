var fs = require("fs");
var clone = require("nodegit").Clone.clone;
var url = "https://github.com/TeamSEGO/github-trend-kr.git";
var tempDirName = "tmp";
var tempPath = __dirname + "/" + tempDirName;
// Clone a given repository into a specific folder.
var cloning = function(){
  clone(url, tempDirName, { ignoreCertErrors: 1 })
  .then(function(repo) {
    fs.readdir(tempPath+"/", function(err,files){
      console.log(files);
    });
    return null;
  })
  .catch(function(err) { console.log(err); });
}

fs.rmdir(tempPath, cloning );
