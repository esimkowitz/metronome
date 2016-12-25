import { Template } from 'meteor/templating';

import './syncStatus.html';

Template.syncStatus.onCreated(function() {
	var self = this;
	this.systemTime = new ReactiveVar(0);
	this.syncTime = new ReactiveVar(0);
	this.handle = Meteor.setInterval((function() {
		self.systemTime.set(new Date());
		self.syncTime.set(new Date(ts.now()));
	}), 1000);
});

Template.syncStatus.helpers({
  	systemTime() {
    	return Template.instance().systemTime.get();
  	},
  	offset() {
  		return Session.get('offset');
  	},
  	syncTime() {
  		return Template.instance().syncTime.get();
  	}
});

Template.syncStatus.destroyed = function() {
  	Meteor.clearInterval(this.handle);
};

// ts.on('change', function (offset) {
//   console.log('changed offset: ' + offset);
//   Template.instance().offset.set(offset);
//   // document.getElementById('offset').innerHTML = offset.toFixed(1) + ' ms';
// });