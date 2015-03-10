var fs = require("fs");
var clone = require("nodegit").Clone.clone;
var exec = require('child_process').exec;
var concat = require('concat-files');
var url = "https://github.com/TeamSEGO/github-trend-kr.git";
var tempDirName = "tmp";
var tempPath = __dirname + "/" + tempDirName;
var targetDir;

var deleteDir = function(callback){
  exec( "rm -rf " + tempDirName, callback );
}

var clone = function(callback){
  exec('git clone '+ url +' '+ tempDirName, callback );
}
var main = function(targetDir){
  deleteDir(clone(function(){
    fs.readdir(tempPath + "/" + targetDir, function(err,files){
      if(err)console.log(err);
      console.log( files );
      concat(files,'sumReadme.md', function(){
        console.log("done");
      });
    });
  }));
}
if(process.argv[2] == null ){
  console.log("parameter 를 넣어주세요");
}else{
  main(process.argv[2]);
}
