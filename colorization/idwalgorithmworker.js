 onmessage = function(message){
   
    var interpolatedMatrix = interpolateToMatrix(message.data);
    postMessage(interpolatedMatrix);
 }
 
 /**
  * Does idw calculation and calculates unknown pixels and places to value matrix.
  * @param {point[]} controlPointsRelative - Points that have known values and x,y coordinates relative to canvas. 
  * @param {number} widthPx - Width of required interpolated canvas.
  * @param {number} heightPx - Height of required interpolated canvas.
  * @returns {number[][]} Interpolated canvas object with value matrix.
  */  
  var interpolateToMatrix = function(interpolationParameters)
  {
    var widthPx = interpolationParameters.widthPx;
    var heightPx = interpolationParameters.heightPx;
    var controlPointsRelative = interpolationParameters.controlPointsRelative;
    var radius = interpolationParameters.radius;
    var power = interpolationParameters.power;
    var minVal = interpolationParameters.minVal;
    var maxVal = interpolationParameters.maxVal;
    var valueMatrix = createArray(widthPx, heightPx);
    for (var i = 0; i < widthPx; i++)
    {
      for (var j = 0; j < heightPx; j++)
      {
        var wj = 0;
        var wis = [];
        var uSum = 0;
        for (var k = 0; k < controlPointsRelative.length; k++)
        {
          if(controlPointsRelative[k].x === i && controlPointsRelative[k].y === j)
          {
            valueMatrix[i][j] = controlPointsRelative[k].value;
            break;
          }
          
          var dx = controlPointsRelative[k].x - i;
          var dy = controlPointsRelative[k].y - j;
          var dk = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)); //distance
          if(dk<radius)
          {
            var wj_inst = 1 / (Math.pow(dk, power))
            wj += wj_inst;
            wis.push(wj_inst * controlPointsRelative[k].value);
          }
        }
        
        var u = 0;
        for (var l = 0; l < wis.length; l++)
        {
          u += wis[l] / wj;
        }
        
        minVal = (u < minVal)? u : minVal;
        maxVal = (u > maxVal)? u : maxVal;
        valueMatrix[i][j] = u;
      }
    }
    
    valueMatrix.minVal = minVal;
    valueMatrix.maxVal = maxVal;
    return valueMatrix;
  }
  
  /**
  * Creates n dimensional arrays. F.e. createArray(3,2) will create width:3, height:2 array.
  * @param {params} length - Canvas object that has latMin, lonMin, latMax, lonMax coordinates. 
  * @returns {Array[]} An array which is n dimensional.
  */  
  var createArray = function(length) {
    var arr = new Array(length || 0),
    i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
  }