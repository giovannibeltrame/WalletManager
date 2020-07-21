var express = require('express');
var cors = require('cors');
var nedb = require('nedb');
var expressNedbRest = require('express-nedb-rest');

// setup express app
var app = express();
app.use(cors());

// create  NEDB datastore
var classesDatastore = new nedb({ filename: 'classes.db', autoload: true });
var assetsDatastore = new nedb({ filename: 'assets.db', autoload: true });
var operationsDatastore = new nedb({
	filename: 'operations.db',
	autoload: true,
});

// create rest api router and connect it to datastore
var restApi = expressNedbRest();
restApi.addDatastore('classes', classesDatastore);
restApi.addDatastore('assets', assetsDatastore);
restApi.addDatastore('operations', operationsDatastore);

// setup express server to serve rest service
app.use('/', restApi);

app.listen(8080, function () {
	console.log('you may use nedb rest api at port 8080');
});
