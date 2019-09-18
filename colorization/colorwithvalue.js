/**
 * Creates an instance of ColorWithValue.
 * @class
 * @classdesc For colorization, to create object which has red, green, blue codes and value.
 * Önder ALTINTAŞ 03.08.2016
 */
var ColorWithValue = function(r,g,b,a,value)
{
  var self = this;
  this.red = r;
  this.green = g;
  this.blue = b;
  this.alpha = a;
  this.value = value;
  
  /**
  * Serves color as hex string.
  * @returns {string} String hex code.
  */   
  this.getStringHex = function()
  {
    //TODO: TO BE IMPLEMENTED.
    return "#FFFFFFFF"
  }
  
  /**
  * Serves color as rgba string.
  * @returns {string} String hex code.
  */   
  this.getStringRGBA = function()
  {
    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";
  }
}