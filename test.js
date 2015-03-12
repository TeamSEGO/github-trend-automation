var exec = require("child_process").exec;
console.log(process.env["gitnsam"] + "\n\r","url");
var filename ="117_201503-weekly-README.md";
var num = parseInt(filename.substr(0,filename.indexOf("_")))-1;
console.log(num<10?"00"+num:(num<100?"0"+num:num));

var temp = "Hello ../img, would you like some ../img";

temp = temp.replace(/..\/img/g,"../asdf/sadf");
temp = temp.replace("%DRINK%","tea");
console.log(temp);
console.log(__dirname);
exec("git status", { cwd: __dirname+"/gitnsam_tmp"},function(error, stdout, stderr){
  console.log(error,stdout,stderr);

} );
