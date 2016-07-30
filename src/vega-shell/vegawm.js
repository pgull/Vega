const child_process = require('child_process');
const spawn = require('child_process').spawn;
const x11 = require('x11');
var X, root;
var mainWindowPosition = $('window-frame-main window-frame-inner')[0].getBoundingClientRect();
var frameLeft = mainWindowPosition['left'] + 1;
var frameTop = mainWindowPosition['top'] + 29;
var frameWidth = mainWindowPosition['width'] + 1;
var frameHeight = mainWindowPosition['height'] - 29;
var activeWindowID = 0;
var shellid = VGetShellID();

//
//Main library of functions.
//

x11.createClient(function(err, display) {
    X = display.client;
    root = display.screen[0].root;
    X.ChangeWindowAttributes(root, {
        eventMask: x11.eventMask.StructureNotify | x11.eventMask.SubstructureNotify
    });
    X.on('event', function(ev) {
        if (ev.type == 16) { //create
            VLoadWindow(ev.wid);
        }
        if (ev.type == 17) { //destroy
            VUnloadWindow(ev.wid);
        }
    });
});

function VLoadWindow(wid) {
    var windowTitle = VGetWindow('title', wid);
    var windowName = VGetWindow('name', wid);
    $('window-list').append('<window-frame wid="' + wid + '"><window-frame-inner><window-title>' + windowName + ' | ' + windowTitle + '</window-title></window-frame-inner></window-frame>');
    VActivateWindow(wid);
}

function VUnloadWindow(wid) {
    var firstWindow = $('window-frame:eq(0)').attr('wid');
    var secondWindow = $('window-frame:eq(1)').attr('wid');
    $('window-frame[wid="' + wid + '"]').remove();
    if(firstWindow == undefined){

    } else if (firstWindow == wid){
      VActivateWindow(secondWindow);
    } else {
      VActivateWindow(firstWindow);
    }
}

function VActivateWindow(wid) {
    if (wid == 0) {
        X.SetInputFocus(shellid);
    } else {
        activeWindowID = wid;
        X.MoveResizeWindow(wid, frameLeft, frameTop, frameWidth, frameHeight);
        X.RaiseWindow(wid);
        $('window-frame').css({
            'border': '2px solid #31505f'
        });
        $('window-frame[wid="' + wid + '"]').css({
            'border': '2px solid #97dde5'
        });
    }
}

function VUpdateNames() {

}

//VGetWindows('ids') VGetWindows('titles') VGetWindows('names')
function VGetWindows(arg) {
    var match;
    var index;
    var attrs = [];
    if (arg == 'titles') {
        match = '0[xX][0-9a-fA-F]+ \"(.*)\":';
        index = 1;
    } else if (arg == 'ids') {
        match = '(0[xX][0-9a-fA-F]+)';
        index = 0;
    } else if (arg == 'names') {
        match = '\(".*" "(.*)"\)';
        index = 2;
    } else if (arg == null) {
        var wids = VGetWindows('ids');
        var names = VGetWindows('names');
        var titles = VGetWindows('titles');
        var windows = zip(wids, names, titles);
        return windows;
    }
    var wininfo = String(child_process.spawnSync('xwininfo', ['-root', '-tree']).stdout);
    var windowEntries = wininfo.match(/(0[xX][0-9a-fA-F]+.*)\n/g);
    for (i = 0; i < windowEntries.length; i++) {
        if (windowEntries[i].includes('(has no name)') == false && windowEntries[i].includes('(none)') == false &&
            windowEntries[i].includes('  10x10') == false && windowEntries[i].includes('  1x1') == false &&
            windowEntries[i].includes('()') == false) {
            if (arg != 'ids') {
                var attr = windowEntries[i].match(match)[index];
                attrs.push(attr);
            } else {
                var attr = parseInt(windowEntries[i].match(match)[index]).toString(10);
                attrs.push(attr);
            }
        }
    }
    return attrs;
}

//VGetWindow('title',wid) VGetWindow('name',wid)
function VGetWindow(arg, wid) {
    var windowList = VGetWindows();
    var index;
    if (arg == 'title') {
        index = 2;
    } else if (arg == 'name') {
        index = 1;
    }
    for (i = 0; i < windowList.length; i++) {
        if (windowList[i][0] == wid) {
            var attr = windowList[i][index];
            return attr;
        }
    }
}

function VGetShellID() {
    var windowList = VGetWindows();
    var shellid;
    for (i = 0; i < windowList.length; i++) {
        if (windowList[i][1] == "vega-shell") {
            shellid = windowList[i][0];
            return shellid;
        }
    }
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

//
//  DOM Interaction
//

$(document).on('click', 'window-frame', function() {
    VActivateWindow($(this).attr('wid'));
});

function lockScreen() {
    $('main').css({
        'transform': 'scale(.95)',
        'opacity': 0
    });
    $('window-frame-main').css({
        'transform': 'scale(1.02)',
        'opacity': 0
    });
    X.RaiseWindow(shellid);
    $('keyboard').hide('pulsate', {
        times: 2
    }, 200, function() {
        $('bar').hide('pulsate', {
            times: 2
        }, 200, function() {
            $('big-clock').css({
                'opacity': '1'
            });
            displayLocked = true;
        });
    });
}

function unlockScreen() {
    $('big-clock').css({
        'opacity': '0'
    });
    $('main').css({
        'transform': 'scale(1)',
        'opacity': 1
    });
    $('bar').show('pulsate', {
        times: 2
    }, 200, function() {
        $('keyboard').show('pulsate', {
            times: 2
        }, 200, function() {
            $('window-frame-main').css({
                'transform': 'scale(1)',
                'opacity': 1
            });
            VActivateWindow(activeWindowID);
            displayLocked = false;
        });
    });
}
$('workspace').on('mouseenter', function() {
    X.SetInputFocus(activeWindowID);
});
$('workspace').on('mouseleave', function() {
    X.SetInputFocus(shellid);
});
