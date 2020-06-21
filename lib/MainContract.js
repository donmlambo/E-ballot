/*
 * SPDX-License-Identifier: Apache-2.0
 */


'use strict';


//import Hyperledger Fabric SDK v2.0
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');


// connect to the election data file
const electionDataPath = path.join(process.cwd(), './lib/data/electionData.json');
const electionDataJson = fs.readFileSync(electionDataPath, 'utf8');
const electionData = JSON.parse(electionDataJson);

//import our file which contains our constructors
let Ballot = require('./Ballot.js');
let Election = require('./Election.js');
let Voter = require('./Voter.js');
let PresCandidate = require('./President.js');
let SecCandidate = require('./SecretaryGeneral');
let TresCandidate = require('./TreasurerGeneral');
let ViceCandidate = require('./VicePresident');


class MyBallotContract extends Contract {


    /**
   *
   * init
   *
   * This function creates voters and gets the application ready for use by creating
   * an election from the data files in the data directory.
   *
   * @param ctx - the context of the transaction
   * @returns the voters which are registered and ready to vote in the election
   */
    async init(ctx) {


        console.log('instantiate was called!');


        let voters = [];
        let Candidates = [];
        let elections = [];
        let election;


        //create voters
        let voter1 = await new Voter('Don', 'Mlambo','n0165102w', '210861862');


        //update voters array
        voters.push(voter1);


        //add the voters to the world state, the election class checks for registered voters
        await ctx.stub.putState(voter1.studentID, Buffer.from(JSON.stringify(voter1)));


        //query for election first before creating one.
        let currElections = JSON.parse(await this.queryByObjectType(ctx, 'election'));


        if (currElections.length === 0) {


            //election day
            let electionStartDate = await new Date(2020, 5, 30);
            let electionEndDate = await new Date(2020, 5, 30);


            //create the election
            election = await new Election(electionData.electionName, electionData.electionOrganisation,
                electionData.electionYear, electionStartDate, electionEndDate);


            //update elections array
            elections.push(election);


            await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));


        } else {
            election = currElections[0];
        }


        //create Candidates for the ballots
        let firstPresParty = await new PresCandidate(ctx, 'Don Mlambo', 'firstParty');
        let secondPresParty = await new PresCandidate(ctx, 'Greg James', 'secondParty');
        let thirdPresParty = await new PresCandidate(ctx, 'Andy Wellington', 'thirdParty');
        let fourthPresParty = await new PresCandidate(ctx, 'Zoe Coventry', 'fourthParty');
        let fifthPresParty = await new PresCandidate(ctx, 'Hurley Price', 'fifthParty');

        let firstvicePresParty = await new ViceCandidate(ctx, 'Emerson Wozniak', 'firstParty');
        let secondvicePresParty = await new ViceCandidate(ctx, 'Willard Sithole', 'secondParty');
        let thirdvicePresParty = await new ViceCandidate(ctx, 'Christine Sanders', 'thirdParty');
        let fourthvicePresParty = await new ViceCandidate(ctx, 'Taurai Moyo', 'fourthParty');
        let fifthvicePresParty = await new ViceCandidate(ctx, 'Christopher Brown', 'fifthParty');

        let firsttresGenParty = await new TresCandidate(ctx, 'Mitchelle Rose', 'firstParty');
        let secondtresGenParty = await new TresCandidate(ctx, 'Mary Kluivert', 'secondParty');
        let thirdtresGenParty = await new TresCandidate(ctx, 'Wonderful Johnson', 'thirdParty');
        let fourthtresGenParty = await new TresCandidate(ctx, 'Nkosana Ncube', 'fourthParty');
        let fifthtresGenParty = await new TresCandidate(ctx, 'Simba Huni', 'fifthParty');

        let firstsecGenParty = await new SecCandidate(ctx, 'Phiona Jones', 'firstParty');
        let secondsecGenParty = await new SecCandidate(ctx, 'Priscilla Wayne', 'secondParty');
        let thirdsecGenParty = await new SecCandidate(ctx, 'Hermione Price', 'thirdParty');
        let fourthsecGenParty = await new SecCandidate(ctx, 'John Seagate', 'fourthParty');
        let fifthsecGenParty = await new SecCandidate(ctx, 'Phillip Johns', 'fifthParty');


        //populate choices array so that the ballots can have all of these choices
        Candidates.push(firstPresParty);
        Candidates.push(secondPresParty);
        Candidates.push(thirdPresParty);
        Candidates.push(fourthPresParty);
        Candidates.push(fifthPresParty);


        Candidates.push(firstvicePresParty);
        Candidates.push(secondvicePresParty);
        Candidates.push(thirdvicePresParty);
        Candidates.push(fourthvicePresParty);
        Candidates.push(fifthvicePresParty);


        Candidates.push(firsttresGenParty);
        Candidates.push(secondtresGenParty);
        Candidates.push(thirdtresGenParty);
        Candidates.push(fourthtresGenParty);
        Candidates.push(fifthtresGenParty);


        Candidates.push(firstsecGenParty);
        Candidates.push(secondsecGenParty);
        Candidates.push(thirdsecGenParty);
        Candidates.push(fourthsecGenParty);
        Candidates.push(fifthsecGenParty);



        for (let i = 0; i < Candidates.length; i++) {


            //save votable choices in world state
            await ctx.stub.putState(Candidates[i].CandidateName, Buffer.from(JSON.stringify(Candidates[i])));


        }


        //generate ballots for all voters
        for (let i = 0; i < voters.length; i++) {


            if (!voters[i].ballot) {


                //give each registered voter a ballot
                await this.generateBallot(ctx, Candidates, election, voters[i]);


            } else {
                console.log('these voters already have ballots');
                break;
            }


        }


        return voters;


    }


    /**
   *
   * generateBallot
   *
   * Creates a ballot in the world state, and updates voter ballot and castBallot properties.
   *
   * @param ctx - the context of the transaction
   * @param Candidates - The different candidates you can vote for, which are on the ballot.
   * @param election - the election we are generating a ballot for. All ballots are the same for an election.
   * @param voter - the voter object
   * @returns - nothing - but updates the world state with a ballot for a particular voter object
   */
    async generateBallot(ctx, Candidates, election, voter) {


        //generate ballot
        let ballot = await new Ballot(ctx, Candidates, election, voter.studentID);


        //set reference to voters ballot
        voter.ballot = ballot.ballotId;
        voter.ballotCreated = true;


        // //update state with ballot object we just created
        await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));


        await ctx.stub.putState(voter.studentID, Buffer.from(JSON.stringify(voter)));


    }



    /**
   *
   * createVoter
   *
   * Creates a voter in the world state, based on the args given.
   * @param args.firstName - first name of voter
   * @param args.lastName - last name of voter
   * @param args.studentID - the Id the voter, used as the key to store the voter object
   *@param args.password - voter password
   * @returns - nothing - but updates the world state with a voter
   */
    async createVoter(ctx, args) {

        args = JSON.parse(args);

        //create a new voter
        let newVoter = await new Voter(args.firstName, args.lastName, args.studentID, args.password);

        //update state with new voter
        await ctx.stub.putState(newVoter.studentID, Buffer.from(JSON.stringify(newVoter)));

        //query state for elections
        let currElections = JSON.parse(await this.queryByObjectType(ctx, 'election'));

        if (currElections.length === 0) {
            let response = {};
            response.error = 'no elections. Run the init() function first.';
            return response;
        }

        //get the election that is created in the init function
        let currElection = currElections[0];

        let Candidates = JSON.parse(await this.queryByObjectType(ctx, 'President','Vice_President',
            'Secretary_General', 'Treasurer_General'));


        //generate ballot with the given Candidates
        await this.generateBallot(ctx, Candidates, currElection, newVoter);

        let response = `voter with studentID ${newVoter.studentID} is updated in the world state`;
        return response;
    }




    /**
   *
   * deleteBallot
   *
   * Deletes a key-value pair from the world state, based on the key given.
   *
   * @param myBallotId - the key of the Ballot to delete
   * @returns - nothing - but deletes the value in the world state
   */
    async deleteBallot(ctx, myBallotId) {


        const exists = await this.BallotExists(ctx, myBallotId);
        if (!exists) {
            throw new Error(`The Ballot ${myBallotId} does not exist`);
        }


        await ctx.stub.deleteState(myBallotId);


    }


    /**
   *
   * readBallot
   *
   * Reads a key-value pair from the world state.
   *
   * @param myBallotId - the key of the Ballot to read
   * @returns - nothing - but reads the value in the world state
   */
    async readBallot(ctx, myBallotId) {


        const exists = await this.BallotExists(ctx, myBallotId);


        if (!exists) {
            // throw new Error(`The my Ballot ${myBallotId} does not exist`);
            let response = {};
            response.error = `The my Ballot ${myBallotId} does not exist`;
            return response;
        }


        const buffer = await ctx.stub.getState(myBallotId);
        const Ballot = JSON.parse(buffer.toString());
        return Ballot;
    }




    /**
   *
   * BallotExists
   *
   * Checks to see if a key exists in the world state.
   * @param myBallotId - the key of the Ballot to read
   * @returns boolean indicating if the Ballot exists or not.
   */
    async BallotExists(ctx, myBallotId) {


        const buffer = await ctx.stub.getState(myBallotId);
        return (!!buffer && buffer.length > 0);


    }


    /**
   *
   * castVote
   *
   * First to checks that a particular studentID has not voted before, and then
   * checks if it is a valid election time, and if it is, we increment the
   * count of the political party that was picked by the voter and update
   * the world state.
   *
   * @param electionId - the electionId of the election we want to vote in
   * @param studentID - the studentID of the voter that wants to vote
   * @param CandidateName - the Id of the candidate the voter has selected.
   * @returns an array which has the winning briefs of the ballot.
   */
    async castVote(ctx, args) {
        args = JSON.parse(args);

        //get the candidates the voter picked
        let choices = (args.president, args.vicepresident, args.secretarygeneral, args.treasurergeneral);

        //check to make sure the election exists
        let electionExists = await this.BallotExists(ctx, args.electionId);

        if (electionExists) {

            //make sure we have an election
            let electionAsBytes = await ctx.stub.getState(args.electionId);
            let election = await JSON.parse(electionAsBytes);
            let voterAsBytes = await ctx.stub.getState(args.studentID);
            let voter = await JSON.parse(voterAsBytes);

            if (voter.ballotCast) {
                let response = {};
                response.error = 'this voter has already cast this ballot!';
                return response;
            }

            //check the date of the election, to make sure the election is still open
            let currentTime = await new Date(2020, 11, 3);

            //parse date objects
            let parsedCurrentTime = await Date.parse(currentTime);
            let electionStart = await Date.parse(election.startDate);
            let electionEnd = await Date.parse(election.endDate);

            //only allow voting if the election has started
            if (parsedCurrentTime >= electionStart && parsedCurrentTime < electionEnd) {

                let candidateExists = await this.BallotExists(ctx, choices);
                if (!candidateExists) {
                    let response = {};
                    response.error = 'Candidate does not exist!';
                    return response;
                }

                //get the votable object from the state - with the Party the user

                let candidateAsBytes = await ctx.stub.getState(choices);
                let votable = await JSON.parse(candidateAsBytes);

                //increase the vote of the political party that was picked by the voter
                await votable.count++;

                //update the state with the new vote count
                let result = await ctx.stub.putState(choices, Buffer.from(JSON.stringify(votable)));
                console.log(result);

                //make sure this voter cannot vote again!
                voter.ballotCast = true;
                voter.picked = {};
                voter.picked = (args.president, args.vicepresident, args.secretarygeneral, args.treasurergeneral);

                //update state to say that this voter has voted, and who they picked
                let response = await ctx.stub.putState(voter.studentID, Buffer.from(JSON.stringify(voter)));
                console.log(response);
                return voter;

            } else {
                let response = {};
                response.error = 'the election is not open now!';
                return response;
            }

        } else {
            let response = {};
            response.error = 'the election or the voter does not exist!';
            return response;
        }
    }


    /**
   * Query and return all key value pairs in the world state.
   *
   * @param {Context} ctx the transaction context
   * @returns - all key-value pairs in the world state
  */
    async queryAll(ctx) {


        let queryString = {
            selector: {}
        };


        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;


    }


    /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
    async queryWithQueryString(ctx, queryString) {


        console.log('query String');
        console.log(JSON.stringify(queryString));


        let resultsIterator = await ctx.stub.getQueryResult(queryString);


        let allResults = [];


        // eslint-disable-next-line no-constant-condition
        while (true) {
            let res = await resultsIterator.next();


            if (res.value && res.value.value.toString()) {
                let jsonRes = {};


                console.log(res.value.value.toString('utf8'));


                jsonRes.Key = res.value.key;


                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }


                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }
    }


    /**
  * Query by the main objects in this app: ballot, election, Candidate, and Voter.
  * Return all key-value pairs of a given type.
  *
  * @param {Context} ctx the transaction context
  * @param {String} objectType the type of the object - should be either ballot, election, Candidate, or Voter
  */
    async queryByObjectType(ctx, objectType) {


        let queryString = {
            selector: {
                type: objectType
            }
        };


        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;


    }
}
module.exports = MyBallotContract;
