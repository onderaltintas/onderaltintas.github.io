var Test = function()
{
  this.idwTest = function()
  {
    var colorManager = new ColorManager(ColorManagerTypes.Continuous);
    var widthPx = document.getElementById("WidthPx").value || 1500; 
    var heightPx = document.getElementById("HeightPx").value || 1500; 
    var searchRadius = document.getElementById("SearchRadius").value || 99999;
    var power = document.getElementById("Power").value || 3;
    var numberOfControlPoints = document.getElementById("ControlPoints").value || 100;
    var controlPoints = [];
    // Creating randomize points.
    var minVal = 0;
    var maxVal = 100;
    var geographicBounds = {latMin:36, lonMin:26, latMax:42, lonMax:45}
    for(var i = 0; i < numberOfControlPoints; i++)
    {
      var controlPoint = {
        lon: Math.random() * (geographicBounds.lonMax-geographicBounds.lonMin) + geographicBounds.lonMin,
        lat: Math.random() * (geographicBounds.latMax-geographicBounds.latMin) + geographicBounds.latMin,
        value: Math.random() * (maxVal - minVal) + minVal
      }
      
      controlPoints.push(controlPoint);
    }
    
    
    colorManager = applyColorset3(colorManager, minVal, maxVal);
    var idwManager = new IDWManager(colorManager);
    idwManager.setRadius(searchRadius);
    idwManager.setPower(power);
    //sync method usage:
    /*
    var startTime = (new Date()).getTime();
    var canvas = idwManager.createIDW(controlPoints, geographicBounds, widthPx, heightPx);
    document.body.appendChild(canvas)
    var endTime = (new Date()).getTime();
    document.getElementById("differenceTimeDiv").innerHTML="<div>Process time in second:"+((endTime - startTime)/1000)+"seconds</div>";
    */
    //async method usage:

    var startTime = (new Date()).getTime();
    document.getElementById("startTimeDiv").innerHTML="<div>Starting time in ms:"+startTime+"</div>";
    idwManager.createIDWAsync(controlPoints, geographicBounds, widthPx, heightPx,function(canvas)
    {
      document.getElementById("canvasDiv").innerHTML = "";
      document.getElementById("canvasDiv").appendChild(canvas);
      var endTime = (new Date()).getTime();
      document.getElementById("endTimeDiv").innerHTML="<div>End time in ms:"+endTime+"</div>";      
      document.getElementById("differenceTimeDiv").innerHTML="<div>Process time in second:"+((endTime - startTime)/1000)+"seconds</div>";
    });
  }
  
  var applyColorset1 = function(colorManager, minVal, maxVal){
    var minColor = new ColorWithValue(51,255,255,1,minVal);
    var maxColor = new ColorWithValue(255,0,0,1,maxVal);
    colorManager.addColor(minColor);
    colorManager.addColor(maxColor);
    return colorManager;
  }
  
  var applyColorset2 = function(colorManager, minVal, maxVal){
    var minColor = new ColorWithValue(222,235,248,1,minVal);
    var maxColor = new ColorWithValue(4,46,109,1,maxVal);
    colorManager.addColor(minColor);
    colorManager.addColor(maxColor);
    return colorManager;
  }
  
  var applyColorset3 = function(colorManager, minVal, maxVal){
    var minColor = new ColorWithValue(0,0,255,1,(maxVal + minVal)/2);
    var min2Color = new ColorWithValue(255,0,255,1,(maxVal + (minVal*2))/3);
    var midColor = new ColorWithValue(0,255,0,1,((maxVal*2) + minVal)/3);
    var mid2Color = new ColorWithValue(255,255,0,1,((maxVal*3) + minVal)/4);
    var maxColor = new ColorWithValue(255,0,0,1,maxVal);
    colorManager.addColor(minColor);
    colorManager.addColor(min2Color);
    colorManager.addColor(midColor);
    colorManager.addColor(mid2Color);
    colorManager.addColor(maxColor);
    return colorManager;
  }
  
  var applyColorset4 = function(colorManager, minVal, maxVal){
    colorManager = new ColorManager(ColorManagerTypes.Classified);
    var colorStep = (maxVal - minVal)/10;
    var colors = [];
    colors.push(new ColorWithValue(0,0,0,1,minVal + colorStep*0));
    colors.push(new ColorWithValue(0,0,255,1,minVal + colorStep*1));
    colors.push(new ColorWithValue(0,75,175,1,minVal + colorStep*2));
    colors.push(new ColorWithValue(0,125,125,1,minVal + colorStep*3));
    colors.push(new ColorWithValue(0,175,75,1,minVal + colorStep*4));
    colors.push(new ColorWithValue(0,255,0,1,minVal + colorStep*5));
    colors.push(new ColorWithValue(75,175,0,1,minVal + colorStep*6));
    colors.push(new ColorWithValue(125,125,0,1,minVal + colorStep*7));
    colors.push(new ColorWithValue(175,75,0,1,minVal + colorStep*8));
    colors.push(new ColorWithValue(255,0,0,1,minVal + colorStep*9));
    colors.push(new ColorWithValue(255,0,0,1,minVal + colorStep*10));
    colors.push(new ColorWithValue(0,0,0,1,minVal + colorStep*11));
    
    for(var i = 0; i < colors.length; i++)
    {
      colorManager.addColor(colors[i]);
    }
    
    return colorManager;
  }
}

var test = new Test();
document.getElementById("runAnalysis").onclick = function(){test.idwTest();};


