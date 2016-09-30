var CanvasVideoPlayer = function(options) {
  var i;

  this.options = {
    framesPerSecond: 30
  };
  this._dirty = true
  this.video = document.querySelector(options.videoSelector);
  this.canvas = document.querySelector(options.canvasSelector);

  // Canvas context
  this.ctx = this.canvas.getContext('2d');

  this.playing = false;

  this.video.load();
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.video.style.display = 'none';
  var self = this
  this.animationFrame = null

  // On every time update draws frame
  this.video.addEventListener('timeupdate', function(){
    self.drawFrame();
  });

  this.play();

  // To be sure 'canplay' event that isn't already fired
  if (this.video.readyState >= 2) {
    self.drawFrame();
  } else {
    // Draws first frame
    var onCanPlay = function(){
      self.drawFrame();
      self.video.removeEventListener('canplay', onCanPlay);
    }
    this.video.addEventListener('canplay', onCanPlay);
  }
};

CanvasVideoPlayer.prototype.play = function() {
  this.lastTime = Date.now();
  this.playing = true;
  this.tick();
};

CanvasVideoPlayer.prototype.pause = function() {
  this.playing = false;
};

CanvasVideoPlayer.prototype.playPause = function() {
  if (this.playing) {
    this.pause();
  } else {
    this.play();
  }
};

CanvasVideoPlayer.prototype.tick = function() {

  var self = this;

  var time = Date.now();
  var elapsed = (time - this.lastTime) / 1000;

  // Render
  if(elapsed >= (1 / this.options.framesPerSecond)) {
    this._dirty = true
    this.video.currentTime = this.video.currentTime + elapsed;
    this.lastTime = time;
  } else {
    if (this.frameTimeout) {
      clearTimeout(this.frameTimeout)
    }
    this.frameTimeout = setTimeout(this.tick.bind(this),
      ((1 / this.options.framesPerSecond) - elapsed) * 1000)
  }

  // If we are at the end of the video stop
  if (this.video.currentTime >= this.video.duration) {
    this.video.currentTime = 0;
    this.play();
  }
};

CanvasVideoPlayer.prototype.drawFrame = function() {
  var self = this
  if (self.playing) {
    cancelAnimationFrame(self.animationFrame)
    self.animationFrame = requestAnimationFrame(function(){
      if(self._dirty) {
        self.ctx.drawImage(self.video, 0, 0, self.width, self.height);
        self._dirty = false
      }
      self.tick();
    });
  }
};
