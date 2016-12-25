import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/ui/body.js';
import timesync from 'timesync';

Session.set('offset', 0);
ts = timesync.create({
	server: '/timesync',
  	interval: 20000
});

ts.on('sync', function (state) {
  	console.log('sync ' + state);
});

ts.on('change', function (offset) {
  	console.log('changed offset: ' + offset);
  	Session.set('offset', offset);
});

function getDelayInMs(bpm) {
  	//90 beats per minute means 1.5 beats per second
  	var bps = bpm / 60.0;

  	//1.5 beat per second means 1.5 beats per 1000 milliseconds means .0015 beats per millisecond
  	var bpms = bps / 1000;

  	//.0015 beats per millisecond means 667 milliseconds delay per beat, rounded.
  	var delay = 1/(4.0 * bpms);
  	return Math.round(delay * 10000)/10000.0;
}

// This part is the algorithm we wrote to ensure that the metronomes all play the correct beat at the correct time.
function getFirstBeat(delay) {
  	var now = new Date(ts.now());
  	var possibleFirstBeat = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();

  	//Start counting up from the current date + 50 milliseconds
  	var currentTimeOffset = now.getTime() + 50;
  	//Find the Date of the first beat of a measure closest to the current date + an offset to account
  	//for the rest of the metronome initialization:

  	// var possibleFirstBeat = new Date(initialDate.getTime());
  	var firstIndex = 0;
  	do {
    	//4*delay ensures we'll start on beat one of a measure
    	possibleFirstBeat = possibleFirstBeat + delay;
    	firstIndex = (firstIndex + 1)%16;
  	} while (possibleFirstBeat < currentTimeOffset);
  	console.log(possibleFirstBeat);
  	return [possibleFirstBeat, firstIndex];
}
// end of the beat calculating algorithm

// This function calculates the next 10 beats and pushes them to the buffer.
var beatBuffer = [];
const NUMBER_OF_BEATS = 20;
function fillBeatBuffer(firstBeat, delay) {
  	console.log("Filling buffer with firstBeat time " + firstBeat[0] + " and index " + firstBeat[1]);
  	var startBeat = [firstBeat[0] + delay, (firstBeat[1]+1)%16];
  	for(i = 0; i < 2*NUMBER_OF_BEATS; i++) {
    	beatBuffer.push([startBeat[0] + i*delay, (startBeat[1]+i)%16]);
  	}
}

var audioContext;
const noteLength = 0.05;      // length of "beep" (in seconds)
var beatTimeoutQueue = [];
var delay;
function newMetronome(bpm) {
  	audioContext = new window.AudioContext();
  	console.log("New metronome at " + bpm + "bpm and a resolution of " + resolution);
  	delay = getDelayInMs(bpm);
  	console.log("Delay is " + delay);
  	var firstBeat = getFirstBeat(delay);
  	beatBuffer = [];
  	fillBeatBuffer(firstBeat, delay);
  	newInterval();
}

function beatCallback() {
  	// remove the next item from the beatBuffer
  	var nextTime = beatBuffer.shift();
  	// console.log("nextTime[1] = " + nextTime[1]);
  	var noPlay = false;
  	if ((resolution==8) && (nextTime[1]%2))
  	  	noPlay = true; // we're not playing non-quarter 8th beats
  	if ((resolution==4) && (nextTime[1]%4))
    	noPlay = true; // we're not playing non-quarter beats
  	if ((resolution==1) && (nextTime[1]%16))
    	noPlay = true; // we're not playing non-primary beats

  	// For scheduling the animations to occur on the quarter beats.
  	// These are scheduled one interval early because it needs to be
  	// scheduled half an animation interval before the beat and the
  	// animation interval is four times as long as the sound interval.
  	//FIXME: animation isn't working
  	if (beatBuffer[1][1] % 16 === 0) { 
  	  	strike(delay*4, true);
  	} else if (beatBuffer[1][1] % 4 === 0 ) {   
  	  	strike(delay*4);
  	}

  	var now = ts.now();
  	if (!noPlay) {
    	var currTime = (now%60000)/1000;
    	// create a new oscillator to make the noise
    	var osc = audioContext.createOscillator();
    	var beatType;
    	if (nextTime[1] % 16 === 0) {   // beat 0 == high pitch
     	 	osc.frequency.value = 880.0;
      		beatType = "beat 0";
    	} else if (nextTime[1] % 4 === 0 ) {   // quarter beats = medium pitch
      		osc.frequency.value = 440.0;
      		beatType = "quarter beat";
    	} else {                       // other 16th beats = low pitch
      		osc.frequency.value = 220.0;
      		beatType = "16th beat";
    	}
    	console.log(beatType + " at " + currTime + "s");
    	osc.connect( audioContext.destination );
    	osc.start();
    	osc.stop(audioContext.currentTime + noteLength);
  	}

  	var diff = delay - (beatBuffer[0][0] - now);
  	beatTimeoutQueue.shift();
  	beatTimeoutQueue.push(Meteor.setTimeout(beatCallback, delay - diff));

  	// adds the next 10 beats to the beatBuffer if it runs too low
  	if (beatBuffer.length < NUMBER_OF_BEATS) {
    	// console.log("refill buffer");
    	fillBeatBuffer(beatBuffer[beatBuffer.length-1], delay);
  	}
}
// parts of this function are adapted from https://github.com/cwilso/metronome/
// Because the interval object uses the system clock and we want it to use the synchronized clock, this
// method sets up an interval that is called every tenth of a millisecond and functions much like a delta
// time loop. It's not ideal, but it allows us to usilize the synchronized clock and it isn't much of a
// resource hog.
function newInterval() {
  	beatTimeoutQueue.push(Meteor.setTimeout(beatCallback, delay));
}

// this is the callback function for controlling the play_button
play = function(isPlay, tempo, override) {
  	if (!isPlay || override) {
    	// if the metronome is already running, turn it off
    	for (var i = 0; i < beatTimeoutQueue.length; i++) {
      		Meteor.clearTimeout(beatTimeoutQueue[i]);
    	}
    	audioContext.close();
    	if (override) {
    		console.log("override");
    		newMetronome(tempo);
    	} else {
    		pauseAnimation();
    		console.log("metronome paused");
    	}
  	} else {
    	newMetronome(tempo);
    	startAnimation();
  	}
};