const assertRevert = require('../helpers/assertRevert');
const assertInvalidOpcode = require('../helpers/assertInvalidOpcode');
const time = require('../helpers/increaseTime');


const ambr = artifacts.require('SubscriptionManagementERC20');
const ambrToken = artifacts.require('AmbrToken');

contract('subscriptionManagement', function([subscriber, recipient, anotherAccount, owner]) {

    beforeEach(async function() {
        this.contract = await ambr.new({ from: owner });
        this.tokenContract = await ambrToken.new({ from: owner });
        await this.tokenContract.mint(subscriber, 100000000, { from: owner });
        await this.tokenContract.approve(this.contract.address, 100000000, { from: subscriber });
        await this.contract.addSubscription(this.tokenContract.address, recipient, 30, 1000, { from: subscriber });

    });

    describe('getSubscrition', function() {

        it('subscription has all correct attributes', async function() {
            const o = await this.contract.getSubscrition(0, { from: subscriber });
            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0xfc50098f9491e09d96877c034f6a3f3ee4aff3ae');
            assert.equal(o[3].toNumber(), 30);
            assert.equal(o[4].toNumber(), 1000);
            assert.equal(o[5].toNumber(), 0);
            assert.equal(o[6], true);
            assert.equal(o[7], this.tokenContract.address);
        });

        it('anyone calling', async function() {

            const o = await this.contract.getSubscrition(0, { from: anotherAccount });
            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0xfc50098f9491e09d96877c034f6a3f3ee4aff3ae');
            assert.equal(o[3].toNumber(), 30);
            assert.equal(o[4].toNumber(), 1000);
            assert.equal(o[5].toNumber(), 0);
            assert.equal(o[6], true);
            assert.equal(o[7], this.tokenContract.address);
        });

    });

    describe('getSubscriptionLength', function() {

        it('has 1 subscription', async function() {
            const o = await this.contract.getSubscriptionLength({ from: subscriber });
            assert.equal(o.toNumber(), 1);
        });

        it('anyone calling', async function() {
            const o = await this.contract.getSubscriptionLength({ from: anotherAccount });
            assert.equal(o.toNumber(), 1);
        });

        describe('adding a second Subscription', function() {
            it('has 2 subscriptions', async function() {
                await this.contract.addSubscription(this.tokenContract.address, recipient, 40, 100, { from: subscriber });
                const o = await this.contract.getSubscriptionLength({ from: subscriber });
                assert.equal(o.toNumber(), 2);
            });
        });

    });

    describe('addSubscription', function() {

        it('has correct event', async function() {
            const { logs } = await this.contract.addSubscription(this.tokenContract.address, recipient, 40, 100, { from: subscriber });
            const event = logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            const args = event.args;
            assert.equal(args.id.toNumber(), 1);

        });

    });


    describe('deactivate Subscription', function() {

        it('is deactivated', async function() {

            const { logs } = await this.contract.deactivateSubscription(0, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });

            const event = logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o[6], false);
        });

        describe('deactivate deactivated', function() {

            it('reverts', async function() {
                await this.contract.deactivateSubscription(0, { from: subscriber });
                await assertRevert(this.contract.deactivateSubscription(0, { from: subscriber }));
            });
        });

        describe('someone else deactivates', function() {
            it('reverts', async function() {
                await assertRevert(this.contract.deactivateSubscription(0, { from: anotherAccount }));
            });
        });

    });

    describe('activate Subscription', function() {

        beforeEach(async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
        });

        it('is activated', async function() {

            const p = await this.contract.activateSubscription(0, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });

            const event = p.logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o[6], true);
        });

        describe('activate activated', function() {

            it('reverts', async function() {
                await this.contract.activateSubscription(0, { from: subscriber });
                await assertRevert(this.contract.activateSubscription(0, { from: subscriber }));
            });
        });

        describe('someone else activates', function() {

            it('reverts', async function() {
                await assertRevert(this.contract.deactivateSubscription(0, { from: anotherAccount }));
            });
        });

    });

    describe('updateSubscription', function() {

        it('subscription has all correct updated Attributes', async function() {
            const { logs } = await this.contract.updateSubscription(0, '0x8d6f4be11122cf0f59fcac3b13939f03a964b385', 3, 50, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });

            const event = logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);

            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0x8d6f4be11122cf0f59fcac3b13939f03a964b385');
            assert.equal(o[3].toNumber(), 3);
            assert.equal(o[4].toNumber(), 50);
            assert.equal(o[5].toNumber(), 0);
            assert.equal(o[6], true);
            assert.equal(o[7], this.tokenContract.address);
        });

        it('anyone calling', async function() {

            it('reverts', async function() {

                await assertRevert(this.contract.updateSubscription(0, '0x8d6f4be11122cf0f59fcac3b13939f03a964b385', 3, 50, { from: anotherAccount }));
            });
        });

    });

    describe('withdrawERC20ForSubscription', function() {

        beforeEach(async function() {
            //await this.contract.sendTransaction({ from: subscriber, value: 10000 });
            await this.contract.addSubscription(this.tokenContract.address, recipient, 30, 1000, { from: subscriber });
            await this.contract.addSubscription(this.tokenContract.address, recipient, 30, 1000, { from: anotherAccount });
        });

        it('withdraw once', async function() {

            await this.contract.withdrawERC20ForSubscription([0], [123], { from: owner });

            const o = await this.contract.getSubscrition(0, { from: subscriber });
            const tokenBalance = await this.tokenContract.balanceOf(recipient, { from: subscriber });
            assert.equal(tokenBalance.toNumber(), 123);
            assert.equal(o[5].toNumber(), 123);

        });

        it('withdraw 2x withdrawnAmount in this cycle', async function() {

            await this.contract.withdrawERC20ForSubscription([0], [123], { from: owner });
            await this.contract.withdrawERC20ForSubscription([0], [123], { from: owner });
            const tokenBalance = await this.tokenContract.balanceOf(recipient, { from: subscriber });

            const o = await this.contract.getSubscrition(0, { from: subscriber });
            assert.equal(o[5].toNumber(), 246);
            assert.equal(tokenBalance.toNumber(), 246);
            assert(true);
        });

        it('estimate gas', async function() {

            const indices = [];
            const amounts = [];
            for (var i = 0; i < 10; i++) {
                indices.push(0);
                amounts.push(1);

                indices.push(1);
                amounts.push(1);
            }

            const estimatedGas = await this.contract.withdrawERC20ForSubscription.estimateGas(indices, amounts, { gasLimit: 8000000, from: owner });
            console.log('used gas for withdrawERC20ForSubscription ', estimatedGas, estimatedGas - 23134, (estimatedGas) / amounts.length / 2);
            assert(true);
        });

        it('execute multiple withdrawls at once', async function() {

            const indices = [];
            const amounts = [];
            for (var i = 0; i < 10; i++) {
                indices.push(0);
                amounts.push(1);
            }

            await this.contract.withdrawERC20ForSubscription(indices, amounts, { from: owner });
            const o = await this.tokenContract.balanceOf(subscriber, { from: subscriber });
            const other = await this.tokenContract.balanceOf(recipient, { from: subscriber });
            assert.equal(o.toNumber(), 99999990);
            assert.equal(other.toNumber(), 10);
        });

        it('has exact balance', async function() {
            const trans = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            const logs = trans.logs;
            const o = await this.tokenContract.balanceOf(subscriber, { from: subscriber });
            const other = await this.tokenContract.balanceOf(recipient, { from: recipient });
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 99999900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing 2x has exact balance', async function() {
            const first = await this.contract.withdrawERC20ForSubscription([0], [50], { from: owner });
            const second = await this.contract.withdrawERC20ForSubscription([0], [50], { from: owner });
            const o = await this.tokenContract.balanceOf(subscriber, { from: subscriber });
            const other = await this.tokenContract.balanceOf(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 99999900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing again after timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            await time.increaseTimeTo(sub[2].toNumber() + time.duration.days(31));
            const second = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            const o = await this.tokenContract.balanceOf(subscriber, { from: subscriber });
            const other = await this.tokenContract.balanceOf(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 99999800);
            assert.equal(other.toNumber(), 200);
        });

        it('withdrawing again after long timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            await time.increaseTimeTo(sub[2].toNumber() + time.duration.days(61));
            const second = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            const o = await this.tokenContract.balanceOf(subscriber, { from: subscriber });
            const other = await this.tokenContract.balanceOf(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(!!event2, true);
            assert.equal(event2.args.id.toNumber(), 0);
            assert.equal(o.toNumber(), 99999800);
            assert.equal(other.toNumber(), 200);
        });


        it('withdrawing too much fails', async function() {
            const trans = await this.contract.withdrawERC20ForSubscription([0], [2000], { from: owner });
            const logs = trans.logs;
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, false);
        });


        it('withdrawing from not approved subscription fails', async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
            const trans = await this.contract.withdrawERC20ForSubscription([0], [100], { from: owner });
            const logs = trans.logs;
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, false);
        });

        it('withdrawing from wrong address fails', async function() {
            await assertRevert(this.contract.withdrawERC20ForSubscription([0], [100], { from: anotherAccount }));
        });

        it('withdrawing from inexistent subscription fails', async function() {
            await assertInvalidOpcode(this.contract.withdrawERC20ForSubscription([3], [100], { from: owner }));

        });


    });

});