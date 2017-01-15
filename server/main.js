import { Meteor } from 'meteor/meteor';
import timesyncServer from 'timesync/server';
Meteor.startup(( ) => {
  // code to run on server at startup
});
//TODO try following this example for request handling: https://github.com/enmasseio/timesync/blob/master/examples/advanced/http/server.js
// WebApp.connectHandlers.use("/timesync", timesyncServer.requestHandler);
// Listen to incoming HTTP requests, can only be used on the server
WebApp.rawConnectHandlers.use("/timesync", function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return timesyncServer.requestHandler(req, res);
});