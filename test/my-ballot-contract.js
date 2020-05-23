/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyBallotContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('MyBallotContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MyBallotContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"my ballot 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"my ballot 1002 value"}'));
    });

    describe('#myBallotExists', () => {

        it('should return true for a my ballot', async () => {
            await contract.myBallotExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a my ballot that does not exist', async () => {
            await contract.myBallotExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMyBallot', () => {

        it('should create a my ballot', async () => {
            await contract.createMyBallot(ctx, '1003', 'my ballot 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"my ballot 1003 value"}'));
        });

        it('should throw an error for a my ballot that already exists', async () => {
            await contract.createMyBallot(ctx, '1001', 'myvalue').should.be.rejectedWith(/The my ballot 1001 already exists/);
        });

    });

    describe('#readMyBallot', () => {

        it('should return a my ballot', async () => {
            await contract.readMyBallot(ctx, '1001').should.eventually.deep.equal({ value: 'my ballot 1001 value' });
        });

        it('should throw an error for a my ballot that does not exist', async () => {
            await contract.readMyBallot(ctx, '1003').should.be.rejectedWith(/The my ballot 1003 does not exist/);
        });

    });

    describe('#updateMyBallot', () => {

        it('should update a my ballot', async () => {
            await contract.updateMyBallot(ctx, '1001', 'my ballot 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"my ballot 1001 new value"}'));
        });

        it('should throw an error for a my ballot that does not exist', async () => {
            await contract.updateMyBallot(ctx, '1003', 'my ballot 1003 new value').should.be.rejectedWith(/The my ballot 1003 does not exist/);
        });

    });

    describe('#deleteMyBallot', () => {

        it('should delete a my ballot', async () => {
            await contract.deleteMyBallot(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a my ballot that does not exist', async () => {
            await contract.deleteMyBallot(ctx, '1003').should.be.rejectedWith(/The my ballot 1003 does not exist/);
        });

    });

});