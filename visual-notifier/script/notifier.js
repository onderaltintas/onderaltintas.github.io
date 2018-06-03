var NotifierOrientations = 
{
  // Notification orientation
  Vertical : "vertical",
  Horizontal : "horizontal"
}

var NotificationTypes =
{
  // Notification types
  Loading : "loading",
  ConnectionError : "connectionError",
  Download : "download",
  DownloadError : "downloadError"
}

var Notifier = function(orientation)
{
  var orientation = orientation || NotifierOrientations.Horizontal;
 
  this.initialize = function()
  {
    var notificationElement = "<div class='notifier'><div class='notification download'></div><div class='notification downloadError'></div><div class='notification connectionError'></div><div class='notification loading'></div></div>";
    if(orientation === NotifierOrientations.Vertical)
    {
      notificationElement = "<div class='notifier'><div class='notification download'></div><br/><div class='notification downloadError'></div><br/><div class='notification connectionError'></div><br/><div class='notification loading'></div><br/></div>";  
    }
    
    document.body.innerHTML += notificationElement;
  }
  
  this.show = function(notificationType)
  {
    var notifierElement = document.getElementsByClassName("notifier");
    if(!notifierElement.length)
    {
      this.initialize();
    }
    
    var element = document.getElementsByClassName(notificationType)[0];
    if(!element)
    {
      return false;
    }
    
    element.classList.add("notificationVisible");
  }
  
  this.hide = function(notificationType)
  {
    var element = document.getElementsByClassName(notificationType)[0];
    if(!element)
    {
      return false;
    }
    
    element.classList.remove("notificationVisible");
  }
}

