'use strict';

class Voter {
    /**
   *
   * Voter
   *
   * Constructor for a Voter object. Voter has a studentID, name, surname and password
   *
   * @param items - an array of choices
   * @param election - what election you are making ballots for
   * @param studentID - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
    constructor(firstName, lastName, studentID, password) {

        if (this.validateVoter(studentID)) {

            this.firstName = firstName;
            this.lastName = lastName;
            this.studentID = studentID;
            this.password = password;
            this.ballotCreated = false;
            this.type = 'voter';
            if (this.__isContract) {
                delete this.__isContract;
            }
            if (this.name) {
                delete this.name;
            }
            return this;

        } else if (!this.validateVoter(studentID)){
            throw new Error('the studentID is not valid.');
        } else {
            throw new Error('the registrarId is not valid.');
        }

    }

    /**
   *
   * validateVoter
   *
   * check for valid Identity
   *
   * @param studentID - an array of choices
   * @returns - valid/invalid voter
   */
    async validateVoter(studentID , password) {
    //studentID error checking here.
        if (studentID && password) {
            return true;
        } else {
            return false;
        }
    }

}
module.exports = Voter;