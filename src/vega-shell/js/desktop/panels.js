Element.prototype.panelClose = function () {
  var height = $(this).innerHeight();
  var collapse = -height+38;
  console.log(collapse);
  $(this).css('bottom',collapse+'px');
};
Element.prototype.panelOpen = function () {
  var height = $(this).innerHeight();
  $(this).css('bottom','0px');
};
function setPanels(){
  $('panel').each(function(i){
    if($(this)[0].getAttribute('open') == 'true'){
      $(this)[0].panelOpen();
    } else {
      $(this)[0].panelClose();
    }
  });
}
setPanels();
$(document).on('click','bar-tab',function(){
  var parentPanel = $(this).parent().parent();
  var parentBar = $(this).parent();
  var bool = 0;
  if($(this).hasClass('active') == true){
    $(this).removeClass('active');
    $(parentBar).children('bar-tab').each(function(){
      if($(this).hasClass('active') == true){
        bool += 1;
      }
    });
    if(bool == 0){
      $(parentPanel)[0].panelClose();
    }
  }else{
    $(parentBar).children('bar-tab').removeClass('active');
    $(this).addClass('active');
    $(parentPanel)[0].panelOpen();
  }
});
