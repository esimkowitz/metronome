import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/ui/body.js';
import '../imports/api/metronome/animation.js';
import timesync from 'timesync';

Session.set('offset', 0);
ts = timesync.create({
  server: '/timesync',
  interval: 10*60*1000
});

ts.on('sync', function (state) {
	console.log('sync ' + state);
});

ts.on('change', function (offset) {
	console.log('changed offset: ' + offset);
	Session.set('offset', offset);
});