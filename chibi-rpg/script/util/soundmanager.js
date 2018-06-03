var SoundManager = function() {
  var musics = [];
  var soundEffects = [];
  var nowPlayingIndex = 0;
  this.addMusic = function(musicFile){
    musics.push(musicFile);
  }
  
  this.addSoundEffect = function(soundEffectFile) {
    soundEffects.push(soundEffectFile);
  }
  
  this.playMusic = function(name) {
    var musicFile = this.findMusic(name);
    play(musicFile);
  }
  
  this.findMusic = function(name) {
    var musicFile = find(name, musics);
  }
  
  this.loopPlaylist = function() {
    var that = this;
    play(musics[nowPlayingIndex], function(){
      nowPlayingIndex= (nowPlayingIndex+1) % musics.length;
      that.loopPlaylist();
    })
  }
  
  this.playSoundEffect = function(name){
    var soundEffect = this.findSoundEffect(name);
    play(soundEffect);
  }
  
  function play(soundFile, callback) {
    var audio = new Audio(soundFile.url); 
    audio.addEventListener('ended', function() {
      callback();
    }, false);
    audio.volume = 0.3;
    audio.play();
  }
  
  function find(name, soundFileList) {
    for(var i = 0; i < musics.length; i++){
      if(soundFileList[i].name === name){
        return soundFileList[i];
      }
    }
  }
  
  var self = this;
}

var SoundFile = function(name, url) {
  this.name = name;
  this.url = url;
}