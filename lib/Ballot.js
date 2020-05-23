'use strict';

class Ballot {

    /**
   *
   * @param items - an array of choices
   * @param election - what election you are making ballots for
   * @param studentID - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
    constructor(ctx, items, election, studentID) {

        if (this.validateBallot(ctx, studentID)) {

            this.Candidates = items;
            this.election = election;
            this.studentID = studentID;
            this.ballotCast = false;
            this.ballotId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.type = 'ballot';
            if (this.__isContract) {
                delete this.__isContract;
            }
            if (this.name) {
                delete this.name;
            }
            return this;

        } else {
            console.log('a ballot has already been created for this voter');
            throw new Error ('a ballot has already been created for this voter');
        }
    }

    /**
   *
   * validateBallot
   *
   * check to make sure a ballot has not been created for this
   * voter.
   *
   * @param studentID - the unique Id for a registered voter
   * @returns -valid or invalid voter
   */
    async validateBallot(ctx, studentID) {

        const buffer = await ctx.stub.getState(studentID);

        if (!!buffer && buffer.length > 0) {
            let voter = JSON.parse(buffer.toString());
            if (voter.ballotCreated) {
                console.log('ballot has already been created for this voter');
                return false;
            } else {
                return true;
            }
        } else {
            console.log('This ID is not registered to vote.');
            return false;
        }
    }
}
module.exports = Ballot;