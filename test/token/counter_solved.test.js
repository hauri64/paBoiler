const counter = artifacts.require('Counter');

contract('counter', function([owner, subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await counter.new({ from: owner });
        console.log('This is the contract address' + this.contract.address);
    });


    describe('on increment', function() {

        beforeEach(async function() {
            await this.contract.increment();
        });

        it('is incremented', async function() {

            const o = await this.contract.getCounter({ from: subscriber });
            assert.equal(o.toNumber(), 1);
        });
    });

    describe('on decrement', function() {

        beforeEach(async function() {
            await this.contract.increment();
            await this.contract.decrement();
        });

        it('is decremented', async function() {

            const o = await this.contract.getCounter({ from: subscriber });
            assert.equal(o.toNumber(), 0);
        });
    });

});