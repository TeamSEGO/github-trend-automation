var fs = require("fs");
var exec = require("child_process").exec;
var async = require("async");
var ProgressBar = require('progress');
var url = "https://github.com/TeamSEGO/github-trend-kr.git";
var tempGHDirName = "github_tmp";
var tempPath = __dirname + "/" + tempGHDirName;
var weeklyName;
var weeklyReadmeGHPath;
var newLine = "\n\r\n\r";
var github_cloneBar = new ProgressBar('clone[:bar]', { total: 50 });

var deleteDir = function(callback){
  exec( "rm -rf " + tempGHDirName, callback );
}
var clone = function(callback){
  var timer = setInterval(function () {
    github_cloneBar.tick();
    if (github_cloneBar.complete) {
      console.log('\ncomplete\n');
      clearInterval(timer);
    }
  }, 100)
  console.log("asf");
  exec("git clone "+ url +" "+ tempGHDirName, callback );
}
var cloneFromGithub = function( weeklyName, callback ){
  deleteDir(clone(function(){
    fs.readdir(tempPath + "/" + weeklyName, function(err,files){
      if(err)console.log(err);
      weeklyReadmeGHPath = weeklyName + "-README.md";
      fs.readFile( tempPath + "/" + weeklyName + "/README.md" , function (err, data) {
        fs.writeFileSync( weeklyReadmeGHPath , data );
        fs.appendFileSync( weeklyReadmeGHPath, newLine );
        async.eachSeries(files, function(file, cb){
          if(file=="README.md"){
            cb();
          }else{
            fs.readFile( tempPath + "/" + weeklyName + "/" +file , function (err, data) {
              if (err) throw err;
              fs.appendFileSync(weeklyReadmeGHPath, data );
              fs.appendFileSync(weeklyReadmeGHPath, newLine );
              cb();
            });
          }
        }. callback );
      });
    });
  }));
}

var pushToGitnsam = function( callback ){

}
var sendMessageToCellWe = function(){

}
var main = function(weeklyName){
  var callback = function(){ console.log("done"); }
  cloneFromGithub( weeklyName, function(){
    pushToGitnsam( function(){

    })
  } );
}

if( process.argv[2] == null ){
  console.log("parameter 를 빠트리셨네요. \n\r"
              +"usage : node gitnsam github_dir gitnsam_message");
}else{
  main(process.argv[2]);
}
