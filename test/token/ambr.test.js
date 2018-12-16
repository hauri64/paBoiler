const assertRevert = require('../helpers/assertRevert');
const assertInvalidOpCode = require('../helpers/assertInvalidOpcode');
const time = require('../helpers/increaseTime');

const ambr = artifacts.require('SubscriptionManagementETH');

contract('ambr', function([owner, subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await ambr.new({ from: owner });
    });


    describe('withdrawETHForSubscription', function() {

        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 10000 });
            await this.contract.addSubscription(recipient, 30, 1000, { from: subscriber });
            await this.contract.addSubscription(recipient, 30, 1000, { from: anotherAccount });
        });

        it('estimate gas', async function() {

            const indices = [];
            const amounts = [];
            for (var i = 0; i < 320; i++) {
                indices.push(0);
                amounts.push(1);

                indices.push(1);
                amounts.push(1);
            }

            const estimatedGas = await this.contract.withdrawETHForSubscription.estimateGas(indices, amounts, { gasLimit: 8000000, from: owner });
            console.log('used gas for withdrawETHForSubscription ', estimatedGas, estimatedGas - 23134, (estimatedGas) / amounts.length / 2);
            assert(true);
        });

        it('execute multiple withdrawls at once', async function() {

            const indices = [];
            const amounts = [];
            for (var i = 0; i < 10; i++) {
                indices.push(0);
                amounts.push(1);
            }

            await this.contract.withdrawETHForSubscription(indices, amounts, { from: owner });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            assert.equal(o.toNumber(), 9990);
            assert.equal(other.toNumber(), 10);
        });

        it('has exact balance', async function() {
            const trans = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            const logs = trans.logs;
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 9900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing 2x has exact balance', async function() {
            const first = await this.contract.withdrawETHForSubscription([0], [50], { from: owner });
            const second = await this.contract.withdrawETHForSubscription([0], [50], { from: owner });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 9900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing again after timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            await time.increaseTimeTo(sub[2].toNumber() + time.duration.days(31));
            const second = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 9800);
            assert.equal(other.toNumber(), 200);
        });

        it('withdrawing again after long timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            await time.increaseTimeTo(sub[2].toNumber() + time.duration.days(61));
            const second = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 9800);
            assert.equal(other.toNumber(), 200);
        });


        it('withdrawing too much fails', async function() {
            const trans = await this.contract.withdrawETHForSubscription([0], [2000], { from: owner });
            const logs = trans.logs;
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, false);
        });


        it('withdrawing from not approved subscription fails', async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
            const trans = await this.contract.withdrawETHForSubscription([0], [100], { from: owner });
            const logs = trans.logs;
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, false);
        });

        it('withdrawing from wrong address fails', async function() {
            await assertRevert(this.contract.withdrawETHForSubscription([0], [100], { from: anotherAccount }));
        });

        it('withdrawing from inexistent subscription fails', async function() {
            await assertInvalidOpCode(this.contract.withdrawETHForSubscription([2], [100], { from: owner }));
        });


    });

});