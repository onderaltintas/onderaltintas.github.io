var notifier;
  
var run = function(){
  notifier = new Notifier(NotifierOrientations.Horizontal);
  notifier.initialize();
  doNotifications();
}

var doNotifications = function()
{
  setTimeout(function(){
    notifier.show(NotificationTypes.Loading);
  },100);
  
  setTimeout(function(){
    notifier.show(NotificationTypes.ConnectionError);
  },500);
  
  setTimeout(function(){
    notifier.show(NotificationTypes.Download);
  },800);
  
  setTimeout(function(){
    notifier.show(NotificationTypes.DownloadError);
  },1200);
  
  setTimeout(function(){
    notifier.hide(NotificationTypes.Loading);
  },2500);
  
  setTimeout(function(){
    notifier.hide(NotificationTypes.ConnectionError);
  },5500);
  
  setTimeout(function(){
    notifier.hide(NotificationTypes.Download);
  },6000);
  
  setTimeout(function(){
    notifier.hide(NotificationTypes.DownloadError);
  },7000);
  
  setTimeout(function(){
    doNotifications();
  }, 9000);
}


run();