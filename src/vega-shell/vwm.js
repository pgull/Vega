//
//     VEGA Window manager
//

var mainWindowPosition = $('window-frame.main window-frame-inner')[0].getBoundingClientRect();
var frameLeft = mainWindowPosition['left']+1;
var frameTop = mainWindowPosition['top']+29;
var frameWidth = mainWindowPosition['width']+1;
var frameHeight = mainWindowPosition['height']-29;
const child_process = require('child_process');
const spawn = require('child_process').spawn;
const x11 = require('x11');

//ev type 16 is a create notify

var activeWindowID = VGetShellID(); //for init
var shellID = VGetShellID();
var X, root;
x11.createClient(function(err,display){
  X = display.client;
  root = display.screen[0].root;
  X.ChangeWindowAttributes(root, {
        eventMask: x11.eventMask.StructureNotify | x11.eventMask.SubstructureNotify
    }, function(err) {
        if(err.error === 10) {
            console.log("Error: maybe another window manager had already ran?");
            process.exit(1);
        }
    });
    X.on('event', function(ev){
        if(ev.type == 16){
          VActivateWindow(ev.wid);
        }
    });
});
function VGetWindows(){
  var wids = VGetWindowIds();
  var names = VGetWindowNames();
  var titles = VGetWindowTitles();
  var windows = zip(wids,names,titles);
  return windows;
}
function VGetWindowTitles(){
  var titles = [];
  var wininfo = String(child_process.spawnSync('xwininfo', ['-root', '-tree']).stdout);
  var windowEntries = wininfo.match(/(0[xX][0-9a-fA-F]+.*)\n/g);
  for(i=0;i<windowEntries.length;i++){
        if(windowEntries[i].includes('(has no name)') == false && windowEntries[i].includes('(none)') == false && windowEntries[i].includes('  10x10') == false && windowEntries[i].includes('  1x1') == false && windowEntries[i].includes('()') == false){
              var title = windowEntries[i].match('0[xX][0-9a-fA-F]+ \"(.*)\":')[1];
              titles.push(title);
        }
      }
  return titles;
}
function VGetWindowIds(){
    var wids = [];
    var wininfo = String(child_process.spawnSync('xwininfo', ['-root', '-tree']).stdout);
    var windowEntries = wininfo.match(/(0[xX][0-9a-fA-F]+.*)\n/g);
    for(i=0;i<windowEntries.length;i++){
      if(windowEntries[i].includes('(has no name)') == false && windowEntries[i].includes('(none)') == false && windowEntries[i].includes('  10x10') == false && windowEntries[i].includes('  1x1') == false && windowEntries[i].includes('()') == false){
          var wid = parseInt(windowEntries[i].match('(0[xX][0-9a-fA-F]+)')[0]).toString(10);
          var hexd = windowEntries[i].match('(0[xX][0-9a-fA-F]+)')[0];
          wids.push(wid);
          }
        }
    return wids;
}
function VGetWindowNames(){
  var names = [];
  var wininfo = String(child_process.spawnSync('xwininfo', ['-root', '-tree']).stdout);
  var windowEntries = wininfo.match(/(0[xX][0-9a-fA-F]+.*)\n/g);
  for(i=0;i<windowEntries.length;i++){
        if(windowEntries[i].includes('(has no name)') == false && windowEntries[i].includes('(none)') == false && windowEntries[i].includes('  10x10') == false && windowEntries[i].includes('  1x1') == false && windowEntries[i].includes('()') == false){
              var name = windowEntries[i].match('\(".*" "(.*)"\)')[2];
              names.push(name);
        }
      }
  return names;
}
function VBringToFront(wid){
  VShowWindow(wid);
  X.SetInputFocus(wid);
  X.RaiseWindow(wid);
}
function VFocus(wid){
  X.SetInputFocus(wid);
}
function VHideWindow(wid){
  X.UnmapWindow(wid);
}
function VShowWindow(wid){
  X.MapWindow(wid);
}
function VHideAllWindows(){
  var windowList = VGetWindows();
  for(i=0;i<windowList.length;i++){
    if(windowList[i][1] != "vega-shell"){
      VHideWindow(windowList[i][0]);
    }
  }
}
function VResizeAllWindows(){
    var windowList = VGetWindows();
    console.log(windowList);
    for(i=0;i<windowList.length;i++){
      if(windowList[i][1] != "vega-shell"){
        console.log(windowList[i][0]);
        X.MoveResizeWindow(windowList[i][0],frameLeft,frameTop,frameWidth,frameHeight);
      }
    }
}
function VActivateWindow(wid){
  VHideAllWindows();
  VBringToFront(wid);
  VResizeAllWindows();
  activeWindowID = wid;
  var windowTitle = VGetWindowTitle(wid);
  var windowName = VGetWindowName(wid);
  $('window-title#window-title').html(windowTitle);
  $('bar-label#window-name').html(windowName);
}


function zip() {
    for (var i = 0; i < arguments.length; i++) {
        if (!arguments[i].length || !arguments.toString()) {
            return false;
        }
        if (i >= 1) {
            if (arguments[i].length !== arguments[i - 1].length) {
                return false;
            }
        }
    }
    var zipped = [];
    for (var j = 0; j < arguments[0].length; j++) {
        var toBeZipped = [];
        for (var k = 0; k < arguments.length; k++) {
            toBeZipped.push(arguments[k][j]);
        }
        zipped.push(toBeZipped);
    }
    return zipped;
}
function VGetShellID(){
  var windowList = VGetWindows();
  var shellid;
  for(i=0;i<windowList.length;i++){
    if(windowList[i][1] == "vega-shell"){
      shellid = windowList[i][0];
      return shellid;
    }
  }
}
function VGetWindowName(wid){
  var windowList = VGetWindows();
  var name;
  for(i=0;i<windowList.length;i++){
    if(windowList[i][0] == wid){
      name = windowList[i][1];
      return name;
    }
  }
}
function VGetWindowTitle(wid){
  var windowList = VGetWindows();
  var title;
  for(i=0;i<windowList.length;i++){
    if(windowList[i][0] == wid){
      title = windowList[i][2];
      return title;
    }
  }
}
$('workspace').on('mouseenter',function(){
  VFocus(activeWindowID);
});
$('workspace').on('mouseleave',function(){
  VFocus(shellID);
});
