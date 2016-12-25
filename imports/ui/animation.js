import { Template } from 'meteor/templating';
import { createjs } from 'meteor/nrafter:createjs';
import './animation.html';

Template.animation.onCreated(function() {

});

var stage, tickEvent, circle, leftBound, rightBound, isRight = true;
var scaleWidth, scaleHeight, canvasWidth, canvasHeight;
var leftWidth, leftHeight, leftRound, rightStartX, rightWidt, rightHeight, rightRound;
function initAnimation() {
	var beatNumber = 1;
	stage = new createjs.Stage("animation");
	
	canvasWidth = document.getElementById("animation").width;
	canvasHeight = document.getElementById("animation").height;
	scaleWidth = canvasWidth / 1200;
	scaleHeight = canvasHeight / 600;
	circle = new createjs.Shape();
	// const circleScale = Math.sqrt(Math.pow(scaleWidth, 2) + Math.pow(scaleHeight, 2));
	circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 100*scaleWidth);
	circle.x = canvasWidth / 2;
	circle.y = 300*scaleHeight;
	stage.addChild(circle);
	leftWidth = 100*scaleWidth;
	leftHeight = 600*scaleHeight;
	leftRound = 20*(scaleWidth + scaleHeight)/2.0;
	rightStartX = canvasWidth - 100*scaleWidth;
	rightWidth = 100*scaleWidth;
	rightHeight = 600*scaleHeight;
	rightRound = 20*(scaleWidth + scaleHeight)/2.0;
	leftBound = new createjs.Shape();
	leftBound.graphics.beginFill("#FF4100").drawRoundRect(0,0,leftWidth,leftHeight,leftRound).endFill();
	stage.addChild(leftBound);

	rightBound = new createjs.Shape();
	rightBound.graphics.beginFill("#FF4100").drawRoundRect(rightStartX,0,rightWidth,rightHeight,rightRound).endFill();
	stage.addChild(rightBound);

	createjs.Ticker.framerate = 60;
	if (tickEvent) {
		createjs.Ticker.off('tick', tickEvent);
	}
	tickEvent = createjs.Ticker.addEventListener("tick", tick);
}

strike = function(delay, right) {
	right = typeof right !== 'undefined' ? right : isRight;

	if (document.getElementById("animation").style.display !== "inline-block") {
		document.getElementById("animation").style.display = "inline-block";
	}

	//Circle movement:
	if (right) {
		isRight = false;
		createjs.Tween.get(circle, {override: true})
		.to({ x: canvasWidth - 200*scaleWidth, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineIn())
		.call(flash,[leftBound, rightBound])
		.call(logAnim)
		.to({ x: canvasWidth/2, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineOut());
	} else {
		isRight = true;
		createjs.Tween.get(circle, {override: true})
		.to({ x: 200*scaleWidth, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineIn())
		.call(unflash,[leftBound, rightBound])
		.call(logAnim)
		.to({ x: canvasWidth/2, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineOut());
	}
};

startAnimation = function() {
	if (stage) {
		if (!stage.contains(circle)) {
			console.log("stage exists but cleared");
			initAnimation();
		} else {
			resumeAnimation();
		}
	} else {
		console.log("stage doesn't exist");
		initAnimation();
	}
};

function clearAnimation(callback) {
	stage.clear();
	stage.removeAllChildren();
	stage.removeAllEventListeners();
    createjs.Ticker.off('tick', tickEvent);
    if (typeof callback != "undefined") {
		callback();
	}
}

pauseAnimation = function(callback) {
	document.getElementById("animation").style.display = "none";
    createjs.Ticker.off('tick', tickEvent);
    if (typeof callback != "undefined") {
		callback();
	}
};

function resumeAnimation(callback) {
	createjs.Ticker.framerate = 60;
	if (tickEvent) {
		createjs.Ticker.off('tick', tickEvent);
	}
	tickEvent = createjs.Ticker.addEventListener("tick", tick);
    if (typeof callback != "undefined") {
		callback();
	}
}

function logAnim() {
	console.log("Animation at " + (ts.now()%60000)/1000 + "s");
}

function flash() {
	arguments[0].graphics.clear().beginFill("#CDCDCD").drawRoundRect(0,0,leftWidth,leftHeight,leftRound).endFill();
	arguments[1].graphics.clear().beginFill("#CDCDCD").drawRoundRect(rightStartX,0,rightWidth,rightHeight,rightRound).endFill();
}

function unflash() {
	arguments[0].graphics.clear().beginFill("#FF4100").drawRoundRect(0,0,leftWidth,leftHeight,leftRound).endFill();
	arguments[1].graphics.clear().beginFill("#FF4100").drawRoundRect(rightStartX,0,rightWidth,rightHeight,rightRound).endFill();
}

function tick(event) {
	stage.update(event);
}