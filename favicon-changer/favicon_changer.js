/* usage: 
  var text = "1";
  var imageSrc = "favicon.png";
  var faviconChanger = new FavIconChanger();
  favIconChanger.changeFavicon(text,imageSrc);
*/
var FavIconChanger = function(){
  var lastKnownTextSize = 800;
  
  var findFavicon =function(){
      var link = document.querySelector("link[rel*='icon']") 
      if(link) {
        document.head.removeChild(link);
      } else {
        var link = document.createElement('link');
      }
      
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      return link;
  }

  this.changeFavicon = function (text, imgSrc) {
    var canvas = document.createElement('canvas');
    var ctx;
    var img = document.createElement('img');
    img.crossOrigin = "Anonymous";
    var link = findFavicon();
    if (canvas.getContext) {
      img.onload = function () {
        canvas.width = img.width; 
        canvas.height = img.height;
        ctx = canvas.getContext('2d');      
        ctx.drawImage(this, 0, 0);
        var fontSize=lastKnownTextSize;
        ctx.font = 'bold '+fontSize+'px "helvetica", sans-serif';
        while(ctx.measureText(text).width>Math.ceil((canvas.width/10)*8)){
            fontSize--;
            ctx.font = 'bold '+fontSize+'px "helvetica", sans-serif';
        }
        
        lastKnownTextSize = fontSize;  
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 0; 
        ctx.shadowOffsetY = 0; 
        ctx.shadowBlur = 5;
        var leftMargin = img.width/2;
        var topMargin = img.height/2;
        ctx.fillText(text, leftMargin, topMargin);
        link.href = canvas.toDataURL('image/png');
        document.head.append(link);
      };
      
      img.src = imgSrc;
    }
  };
}
