var getNeo = require('./get-neo.js');
var GetNeo = new getNeo();

exports.handler = function (event, context, callback) {
  GetNeo.getData(GetNeo.getDate(0), GetNeo.getDate(1));
  callback(null, { "statusCode" : 200, "body" : "[{\"msg\": \"It works!\"}]"});
}
