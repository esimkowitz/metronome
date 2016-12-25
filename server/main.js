import { Meteor } from 'meteor/meteor';
import timesyncServer from 'timesync/server';
Meteor.startup(( ) => {
  // code to run on server at startup
});
WebApp.connectHandlers.use("/timesync", timesyncServer.requestHandler);
