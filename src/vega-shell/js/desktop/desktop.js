String.prototype.getIniValue = function (key) {
  var string = this;
  var match = string.match(key + '=(.*)');
  if(match !== null){
    return match[1];
  } else {
    return '';
  }
};

const execute = require('child_process').spawn;
const os = require('os');
const userInfo = require('user-info');
const fs = require('fs');
var displayLocked = false;
$('#hostname').html(userInfo()['username'] + '@' + os.hostname());
$('#time').html(getTime());
$('#arch').html(os.arch());
setInterval(function(){
  $('#time').html(getTime());
  $('big-clock').html(getBigClock());
},1000);
function getTime(){
  var time = new Date();
  var tfh = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
  return tfh;
}
function getBigClock(){
  return getTime()+' : '+getUptime();
}
function getUptime(){
  return os.uptime();
}
$('fingerprint').on('click',function(){
  if(displayLocked == false){
    lockScreen();
  } else if(displayLocked == true){
    unlockScreen();
  }
});

// fs.readdir('/usr/share/applications/',function(err,data){
//   for(i=0;i<data.length;i++){
//     var path = '/usr/share/applications/'+data[i];
//     var file = String(fs.readFileSync(path));
//     if(path.includes('.desktop')){
//       var name = file.getIniValue('Name');
//       var icon = file.getIniValue('Icon');
//       var exec = file.getIniValue('Exec');
//       console.log(name + ' ' + exec);
//     }
//   }
// });
$('bar-label[exec="xterm"]').click(function(){
  execute('xterm');
});
