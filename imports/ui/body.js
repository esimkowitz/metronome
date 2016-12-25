import { Template } from 'meteor/templating';
import './syncStatus.js';
import './animation.js';
import './body.html';

resolution = 4;
Template.body.onCreated(function bodyOnCreated() {
  var self = this;
  this.tempo = new ReactiveVar(60);
  this.isPlay = new ReactiveVar(false);
});

Template.body.helpers({
  tempo() {
    return Template.instance().tempo.get();
  },
  play() {
    if (Template.instance().isPlay.get()) {
      return "Pause";
    } else {
      return "Play";
    }
  },
});

Template.body.events({
  'click .play'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();
    console.log("click");
    // Get value from form element
    const newIsPlay = !Template.instance().isPlay.get();
    Template.instance().isPlay.set(newIsPlay);
    play(newIsPlay, Template.instance().tempo.get(), false);
  },
  'input .tempoBox input'(event, instance) {
    Template.instance().tempo.set(event.target.value);
  },
  'change .tempoBox input'(event, instance) {
    Template.instance().tempo.set(event.target.value);
    if (Template.instance().isPlay.get()) {
      play(false, event.target.value, true);
    }
  },
  'change .resolutionBox select'(event, instance) {
    resolution = event.target.value;
  },
});
