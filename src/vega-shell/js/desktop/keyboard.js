$('k').unbind('mousedown').mousedown(function(){
  var val = $(this).html();
  // console.log(val);
  child_process.spawn('xdotool', ['type', val]);
});
