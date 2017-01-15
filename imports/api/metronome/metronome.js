import TinyMusic from 'tinymusic';

function Metronome(tempo, resolution) {
	var _this = this;
	this.tempo = Number(typeof tempo !== 'undefined' ? tempo : 60.0) / 4.0;
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

	const NOTE_LENGTH = 0.05; // seconds
	var beatBuffer = [];
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var sequence, silentSequence;
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
				      	freq = 'A5 0.0125';
				  	} else if (nextTime[1] % 4 === 0 ) {   // quarter beats = medium pitch
				      	freq = 'A4 0.0125';
				  	} else {                       // other 16th beats = low pitch
				      	freq = 'A3 0.0125';
				  	}
				} else {
					freq = '- 0.0125';
				}
				sequenceArray.push(freq);
				sequenceArray.push('- 0.02375');
			}
			sequence = new TinyMusic.Sequence(audioContext, _this.tempo, sequenceArray);
			var offset = Number(Session.get('offset'));
			Meteor.setTimeout(function() {
				sequence.gain.gain.value = 0;
				sequence.play();
				sequence.gain.gain.value = 1;
			}, firstBeat[0] + offset - Date.now());
		});
	};
	this.pause = function() {
		sequence.gain.gain.value = 0;
		Meteor.setTimeout(function() {
			sequence.stop();
			audioContext.close();
		}, 10);
	};
	this.unload = function() {
		_this.pause();
	};
}
export { Metronome };