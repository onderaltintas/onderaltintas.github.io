/**
 * Creates an instance of ColorManager.
 * @class
 * @classdesc For colorization, results colors for values.
 * Önder ALTINTAŞ 03.08.2016
 */
var ColorManager = function(type)
{
  var _colors = [];
  var _type = type || ColorManagerTypes.Continuous; //can be continuous or classified. 
  var _placeHolderColor = new ColorWithValue(255,255,255,0.5,0);
  
  /**
  * Gets Color Manager type. Can be either continuous or classified.
  * @returns {ColorManagerTypes} - Color manager type.
  */   
  this.getType = function()
  {
    return _type;
  }

  /**
  * Gets colors array.
  * @returns {ColorWithValue[]} - Color array.
  */   
  this.getColors = function()
  {
    return _colors;
  }

  /**
  * Add color with value to colors array and sorts by value from minimum to maximum.
  * @param {ColorWithValue} colorWithValue - A window name that should be mimimized/maximized.
  */   
  this.addColor = function(colorWithValue)
  {
    _colors.push(colorWithValue);
    _colors.sort(colorWithValueComparer);
  }
  
  /**
  * Sets colors array with given ColorWithValue array and sorts by value from minimum to maximum.
  * @param {ColorWithValue[]} colors - A window name that should be mimimized/maximized.
  */   
  this.setColors = function(colors)
  {
    _colors = colors;
    _colors.sort(colorWithValueComparer);
  }
  
  /**
  * Calculates a color with given value.
  * @param {int} value - A value to determine which color will be obtained. 
  * Should be between maximum color and minimum color if continous method will be used.
  * @returns {ColorWithValue} Corresponding color matching value.
  */   
  this.getColor = function(value)
  {
    if(!_colors.length)
    {
      return _placeHolderColor;
    }
    
    switch(type)
    {
      case ColorManagerTypes.Continuous:
        return getContinuousColor(value);
      break;
      case ColorManagerTypes.Classified:
        return getClassifiedColor(value);
      break;
      default:
        return getClassifiedColor(value);
    }
  }
  
  /**
  * Gets color of given value with classified algorithm. Value will be iterated on colors array 
  * and if the value is between 2 colors, bigger value color will be chosen.
  * @param {int} value - Value to find color.
  * @returns {ColorWithValue} ColorWithValue matching value.
  */   
  var getClassifiedColor = function(value)
  {
    for(var i = 0; i < _colors.length; i++)
    {
      if(value <= _colors[i].value)
      {
        return _colors[i];
      }
    }
    
    return _placeHolderColor;
  }

  /**
  * Gets color of given value with continous algorithm. Value will be iterated on colors array 
  * and if the value is between 2 colors, algorithm determines exact location of the value between 2 ColorWithValues.
  * @param {int} value - Value to find color.
  * @returns {ColorWithValue} ColorWithValue matching value.
  */   
  var getContinuousColor = function(value)
  {
    for(var i = 0; i < _colors.length; i++)
    {
      if(value <= _colors[i].value)
      {
        if(i-1 < 0)
        {
          return _colors[i];
        }
        
        return findColorBetweenColors(value, _colors[i-1], _colors[i]);
      }
    }
    
    return _placeHolderColor;
  }
  
  /**
  * Turns color as hex string to ColorWithValue object and sets its value with given value.
  * @param {string} hex - Hex value of color.
  * @param {int} value - Value of color.
  * @returns {ColorWithValue} ColorWithValue object that holds given hex color and value.
  */   
  this.hexToColorWithValue = function(hex, value) 
  {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new ColorWithValue(parseInt(result[1], 16) ,parseInt(result[2], 16), parseInt(result[3], 16), 1, value) : ColorWithValue(0, 0, 0, 1, value);
  }
  
  /**
  * Comparison operator to compare 2 ColorWithValue objects. Looks at "value" property of ColorWithValue object
  * @param {ColorWithValue} a - First ColorWithValue object to compare
  * @returns {ColorWithValue} b - Second ColorWithValue object to compare
  */   
  var colorWithValueComparer = function(a,b)
  {
    if (a.value < b.value)
      return -1;
    if (a.value > b.value)
      return 1;
    return 0;
  }
  
  /**
  * Finds the color between 2 colors with given value. 
  * Ex: Let's say minColor has rgba(255,255,255,1) and value 0; maxColor has rgba(0,0,0,1) and value 100.
  * If given value is 50 then determined color will be rgba(125,125,125,1). 
  * @param {int} value - A value to determine color.
  * @param {ColorWithValue} minColor - ColorWithValue object that has minimum value.
  * @param {ColorWithValue} maxColor - ColorWithValue object that has maximum value.
  */   
  var findColorBetweenColors = function(value, minColor, maxColor)
  {
    if(minColor.value === maxColor.value)
    {
      return minColor;
    }
    
    var valueCoefficient = ( value - minColor.value ) / ( maxColor.value - minColor.value );
    var red = Math.ceil(minColor.red + (( maxColor.red - minColor.red ) * valueCoefficient));
    var green = Math.ceil(minColor.green + (( maxColor.green - minColor.green ) * valueCoefficient));
    var blue = Math.ceil(minColor.blue + (( maxColor.blue - minColor.blue ) * valueCoefficient));
    var alpha = minColor.alpha + (( maxColor.alpha - minColor.alpha ) * valueCoefficient); 
    red = red > 255? 255 : red;
    green = green > 255? 255 : green;
    blue = blue > 255? 255 : blue;
    return new ColorWithValue(red, green, blue, alpha, value);
  }
  
  var self = this;
};

ColorManagerTypes =
{
  Continuous: "continuous",
  Classified: "classified"
};