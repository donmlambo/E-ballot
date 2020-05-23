/* eslint-disable strict */
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
});

let network = require('/home/d_m/Desktop/Ballot_Vault/Interface/Server/src/fabric/network.js');

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

//get all assets in world state
app.get('/queryAll', async (req, res) => {

    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryAll', '');
    let parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);

});

app.get('/getCurrentStanding', async (req, res) => {

    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryByObjectType', 'votableItem');
    let parsedResponse = await JSON.parse(response);
    console.log(parsedResponse);
    res.send(parsedResponse);

});

//vote for some candidates. This will increase their vote count
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

//query for certain objects within the world state
app.post('/queryWithQueryString', async (req, res) => {

    let networkObj = await network.connectToNetwork(appAdmin);
    let response = await network.invoke(networkObj, true, 'queryByObjectType', req.body.selected);
    let parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);

});

//get voter info, create voter object, and update state with their studentID
app.post('/registerVoter', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);
    let studentID = req.body.studentID;

    //first create the identity for the voter and add to wallet
    let response = await network.registerVoter(studentID, req.body.password, req.body.firstName, req.body.lastName);
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

//used as a way to login the voter to the app and make sure they haven't voted before
app.post('/validateVoter', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);
    let networkObj = await network.connectToNetwork(req.body.studentID);
    console.log('networkobj: ');
    console.log(util.inspect(networkObj));

    if (networkObj.error) {
        res.send(networkObj);
    }

    let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', req.body.studentID, req.body.password);
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

app.post('/queryByKey', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);

    let networkObj = await network.connectToNetwork(appAdmin);
    console.log('after network OBj');
    let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.key);
    response = JSON.parse(response);
    if (response.error) {
        console.log('inside eRRRRR');
        res.send(response.error);
    } else {
        console.log('inside ELSE');
        res.send(response);
    }
});
