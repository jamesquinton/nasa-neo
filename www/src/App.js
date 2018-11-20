import React, { Component } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import {makeWidthFlexible, XYPlot, MarkSeries, XAxis, YAxis} from 'react-vis';

import './App.css';
import '../node_modules/react-vis/dist/style.css';

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

class App extends Component {

  constructor(props) {
    super(props);
    this.getToday();
    this.state = {
      points: [],
      start: 1420070401,
      end: 1451606399,
      on2018: '',
      onDec2018: '',
      on2015: 'active'
    };
  }

  getToday() {
    // Not for production use, will need some additional checking to avoid overloading APIs.
    axios.get("https://j2pfgjdtrl.execute-api.eu-central-1.amazonaws.com/default/nasa_neo_data_get_today")
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  updateYear(start, end, obj, e) {
    var self = this;

    self.setState({
      start: start,
      end: end,
      mean: 0,
      median: 0,
      closest: 0,
      on2018: start === 1514764800 ? 'active' : '',
      on2015: start === 1420070401 ? 'active' : '',
      onDec2018: start === 1450483200 ? 'active' : ''
    }, function () {
      self.getData();
    });
  }

  componentDidMount() {
    var self = this;
    self.getData();
  }

  getData() {
    var self = this;

    // Set the region
    AWS.config.update({
      region: 'eu-central-1',
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-central-1:bc05b5ff-3215-48cb-a397-b4ea81dc8c7e'
      })
    });

    // Create DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    var params = {
      ExpressionAttributeValues: {
        ":start": {
          N: (self.state.start * 1000).toString()
        },
        ":end": {
          N: (self.state.end * 1000).toString()
        },
      },
      FilterExpression: "close_approach_epoch_date BETWEEN :start AND :end",
      ProjectionExpression: 'id, close_approach_epoch_date, close_approach_km, absolute_maginitude_h',
      TableName: 'nasa_neo_data'
    };

    ddb.scan(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        var neo = [];
        var magnitude = [];
        var distance = [];

        data.Items.forEach(function(element, index, array) {
          neo.push({
            x: parseInt(element.close_approach_epoch_date.N),
            y: parseInt(element.close_approach_km.N),
            size: parseInt(element.absolute_maginitude_h.N),
            color: Math.random() * 10
          });
          magnitude.push(parseInt(element.absolute_maginitude_h.N));
          distance.push(parseInt(element.close_approach_km.N));
        });

        distance.sort();

        self.setState({
          points: neo,
          median: self.calculateMedian(magnitude.sort()),
          mean: self.calculateMean(magnitude),
          closest: distance[0]
        });
      }
    });
  }

  calculateMean (arr) {
    var total = 0, i;
    for (i = 0; i < arr.length; i += 1) {
        total += arr[i];
    }
    return total / arr.length;
  }

  calculateMedian (arr) {
    var arrLen = arr.length;

    if (arrLen % 2 === 0) {
      return (arr[arrLen / 2 - 1] + arr[arrLen / 2]) / 2;
    } else {
      return arr[(arrLen - 1) / 2];
    }
  }

  render() {
    var self = this;

    return (
      <div className="App">
        <FlexibleXYPlot height={600}>
          <XAxis title="Date" tickTotal={0} style={{
            title: {stroke: 'none', fill: '#000', fontWeight: 600}
          }}/>
          <YAxis title="Distance from earth" tickTotal={0} style={{
            title: {stroke: 'none', fill: '#000', fontWeight: 600}
          }}/>
          <MarkSeries opacity="1" animation data={self.state.points} />
        </FlexibleXYPlot>

        <div className="info">
          <p><i>Near earth objects plotted against distance/time.</i></p>
          <button className={this.state.on2015} onClick={self.updateYear.bind(this, 1420070401, 1451606399)}>2015</button>
          <button className={this.state.onDec2018} onClick={self.updateYear.bind(this, 1450483200, 1451174400)}>19th-20th Dec 2015</button>
          <button className={this.state.on2018} onClick={self.updateYear.bind(this, 1514764800, 1546300799)}>2018</button>
          <p>Median absolute magnitude: {this.state.median}</p>
          <p>Mean absolute magnitude: {this.state.mean}</p>
          <p>Closest asteroid: {this.state.closest}km</p>
        </div>
      </div>
    );
  }
}

export default App;
