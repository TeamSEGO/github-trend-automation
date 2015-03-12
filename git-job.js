var fs = require("fs");
var exec = require("child_process").exec;
var async = require("async");
var ncp = require('ncp').ncp;
var ProgressBar = require('progress');
var gh_url = "https://github.com/TeamSEGO/github-trend-kr.git";
var gs_url = process.env["gitnsam"] +"/lego/github-trend-kr.git"
var tempGHDirName = "github_tmp";
var tempGSDirName = "gitnsam_tmp";
var tempGHPath = __dirname + "/" + tempGHDirName;
var tempGSPath = __dirname + "/" + tempGSDirName;
var weeklyName;
var weeklyReadmeGHPath;
var weeklyReadmeGSPath;
var newLine = "\n\r\n\r";
var github_cloneBar = new ProgressBar('clone from github :bar', { complete: '*',incomplete: ' ',total: 50 });
var gitnsam_cloneBar = new ProgressBar('clone from gitnsam :bar', { complete: '*',incomplete: ' ',total: 50 });
var timerGH,timerGS;
var deleteGHDir = function(callback){
  exec( "rm -rf " + tempGHDirName, callback );
}
var deleteGSDir = function(callback){
  exec( "rm -rf " + tempGSDirName, callback );
}
var cloneGH = function(callback){
  timerGH = setInterval(function () {
    github_cloneBar.tick();
    if (github_cloneBar.complete) {
      console.log('\ncomplete\n');
      clearInterval(timerGH);
    }
  }, 2000)
  exec("git clone "+ gh_url +" "+ tempGHDirName, callback );
}
var cloneFromGithub = function( weeklyName, callback ){
  deleteGHDir(cloneGH(function(){
    github_cloneBar.terminate ();
    clearInterval(timerGH);
    fs.readdir(tempGHPath + "/" + weeklyName, function(err,mFiles){
      if(err)console.log(err);
      console.log( mFiles );
      weeklyReadmeGHPath = weeklyName + "-README.md";
      fs.readFile( tempGHPath + "/" + weeklyName + "/README.md" ,
        function (err, data) {
        fs.writeFileSync( weeklyReadmeGHPath , data );
        fs.appendFileSync( weeklyReadmeGHPath, newLine );
        async.eachSeries(mFiles, function(mfile, cb){
          if(mfile == "README.md"){
            cb();
          }else{
            fs.readFile( tempGHPath + "/" + weeklyName + "/" +mfile ,
              function (err, data) {
                if (err) throw err;
                fs.appendFileSync(weeklyReadmeGHPath, data );
                fs.appendFileSync(weeklyReadmeGHPath, newLine );
                cb();
            });
          }
        }, callback );
      });
    });
  }));
}
var cloneGS = function(callback){
  timerGS = setInterval(function () {
    gitnsam_cloneBar.tick();
    if (gitnsam_cloneBar.complete) {
      clearInterval(timerGS);
    }
  }, 2000)
  exec("git clone "+ gs_url +" "+ tempGSDirName, callback );
}
var cloneFromGitnSam = function( weeklyName, callback ){
  deleteGSDir(cloneGS(function(){
    gitnsam_cloneBar.terminate ();
    clearInterval(timerGS);
    callback();
  }));
}

var pushToGitnsam = function( weeklyName, callback ){
  console.log("push start");
  var num = (parseInt(weeklyName.substr(0,3))-1);
  num = num<10?"00"+num:(num<100?"0"+num:num);
  var backupName = num + "-backup.md";
  console.log(backupName);
  //image copy
  ncp( tempGHPath + "/img", tempGSPath + "/img", {clobber:true},function (err) {
    console.log("img copied");
    if (err) {return console.error(err);}
    //replace file
    fs.rename(tempGSPath + "/README.md",tempGSPath +"/" +backupName,  function(){
     console.log("README renamed");
     //file replace img-->raw/master..
     modifyREADMEmd( weeklyName+"-README.md", function(){
       console.log("img path chaged");
       //copy README
       fs.createReadStream(weeklyName+"-README.md").pipe(fs.createWriteStream( tempGSPath + '/README.md'));
       //git push
       exec("git add -A",
            { cwd: __dirname+"/gitnsam_tmp"},
              function(error, stdout, stderr){
         console.log("git add");
         if(error)console.log(error);
         if(stdout)console.log(stdout);
         if(stderr)console.log(stderr);
         exec("git commit -m \""+weeklyName+" automation sumpup\"",
              { cwd: __dirname+"/gitnsam_tmp"},
              function(error, stdout, stderr){
           if(error)console.log(error);
           if(stdout)console.log(stdout);
           if(stderr)console.log(stderr);
           exec("git push origin master",
                { cwd: __dirname+"/gitnsam_tmp"},
                function(error, stdout, stderr){
             if(error)console.log(error);
             if(stdout)console.log(stdout);
             if(stderr)console.log(stderr);
           });
         });
       });
     });
   })
 });
}
var modifyREADMEmd = function( fileName , callback){
  //( ../img-->../raw/master/img )
  fs.readFile(fileName, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/..\/img/g,"../raw/master/img");
    fs.writeFile("temp_" + fileName, result, 'utf8', function (err) {
       if (err) return console.log(err);
       fs.unlink(fileName, function(err){
         if (err) return console.log(err);
         fs.rename("temp_" + fileName, fileName, function(err){
           if (err) return console.log(err);
           callback();
         });
       });

    });
  });

}
var sendMessageToCellWe = function(){

}
var main = function( command, weeklyName ){
  console.log("you selected '" + command+"' and '"+ weeklyName+"'");
  var callback = function(){ console.log("done"); }
  if( command == "gh-down" ){
    cloneFromGithub( weeklyName, callback );
  }else if( command == "gs-down" ){
    cloneFromGitnSam( null, callback );
  }else if( command == "mv-push" ){
    pushToGitnsam(weeklyName, callback);
  }else if( command == "modifyMD" ){
    modifyREADMEmd(weeklyName, callback);
  }else if( command == "all" ){
    cloneFromGithub( weeklyName, function(){
      cloneFromGitnSam(null, function(){
          pushToGitnsam(weeklyName, callback);
      })
    } );
  }
}

if( process.argv[2] == null || process.argv[3] == null){
  console.log("parameter 를 빠트리셨네요. \n\r"
              +"usage : node git-job ( gh-down, gs-down, mv-push, modifyMD, all ) github_dir");
}else{
  main(process.argv[2], process.argv[3]);
}
