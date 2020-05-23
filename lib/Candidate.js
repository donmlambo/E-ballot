/* eslint-disable indent */
'use strict';

class Candidate {

    /**
   *
   * Candidate
   *
   * Constructor for a Candidate object. These will eventually be placed on the
   * ballot.
   *
   * @param Party - the Id of the Candidate
   * @param CandidateName - the CandidateName of the Candidate
   * @param studentID - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(ctx, Party, CandidateName) {

    this.Party = Party;
    this.CandidateName = CandidateName;
    this.count = 0;
    this.type = 'contestant';
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;

  }
}
module.exports = Candidate;