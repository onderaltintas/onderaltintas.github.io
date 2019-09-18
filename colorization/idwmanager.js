/**
 * Creates an instance of IDWManager.
 * @class
 * @classdesc For inverse distance weighting interpolation, results picture interpolated.
 * interpolateToCanvas function is based on drawRaster function of Darren Wiens at https://darrenwiens.wordpress.com/tag/idw/
 * @param {ColorManager} colorManager - Color manager object which helps colorization of raster.
 * @param {string[]} colors - Hexadecimal color array. Optional. If set, idwManager divides value between max and min then apply colors to given color manager.
 * Önder ALTINTAŞ 16.08.2016
 * Note: Thanks to web workers, it is not locking the ui thread anymore!!!! (18.09.2019)
 */
var IDWManager = function(colorManager)
{
  var _colorManager = colorManager;
  var _radius = 9999999;
  var _power = 3;
  var _maxVal;
  var _minVal;
  var _idwAlgorithmWorker = new Worker("idwalgorithmworker.js");

  /**
  * Sets the search radius.
  * @param {number} radius - Radius parameter to set radius.
  */  
  this.setRadius = function(radius)
  {
    _radius = radius;
  }
  
  /**
  * Sets the id power parameter.
  * @param {number} power - Power parameter to set radius.
  */  
  this.setPower = function(power)
  {
    _power = power;
  }
  
  /**
  * Does idw interpolation and serves an interpolated canvas.
  * @param {point[]} controlPoints - Points that have known values. Should have lat, lon and value properties.
  * @param {bounds} geographicBounds - Bounds of the canvas in geographichal coordinates.
  * @param {number} widthPx - Width of required interpolated canvas.
  * @param {number} heightPx - Height of required interpolated canvas.
  * @param {function} callback - A callback function to execute after process is done, sends canvas object to function.
  * @returns {canvas} Interpolated canvas object with value matrix.
  */  
  this.createIDW = function(controlPoints, geographicBounds, widthPx, heightPx, callback)
  {
    _maxVal = Number.MIN_VALUE;
    _minVal = Number.MAX_VALUE;
    var canvasWithCoords = createCanvasWithCoords(geographicBounds.latMin, geographicBounds.lonMin, geographicBounds.latMax, geographicBounds.lonMax, widthPx, heightPx);
    var controlPointsRelative = [];
    for(var i = 0; i < controlPoints.length; i++)
    {
      var relativeControlPoint = pointToPixelRelative(canvasWithCoords, controlPoints[i]);
      relativeControlPoint.value = controlPoints[i].value;
      controlPointsRelative.push(relativeControlPoint);
    }
    
    var algorithmCompletedCallback = function(interpolatedMatrix){
      canvasWithCoords.valueMatrix = interpolatedMatrix;
      if(_colorManager.getColors().length === 0 && _colors)
      {
        _colorManager = applyColorSet(_colorManager, _colors, _minVal, _maxVal)
      }
      
      canvasWithCoords = colorizeCanvas(canvasWithCoords,controlPointsRelative);
      callback(canvasWithCoords);
    }
    
    var dataToBeSent = {controlPointsRelative: controlPointsRelative, widthPx: widthPx, heightPx:heightPx, radius: _radius, power:_power, minVal:_minVal, maxVal:_maxVal};
    runAlgorithmWorker(dataToBeSent, algorithmCompletedCallback);
  }

  /**
  * Creates a canvas with coordinates.
  * @param {number} latMin - Minimum latitude of canvas. 
  * @param {number} lonMin - Minimum longitude of canvas. 
  * @param {number} latMax - Maximum latitude of canvas. 
  * @param {number} lonMax - Maximum longitude of canvas. 
  * @param {number} widthPx - Width of required canvas.
  * @param {number} heightPx - Height of required canvas.
  * @returns {canvas} A canvas object that has latmin, lonmin, latmax, lonmax parameters.
  */   
  var createCanvasWithCoords = function(latMin, lonMin, latMax, lonMax, widthPx, heightPx)
  {
    var canvas = document.createElement('canvas');
    canvas.id     = "idwRaster_"+(new Date()).getTime();
    canvas.width  = widthPx;
    canvas.height = heightPx;
    canvas.latMin = latMin;
    canvas.lonMin = lonMin;
    canvas.latMax = latMax;
    canvas.lonMax = lonMax;
    return canvas;
  }
  
  /**
  * Converts given point with lat,lon to coordinates on canvas relative to canvas' 0,0 point as pixel values.
  * @param {canvas} canvasWithCoords - Canvas object that has latMin, lonMin, latMax, lonMax coordinates. 
  * @param {point} latLon - Geographical point object that has lon, lat parameters. 
  * @returns {point} A point object that has x and y values.
  */  
  var pointToPixelRelative = function(canvasWithCoords, latLon)
  {
    var x = ((latLon.lon - canvasWithCoords.lonMin)/(canvasWithCoords.lonMax - canvasWithCoords.lonMin)) * canvasWithCoords.width;
    var y = ((latLon.lat - canvasWithCoords.latMin)/(canvasWithCoords.latMax - canvasWithCoords.latMin)) * canvasWithCoords.height;
    return {x: x, y: canvasWithCoords.height - y};
  }
  
  /**
  * Paints canvas with given value matrix inside. Canvas should have valueMatrix object that has values of pixels already.
  * @param {params} canvasWithCoords - Canvas object that has valueMatrix. 
  * @param {point[]} controlPointsRelative - Point array that has known values.  Their positions are relative to canvas object's 0,0 point and determined as px values. It is being used to write known values to interpolated canvas.
  * @returns {canvas} Colorized canvas.
  */  
  var colorizeCanvas = function(canvasWithCoords,controlPointsRelative)
  {
    var color = "";
    var width = canvasWithCoords.width;
    var height = canvasWithCoords.height;
    var colors = new Uint8ClampedArray(width*height*4);
    var valueMatrix = canvasWithCoords.valueMatrix;
    var canvasContext = canvasWithCoords.getContext("2d"); 
    var imageData = canvasContext.getImageData(0, 0, canvasWithCoords.width, canvasWithCoords.height);
    var data = imageData.data;
    for(var i = 0; i < width; i++)
    {
      for(var j = 0; j < height; j++)
      {
        color = _colorManager.getColor(valueMatrix[i][j]);
        var pixelIndex = getPixelIndex(i,j,width);
        data[pixelIndex] = color.red;
        data[pixelIndex+1]= color.green;
        data[pixelIndex+2]= color.blue;
        data[pixelIndex+3]= 255;
      }
    }
    
    canvasContext.putImageData(imageData,0,0);
    /*
    for(var i = 0; i < controlPointsRelative.length;i++)
    {
      canvasContext.font = "10px Comic Sans MS";
      canvasContext.fillStyle = "black";
      canvasContext.textAlign = "center";
      canvasContext.fillRect(controlPointsRelative[i].x-1,controlPointsRelative[i].y-1,2,2);
      canvasContext.fillText(controlPointsRelative[i].value.toFixed(2), controlPointsRelative[i].x, controlPointsRelative[i].y); 
    }
    */
    
    return canvasWithCoords;
  }

  /**
  * Applies color set to color manager. Divides color values between maximum and minimum value and puts them in color manager.
  * @param {ColorManager} colorManager - Color manager object with empty color set.
  * @param {string[]} hexColors - Colors as hex values.
  * @param {int} minVal - Minimum value of data.
  * @param {int} maxVal - Maximum value of data.
  * @returns {ColorManager} - A color manager object that holds required color values.
  */
  var applyColorSet = function(colorManager, hexColors, minVal, maxVal){
    var colorStep = (maxVal - minVal) / (hexColors.length - 1);
    var multiplierAddition = 0;
    if(colorManager.getType() === ColorManagerTypes.Classified)
    {
      colorStep = (maxVal - minVal) / (hexColors.length);
      multiplierAddition = 1;
    }
    
    for(var i = 0; i < hexColors.length; i++)
    {
      var color = colorManager.hexToColorWithValue(hexColors[i], minVal + (Math.ceil(colorStep) * (i + multiplierAddition)))
      colorManager.addColor(color);
    }
    
    return colorManager;
  }
  
  /**
  * Gives pixel index on canvas from given x, y and width coordinates.
  * @param {number} x - X coordinate on matrix in px. 
  * @param {number} y - Y coordinate on matrix in px.
  * @returns {number} width - Width of the canvas in px.
  */  
  var getPixelIndex = function(x, y, width)
  {
    return (y * width + x) * 4; // width used when getting buffer
  }

  /**
  * Executes inverse distance weighting algorithm at web worker. Since it is extensive algorithm and time increases with dimensions;
  * this was better way not to lock the ui (javascript is 1 thread which is main thread you know).
  * @param {object}  dataToBeSent - A json object that has various parameters required to execute idw. 
  * @param {function}  callback - Callback function to be executed when worker returns the result. 
  */  
  var runAlgorithmWorker = function(dataToBeSent, callback){
    var callbackToBeExecuted = function(result){
      _idwAlgorithmWorker.removeEventListener("message", callbackToBeExecuted);
      callback(result.data);
    }
    
    _idwAlgorithmWorker.addEventListener("message",callbackToBeExecuted);
    _idwAlgorithmWorker.postMessage(dataToBeSent);
  }
  
  var self = this;
};
