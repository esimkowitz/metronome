import { Template } from 'meteor/templating';

import './syncStatus.html';

Template.syncStatus.onCreated(function() {
	var self = this;
	// this.systemTime = new ReactiveVar(0);
	// this.syncTime = new ReactiveVar(0);
	// this.handle = Meteor.setInterval((function() {
	// 	self.systemTime.set(new Date());
	// 	self.syncTime.set(new Date(Date.now() + Session.get('offset')));
	// }), 1000);
 //  Tracker.autorun(function() {
 //    if (Session.equals('visible', false)) {
 //      if (self.handle !== null) {
 //        Meteor.clearInterval(self.handle);
 //      }
 //    }
 //  });
});

Template.syncStatus.helpers({
  	// systemTime() {
   //  	return Template.instance().systemTime.get();
  	// },
  	offset() {
  		return Session.get('offset');
  	},
  	// syncTime() {
  	// 	return Template.instance().syncTime.get();
  	// }
});

// Template.syncStatus.destroyed = function() {
//   	Meteor.clearInterval(this.handle);
// };