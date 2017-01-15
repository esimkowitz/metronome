import { Template } from 'meteor/templating';
import './syncStatus.js';
import './animation.js';
import './body.html';
import { Metronome } from '../api/metronome/metronome.js';

resolution = 4;
Template.body.onCreated(function bodyOnCreated() {
  var self = this;
  this.tempo = new ReactiveVar(60);
  this.resolution = new ReactiveVar(4);
  this.isPlay = new ReactiveVar(false);
  this.metronome = null;
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
  isCordova() {
    return Meteor.isCordova;
  }
});

Template.body.events({
  'click .play'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();
    console.log("click");
    // Get value from form element
    const newIsPlay = !Template.instance().isPlay.get();
    Template.instance().isPlay.set(newIsPlay);
    if (newIsPlay) {
      Template.instance().metronome = new Metronome(Template.instance().tempo.get(), Template.instance().resolution.get());
      Template.instance().metronome.play();
    } else {
      Template.instance().metronome.pause();
    }
  },
  'input .tempoBox input'(event, instance) {
    Template.instance().tempo.set(event.target.value);
  },
  'change .tempoBox input'(event, instance) {
    console.log(event.target.value);
    Template.instance().tempo.set(event.target.value);
    if (Template.instance().isPlay.get()) {
      Template.instance().metronome.unload();
      Template.instance().metronome = new Metronome(Template.instance().tempo.get(), Template.instance().resolution.get());
      Template.instance().metronome.play();
    }
  },
  'change .resolutionBox select'(event, instance) {
    Template.instance().resolution.set(event.target.value);
    if (Template.instance().isPlay.get()) {
      Template.instance().metronome.unload();
      Template.instance().metronome = new Metronome(Template.instance().tempo.get(), Template.instance().resolution.get());
      Template.instance().metronome.play();
    }
  },
});
