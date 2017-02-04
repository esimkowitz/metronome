import Tone from 'tone';
import './animation.js';

function Metronome(tempo, resolution) {
	var _this = this;
	this.tempo = Number(typeof tempo !== 'undefined' ? tempo : 60.0);
	console.log("this.tempo = " + this.tempo);
	this.resolution = Number(typeof resolution !== 'undefined' ? resolution : 4);
	console.log("this.resolution = " + this.resolution);
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
		var now = new Date(Date.now() + Session.get('offset'));
		var possibleFirstBeat = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0).getTime();

		//Start counting up from the current date + 50 milliseconds
		var currentTimeOffset = now.getTime() + 50;
		//Find the Date of the first beat of a measure closest to the current date + an offset to account
		//for the rest of the metronome initialization:

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

	const NUMBER_OF_BEATS = 16;
	function fillBeatBuffer(firstBeat, delay, callback) {
		console.log("Filling buffer with firstBeat time " + firstBeat[0] + " and index " + firstBeat[1]);
		var startBeat = [firstBeat[0] + delay, (firstBeat[1]+1)%16];
		for(i = 0; i < NUMBER_OF_BEATS; i++) {
	  		beatBuffer.push([startBeat[0] + i*delay, (startBeat[1]+i)%16]);
		}
		if (typeof callback !== 'undefined') {
			callback();
		}
	}

	var beatBuffer = [];
	var toneSequence;
	this.play = function() {
		var delay = getDelayInMs(_this.tempo);
		var firstBeat = getFirstBeat(delay);

		fillBeatBuffer(firstBeat, delay, function() {
			var sequenceArray = [];
			while (beatBuffer.length !== 0) {
				var nextTime = beatBuffer.shift();
			  	var noPlay = false;
			  	if ((_this.resolution==8) && (nextTime[1]%2))
			  		noPlay = true; // we're not playing non-quarter 8th beats
			  	if ((_this.resolution==4) && (nextTime[1]%4))
			    	noPlay = true; // we're not playing non-quarter beats
			  	if ((_this.resolution==1) && (nextTime[1]%16))
			    	noPlay = true; // we're not playing non-primary beats

			    var freq;
			    if (!noPlay) {
				  	// create a new oscillator to make the noise
				  	if (nextTime[1] % 16 === 0) {   // beat 0 == high pitch
				      	freq = 0;
				  	} else if (nextTime[1] % 4 === 0 ) {   // quarter beats = medium pitch
				      	freq = 1;
				  	} else {                       // other 16th beats = low pitch
				      	freq = 2;
				  	}
				} else {
					freq = 3;
				}
				sequenceArray.push(freq);
			}
			console.log(sequenceArray);
			var offset = Number(Session.get('offset'));
			//setup a polyphonic sampler
			var highUrl, lowUrl;
	      	highUrl = '/High_Seiko_SQ50.wav';
	      	lowUrl = '/Low_Seiko_SQ50.wav';
			var keys = new Tone.MultiPlayer({
				urls : {
					"high" : highUrl,
					"low" : lowUrl,
				},
				volume : 5,
				fadeOut : 0.1,
			}).toMaster();
			//the notes
			var noteNames = ["high", "low", "low"];
			toneSequence = new Tone.Sequence(function(time, col){
				var column = sequenceArray[col];
				Tone.Draw.schedule(function(){
			        //this callback is invoked from a requestAnimationFrame
			        //and will be invoked close to AudioContext time
			        // For scheduling the animations to occur on the quarter beats.
					// These are scheduled one interval early because it needs to be
					// scheduled half an animation interval before the beat and the
					// animation interval is four times as long as the sound interval.

					var nextCol = col + 1;
					if (nextCol > 15) nextCol -= 16;
					if (sequenceArray[nextCol] === 0) { 
					  	strike(delay*2, true);
					} else if (sequenceArray[nextCol] === 1) {   
					  	strike(delay*2);
					}
					if (column != 3) {
						console.log(noteNames[column] + " tick at " + Math.round(new Date(Date.now() + Session.get('offset'))%60000/10)/100 + "s");
					}
			    }, time) //use AudioContext time of the event
				keys.start(noteNames[column], time, 0, "32n", 0, 0.75);
			}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");
			Tone.Transport.bpm.value = _this.tempo;
			Tone.Transport.start();
			Tone.context.resume();
			Meteor.setTimeout(function() {
				toneSequence.start();
			}, firstBeat[0] + offset - Date.now());
		});
	};
	this.pause = function() {
		toneSequence.stop();
		Tone.Transport.stop();
		Tone.context.suspend();
	};
	this.unload = function() {
		_this.pause();
	};
}
export { Metronome };