// Music player variables
let songs = [];
let currentSongIndex = 0;
let analyzer;
let amplitude;
let isPlaying = false;

// p5.js setup function - runs once at the beginning
function setup() {
  // Create canvas to fit the album cover container
  let container = select('#visualizer-container');
  let canvas = createCanvas(container.width, container.height);
  canvas.parent('visualizer-container');
  
  // Set up audio analysis tools
  analyzer = new p5.FFT();
  amplitude = new p5.Amplitude();
  
  // Initialize audio context (suspended until user interaction)
  getAudioContext().suspend();
  
  // Load songs from playlist
  loadSongs();
  
  // Set up event listeners for controls
  setupEventListeners();
}

// p5.js draw function - runs continuously
function draw() {
  // Semi-transparent background for smooth transitions
  background(0, 30);
  
  if (isPlaying && songs[currentSongIndex] && songs[currentSongIndex].isPlaying()) {
    // Update progress bar
    updateProgress();
    
    // Draw visualizations
    drawVisualizations();
  } else {
    // Draw idle state
    drawIdleState();
  }
}

// Draw idle state when no song is playing
function drawIdleState() {
  // Draw vinyl record appearance
  background(20);
  
  // Outer ring
  fill(40);
  noStroke();
  ellipse(width/2, height/2, width*0.9, height*0.9);
  
  // Inner ring
  fill(30);
  ellipse(width/2, height/2, width*0.6, height*0.6);
  
  // Center hole
  fill(20);
  ellipse(width/2, height/2, width*0.1, height*0.1);
  
  // Vinyl grooves
  noFill();
  stroke(25);
  strokeWeight(1);
  for (let i = 0.15; i < 0.45; i += 0.05) {
    ellipse(width/2, height/2, width*i*2, height*i*2);
  }
  
  // Show text
  fill(150);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Click Play to Start", width/2, height/2 + width*0.35);
}

// Load songs from the playlist
function loadSongs() {
  let playlist = select('#playlist').elt;
  let items = playlist.getElementsByTagName('li');
  
  for (let i = 0; i < items.length; i++) {
    let songSrc = items[i].getAttribute('data-src');
    // Load sound file
    songs[i] = loadSound(songSrc, 
      () => console.log(`${songSrc} loaded`),
      (err) => console.error(`Could not load ${songSrc}: ${err}`)
    );
    
    // Add click event to playlist items
    items[i].addEventListener('click', function() {
      currentSongIndex = i;
      playSong();
    });
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Play button
  select('#play-btn').mousePressed(() => {
    userStartAudio(); // Ensure audio context is started
    if (!isPlaying) playSong();
  });
  
  // Pause button
  select('#pause-btn').mousePressed(() => {
    if (isPlaying) pauseSong();
  });
  
  // Stop button
  select('#stop-btn').mousePressed(stopSong);
  
  // Previous button
  select('#prev-btn').mousePressed(prevSong);
  
  // Next button
  select('#next-btn').mousePressed(nextSong);
  
  // Volume slider
  select('#volume-slider').input(function() {
    if (songs[currentSongIndex]) {
      songs[currentSongIndex].setVolume(this.value());
    }
  });
  
  // Panning slider
  select('#panning-slider').input(function() {
    if (songs[currentSongIndex]) {
      songs[currentSongIndex].pan(this.value());
    }
  });
  
  // Progress bar click
  select('#progress-bar').elt.addEventListener('click', function(e) {
    if (songs[currentSongIndex]) {
      let position = (e.offsetX / this.offsetWidth) * songs[currentSongIndex].duration();
      songs[currentSongIndex].jump(position);
    }
  });
}

// Play the current song
function playSong() {
  // Resume audio context first
  getAudioContext().resume();
  
  // Stop any currently playing song
  stopAllSongs();
  
  // Make sure song is loaded
  if (songs[currentSongIndex] && songs[currentSongIndex].isLoaded()) {
    songs[currentSongIndex].play();
    isPlaying = true;
    
    // Apply current volume and panning
    let volumeSlider = select('#volume-slider');
    let panningSlider = select('#panning-slider');
    
    songs[currentSongIndex].setVolume(volumeSlider.value());
    songs[currentSongIndex].pan(panningSlider.value());
    
    // Update song title and playlist active item
    updateSongInfo();
    updatePlaylistActive();
  } else {
    console.log("Song not loaded yet");
  }
}

// Pause the current song
function pauseSong() {
  if (songs[currentSongIndex] && songs[currentSongIndex].isPlaying()) {
    songs[currentSongIndex].pause();
    isPlaying = false;
  }
}

// Stop the current song
function stopSong() {
  if (songs[currentSongIndex]) {
    songs[currentSongIndex].stop();
    isPlaying = false;
    
    // Reset progress bar
    select('#progress').style('width', '0%');
    select('#current-time').html('0:00');
  }
}

// Stop all songs (used when changing songs)
function stopAllSongs() {
  for (let i = 0; i < songs.length; i++) {
    if (songs[i] && songs[i].isPlaying()) {
      songs[i].stop();
    }
  }
}

// Play the previous song
function prevSong() {
  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }
  playSong();
}

// Play the next song
function nextSong() {
  currentSongIndex++;
  if (currentSongIndex >= songs.length) {
    currentSongIndex = 0;
  }
  playSong();
}

// Update progress bar and time display
function updateProgress() {
  if (songs[currentSongIndex] && songs[currentSongIndex].isPlaying()) {
    let currentTime = songs[currentSongIndex].currentTime();
    let duration = songs[currentSongIndex].duration();
    
    // Update progress bar width
    let progressPercent = (currentTime / duration) * 100;
    select('#progress').style('width', progressPercent + '%');
    
    // Update time displays
    select('#current-time').html(formatTime(currentTime));
    select('#total-time').html(formatTime(duration));
    
    // If song has ended, play next song
    if (currentTime >= duration - 0.1) {
      nextSong();
    }
  }
}

// Update song title and duration information
function updateSongInfo() {
  let playlist = select('#playlist').elt;
  let items = playlist.getElementsByTagName('li');
  
  if (items[currentSongIndex]) {
    let songTitle = items[currentSongIndex].textContent;
    select('#song-title').html(songTitle);
  }
  
  if (songs[currentSongIndex] && songs[currentSongIndex].isLoaded()) {
    select('#total-time').html(formatTime(songs[currentSongIndex].duration()));
  }
}

// Highlight the currently playing song in the playlist
function updatePlaylistActive() {
  let playlist = select('#playlist').elt;
  let items = playlist.getElementsByTagName('li');
  
  for (let i = 0; i < items.length; i++) {
    if (i === currentSongIndex) {
      items[i].classList.add('active');
    } else {
      items[i].classList.remove('active');
    }
  }
}

// Format time in MM:SS format
function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// Draw visualizations based on audio analysis
function drawVisualizations() {
  // Make sure analyzer is properly connected
  analyzer.setInput(songs[currentSongIndex]);
  amplitude.setInput(songs[currentSongIndex]);
  
  // Analyze audio
  analyzer.analyze();
  
  // Get volume level
  let level = amplitude.getLevel();
  
  // Draw album art visualization - using safer approach to avoid the spectrum error
  drawAlbumArt(level);
}

// Draw album art visualization
function drawAlbumArt(level) {
  // Draw vinyl record as the base
  background(20);
  
  // Outer ring
  fill(40);
  noStroke();
  ellipse(width/2, height/2, width*0.9, height*0.9);
  
  // Create spinning effect
  push();
  translate(width/2, height/2);
  rotate(frameCount * 0.01); // Rotate slowly
  
  // Vinyl grooves
  noFill();
  stroke(30);
  strokeWeight(1);
  for (let i = 0.15; i < 0.45; i += 0.05) {
    ellipse(0, 0, width*i*2, height*i*2);
  }
  
  // Center label
  fill(60);
  noStroke();
  ellipse(0, 0, width*0.3, height*0.3);
  
  // Draw frequency bars around the record - safer implementation
  drawFrequencyBars(level);
  
  pop();
  
  // Center hole
  fill(20);
  noStroke();
  ellipse(width/2, height/2, width*0.08, height*0.08);
  
  // Draw volume indicator
  drawVolumeIndicator(level);
}

// Draw frequency bars in a circular pattern - safer implementation
function drawFrequencyBars(level) {
  let numBars = 180; // Number of bars around the circle
  let maxBarHeight = width * 0.15; // Maximum height of each bar
  
  // Get frequency data safely
  let spectrum = analyzer.spectrum;
  
  // Safety check - don't proceed if spectrum is not available
  if (!spectrum || spectrum.length === 0) {
    return;
  }
  
  noStroke();
  
  for (let i = 0; i < numBars; i++) {
    // Get spectrum value (skip some values for better distribution)
    // Make sure we don't access outside the spectrum array bounds
    let index = floor(map(i, 0, numBars, 0, min(spectrum.length * 0.5, spectrum.length - 1)));
    let value = spectrum[index] * 2; // Amplify for better visualization
    
    // Calculate position using polar coordinates
    let angle = map(i, 0, numBars, 0, TWO_PI);
    let r = width * 0.45; // Radius where bars start
    let barHeight = map(value, 0, 1, 0, maxBarHeight);
    
    // Color based on frequency
    let hue = map(i, 0, numBars, 0, 360);
    colorMode(HSB, 360, 100, 100, 1);
    fill(hue, 80, 90);
    
    // Draw the bar
    push();
    rotate(angle);
    rect(r, -2, barHeight, 4);
    pop();
  }
  
  // Reset color mode
  colorMode(RGB, 255);
}

// Draw a volume indicator in the center
function drawVolumeIndicator(level) {
  // Map level to circle size
  let size = map(level, 0, 1, width*0.1, width*0.25);
  
  // Draw glowing volume circle
  for (let i = 5; i > 0; i--) {
    let alpha = map(i, 0, 5, 255, 0);
    fill(29, 185, 84, alpha * 0.7); // Spotify green with fading alpha
    noStroke();
    ellipse(width/2, height/2, size + i*5, size + i*5);
  }
  
  // Core volume circle
  fill(29, 185, 84);
  ellipse(width/2, height/2, size, size);
}