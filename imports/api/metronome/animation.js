import { createjs } from 'meteor/nrafter:createjs';

var stage, tickEvent, circle, isRight = true;
var scaleWidth, scaleHeight, canvasWidth, canvasHeight;
function initAnimation() {
	stage = new createjs.Stage("animation");
	
	canvasWidth = document.getElementById("animation").width;
	canvasHeight = document.getElementById("animation").height;
	scaleWidth = canvasWidth / 1200;
	scaleHeight = canvasHeight / 600;
	circle = new createjs.Shape();
	circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 100*scaleWidth);
	circle.x = canvasWidth / 2;
	circle.y = 300*scaleHeight;
	stage.addChild(circle);
	const leftWidth = 100*scaleWidth;
	const leftHeight = 600*scaleHeight;
	const leftRound = 20*(scaleWidth + scaleHeight)/2.0;
	const rightStartX = canvasWidth - 100*scaleWidth;
	const rightWidth = 100*scaleWidth;
	const rightHeight = 600*scaleHeight;
	const rightRound = 20*(scaleWidth + scaleHeight)/2.0;
	var leftBoundRed = new createjs.Shape();
	leftBoundRed.graphics.beginFill("#FF4100").drawRoundRect(0,0,leftWidth,leftHeight,leftRound).endFill();

	stage.addChild(leftBoundRed);

	var rightBoundRed = new createjs.Shape();
	rightBoundRed.graphics.beginFill("#FF4100").drawRoundRect(rightStartX,0,rightWidth,rightHeight,rightRound).endFill();
	stage.addChild(rightBoundRed);
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
		.call(logAnim)
		.to({ x: canvasWidth/2, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineOut());
	} else {
		isRight = true;
		createjs.Tween.get(circle, {override: true})
		.to({ x: 200*scaleWidth, y:300*scaleHeight }, 0.5*delay, createjs.Ease.sineIn())
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

// function clearAnimation(callback) {
// 	stage.clear();
// 	stage.removeAllChildren();
// 	stage.removeAllEventListeners();
//     createjs.Ticker.off('tick', tickEvent);
//     if (typeof callback != "undefined") {
// 		callback();
// 	}
// }

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

function tick(event) {
	stage.update(event);
}