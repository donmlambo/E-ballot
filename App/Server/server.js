/* eslint-disable strict */
const express = require('express');
const app = express();
const util = require('util');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let network = require('./src/fabric/network.js');
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
const appAdmin = config.appAdmin;

app.get('/', function(req, res) {
    res.send('Running!');
});

app.post('/registerVoter', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);
    let studentID = req.body.studentID;

    //Creating identity of the voter and adding it to a wallet
    let response = await network.registerVoter(req.body.firstName, req.body.lastName, studentID, req.body.password );
    console.log('response from registerVoter: ');
    console.log(response);
    if (response.error) {
        res.send(response.error);
    } else {
        console.log('req.body.studentID');
        console.log(req.body.studentID);
        let networkObj = await network.connectToNetwork(studentID);
        console.log('networkobj: ');
        console.log(networkObj);

        if (networkObj.error) {
            res.send(networkObj.error);
        }
        console.log('network obj');
        console.log(util.inspect(networkObj));


        req.body = JSON.stringify(req.body);
        let args = [req.body];
        //connect to network and update the state with studentID

        let invokeResponse = await network.invoke(networkObj, false, 'createVoter', args);

        if (invokeResponse.error) {
            res.send(invokeResponse.error);
        } else {

            console.log('after network.invoke ');
            let parsedResponse = JSON.parse(invokeResponse);
            parsedResponse += '. Use your credentials to login';
            res.send(parsedResponse);

        }
    }
});

app.post('/validateVoter', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);
    let networkObj = await network.connectToNetwork(req.body.studentID);
    console.log('networkobj: ');
    console.log(util.inspect(networkObj));

    if (networkObj.error) {
        res.send(networkObj);
    }

    let invokeResponse = await network.invoke(networkObj, true, 'readBallot', req.body.studentID, req.body.password);
    if (invokeResponse.error) {
        res.send(invokeResponse);
    } else {
        console.log('after network.invoke ');
        let parsedResponse = await JSON.parse(invokeResponse);
        if (parsedResponse.ballotCast) {
            let response = {};
            response.error = 'This voter has already cast a ballot, we cannot allow double-voting!';
            res.send(response);
        }
        // let response = `Voter with studentID ${parsedResponse.studentID} is ready to cast a ballot.`
        res.send(parsedResponse);
    }

});

app.post('/castBallot', async (req, res) => {
    let networkObj = await network.connectToNetwork(req.body.studentID);
    console.log('util inspecting');
    console.log(util.inspect(networkObj));
    req.body = JSON.stringify(req.body);
    console.log('req.body');
    console.log(req.body);
    let args = [req.body];

    let response = await network.invoke(networkObj, false, 'castVote', args);
    if (response.error) {
        res.send(response.error);
    } else {
        console.log('response: ');
        console.log(response);
        // let parsedResponse = await JSON.parse(response);
        res.send(response);
    }
});

app.get('/getCurrentStanding', async (req, res) => {

    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryByObjectType', 'President','Vice_President',
        'Secretary_General', 'Treasurer_General');
    let parsedResponse = await JSON.parse(response);
    console.log(parsedResponse);
    res.send(parsedResponse);

});


const port = 5000;

app.listen(port, () => console.log('Server started on port 5000'));