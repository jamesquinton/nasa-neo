const request = require('request');
const aws = require('aws-sdk');

var getNeo = function () {
  var self = this;

  /**
   * Grab data from API endpoint.
   */
  self.getData = function (start, end) {
    var key      = 'WwhHjPTAZDHkVhflUKDBXF33M4pW16xg9WagBJ8i';
    var endpoint = 'https://api.nasa.gov/neo/rest/v1/feed';

    self.callAPI(endpoint + '?start_date=' + start + '&api_key=' + key, function (body) {
      self.normalizeData(body, end);
    });
  };

  /**
   * Call API.
   */
  self.callAPI = function (url, callback) {

    request(url, { json: true }, (err, res, body) => {
      if (err) {
        return console.log(err);
      }

      if (callback) {
        callback(body);
      }
    });
  };

  /**
   * Process data from API.
   */
  self.normalizeData = function (body, end) {

    // Loop through days.
    for (var day in body.near_earth_objects) {

      if (body.near_earth_objects.hasOwnProperty(day)) {

        // Loop through objects per day.
        for (var key in body.near_earth_objects[day]) {

          var near_earth_object = body.near_earth_objects[day][key];

          // If date is beyond specified end date, return.
          if (Date.parse(near_earth_object.close_approach_data[0].close_approach_date) > Date.parse(end)) {
            return;
          }

          // Normalize.
          var neo = {
            'id': {'S' : near_earth_object.id},
            'absolute_maginitude_h': {'N' : near_earth_object.absolute_magnitude_h.toString()},
            'close_approach_km': {'N' : near_earth_object.close_approach_data[0].miss_distance.kilometers},
            'close_approach_epoch_date': {'N' : near_earth_object.close_approach_data[0].epoch_date_close_approach.toString()},
            'close_approach_date': {'S' : near_earth_object.close_approach_data[0].close_approach_date}
          };

          self.saveData(neo);
        }
      }
    }

    self.callAPI(body.links.next, function (body) {
      self.normalizeData(body, end);
    });
  }

  /**
   * Save data to DynamoDB.
   */
  self.saveData = function (data) {
    aws.config.update({region: 'eu-central-1'});
    var ddb = new aws.DynamoDB({apiVersion: '2012-10-08'});

    var params = {
      TableName: 'nasa_neo_data',
      Item: data
    };

    ddb.putItem(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
  }
};

module.exports = getNeo;
