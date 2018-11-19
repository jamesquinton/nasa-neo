var getNeo = require('./get-neo.js');
var GetNeo = new getNeo();

exports.handler = function (event, context, callback) {
  GetNeo.getData(GetNeo.getDate(0), GetNeo.getDate(1));

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      msg: 'It works!'
    }),
  };

  callback(null, response);
}
