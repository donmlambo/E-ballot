/* eslint-disable indent */
'use strict';

class SecretaryGeneral {

    /**
   *
   * Candidate
   *
   * Constructor for a Candidate object. These will eventually be placed on the
   * ballot.
   *
   * @param Name - the Id of the Candidate
   * @param CandidateName - the CandidateName of the Candidate
   * @param studentID - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(ctx, CandidateName, Party) {

    this.CandidateName = CandidateName;
    this.Party = Party;
    this.count = 0;
    this.type = 'Secretary_General';
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;

  }
}
module.exports = SecretaryGeneral;