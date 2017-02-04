import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/ui/body.js';
// import '../imports/api/metronome/animation.js';
import timesync from 'timesync';

Meteor.startup(function() {
  
});
function newTimeSync(interval) {
  var newTS = timesync.create({
    server: '/timesync',
    interval: interval
  });

  newTS.on('sync', function (state) {
    console.log('sync ' + state);
  });

  newTS.on('change', function (offset) {
    console.log('changed offset: ' + offset);
    Session.set('offset', offset);
  });
  Session.set('offset', 0);
  return newTS;
}
var ts = newTimeSync(10*60*1000);
Session.set('offset', 0);
var handleVisibilityChange = function() {
  if (document.hidden) {
    console.log('page is no longer visible');
    Session.set('visible', false);
  } else {
    Session.set('visible', true);
    console.log('page is visible');
  }
};
document.addEventListener("visibilitychange", handleVisibilityChange, false);