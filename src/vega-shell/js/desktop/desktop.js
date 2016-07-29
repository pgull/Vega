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

$(document).on('click','window-frame',function(){
  $(this).effect('pulsate',{ times: 1 },200,function(){
    var speed = 300;
    VHideAllWindows();
    var switched = this;
    $('window-frame.main').effect('transfer', { to: $(this), className: 'ui-effects-transfer1' }, speed );
    $(this).effect('transfer', { to: $('window-frame.main') }, speed );
    $('window-frame.main').css('opacity',0);
    $(this).css('opacity',0);
    setTimeout(function(){
      VShowWindow(activeWindowID);
      $('window-frame.main').css('opacity',1);
      $(switched).css('opacity',1);
    },speed);
  });
});

function lockScreen(){
  $('main').css({'transform':'scale(.95)','opacity':0});
  $('window-frame').css({'transform':'scale(1.02)','opacity':0});
  VHideAllWindows();
  $('keyboard').hide('pulsate',{ times: 2 },200,function(){
    $('bar').hide('pulsate',{ times: 2 },200,function(){
        $('big-clock').css({'opacity':'1'});
        displayLocked = true;
    });
  });
}
function unlockScreen(){
  $('big-clock').css({'opacity':'0'});
  $('main').css({'transform':'scale(1)','opacity':1});
  $('bar').show('pulsate',{ times: 2 },200,function(){
    $('keyboard').show('pulsate',{ times: 2 },200,function(){
      $('window-frame').css({'transform':'scale(1)','opacity':1});
      VShowWindow(activeWindowID);
      displayLocked = false;
  });
    });
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
