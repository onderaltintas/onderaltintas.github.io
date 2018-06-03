window.onload = function(){
   
  /*touch events to mouse events for mobile*/
  function touchHandler(event)
  {
      var touches = event.changedTouches,
          first = touches[0],
          type = "";
      switch(event.type)
      {
          case "touchstart": type = "mousedown"; break;
          case "touchmove":  type = "mousemove"; break;        
          case "touchend":   type = "mouseup";   break;
          default:           return;
      }

      // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
      //                screenX, screenY, clientX, clientY, ctrlKey, 
      //                altKey, shiftKey, metaKey, button, relatedTarget);

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                    first.screenX, first.screenY, 
                                    first.clientX, first.clientY, false, 
                                    false, false, false, 0/*left*/, null);

      first.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
  }

  function init() 
  {
      document.addEventListener("touchstart", touchHandler, true);
      document.addEventListener("touchmove", touchHandler, true);
      document.addEventListener("touchend", touchHandler, true);
      document.addEventListener("touchcancel", touchHandler, true);    
  }
  init();
/**/
  var w = window.innerWidth;
  var h = window.innerHeight;
  var rect = document.getElementById("r1");
  var rW = rect.offsetWidth;
  var rH = rect.offsetHeight;
  var x, y;
  var mouseDown = false;
  
  var winRectangle = document.getElementById("r2");
  var winX = winRectangle.getBoundingClientRect().left + winRectangle.offsetWidth/2;
  var winY = winRectangle.getBoundingClientRect().top + winRectangle.offsetHeight/2;
  // On mousemove use event.clientX and event.clientY to set the location of the div to the location of the cursor:
  window.addEventListener('mousemove', function(event){
      x = event.clientX;
      var shadowLeft = 20 + Math.round(-40*(x/w))
      y = event.clientY;                    
      var shadowTop = 20 + Math.round(-40*(y/h))
      if ( typeof x !== 'undefined' ){
        var newX = x - rW/2 < 0? 0 : x + rW/2 > w? w - rW : x - rW/2;
        var newY = y - rH/2 < 0? 0 : y + rH/2 > h? h - rH : y - rH/2;
          rect.style.left = newX + "px";
          rect.style.top = newY + "px";
          if(mouseDown){
            rect.style.boxShadow = "0px 0px 0px rgba(0,0,0,0.8)";
            rect.style.backgroundColor = "rgba(245,245,245,1)";
            if(x < winX + 5 && x > winX - 5 && y < winY + 5 && y > winY - 5) {
              rect.style.left = (newX +(winX-x)) + "px";
              rect.style.top = (newY +(winY-y)) + "px";
              gratz();
            }
            
            return;
          }
          
          rect.style.boxShadow = shadowLeft + "px "+shadowTop+"px 40px rgba(0,0,0,0.8)";
          rect.style.backgroundColor = "rgba(255,255,255,1)";
      }
  }, false);

  window.addEventListener('mouseup', function(event){
    mouseDown = false;
  }, false);
 
  window.addEventListener('mousedown', function(event){
    mouseDown = true;
  }, false);
}

function gratz(){
  setTimeout(function(){
    document.body.innerHTML = '<iframe style="width:100%;height:100%;" src="https://www.youtube-nocookie.com/embed/f4J35f1aaU4?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
  },1000);
}