//
// Usage: `node index.js [START DATE: YYYY-MM-DD] [END DATE: YYYY-MM-DD]`
//
var getNeo = require('./get-neo.js');
var getNeoInstance = new getNeo();

var myArgs = process.argv.slice(2);
if (myArgs[0] == undefined || myArgs[1] == undefined) {
  throw new Error('Must specify start and end dates: `node index.js [START DATE: YYYY-MM-DD] [END DATE: YYYY-MM-DD]`');
}

var getNeo = require('./get-neo.js');
var getNeoInstance = new getNeo();

getNeoInstance.getData(myArgs[0], myArgs[1]);
