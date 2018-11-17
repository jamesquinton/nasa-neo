var getNeo = require('./get-neo.js');
var getNeoInstance = new getNeo();

getNeoInstance.getData(getDate(0), getDate(1));

/**
 * Get date in correct format.
 */
function getDate (incrementDay) {
  var today = new Date();
  var dd = today.getDate() + incrementDay;
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
}
