const assertRevert = require('../helpers/assertRevert');

const ambr = artifacts.require('SubscriptionManagementETH');

contract('ETHPayable', function([subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await ambr.new();
    });

    describe('payIn', function() {
        it('account has 11111', async function() {
            const { logs } = await this.contract.sendTransaction({ from: subscriber, value: 11111 });
            const event = logs.find(s => s.event === 'payedInETH');
            assert.equal(!!event, true);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.amount.toNumber(), 11111);
        });

    });

    describe('payInFor', function() {
        it('account has 11111', async function() {
            const { logs } = await this.contract.payInFor(subscriber, { from: anotherAccount, value: 11111 });
            const event = logs.find(s => s.event === 'payedInETH');
            assert.equal(!!event, true);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.amount.toNumber(), 11111);
        });

        it('fails because of 0 address', async function() {
            await assertRevert(this.contract.payInFor(0x0, { from: anotherAccount, value: 11111 }));
        });

    });

    describe('getTotalETHBalance', function() {
        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 11111 });
            await this.contract.sendTransaction({ from: anotherAccount, value: 11111 });
        });

        it('total is 22222', async function() {
            const p = await this.contract.getTotalETHBalance({ from: subscriber });
            assert.equal(p.toNumber(), 22222);
        });

    });


    describe('getBalance', function() {
        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 11111 });
        });

        it('account has 11111', async function() {

            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });
            assert.equal(p.toNumber(), 11111);
        });

        it('other account has 0', async function() {
            const p = await this.contract.getETHBalance(anotherAccount, { from: anotherAccount });
            assert.equal(p.toNumber(), 0);
        });

        describe('another account pays in', function() {
            it('account has 11111', async function() {
                await this.contract.sendTransaction({ from: anotherAccount, value: 11111 });
                const p = await this.contract.getETHBalance(subscriber, { from: subscriber });
                assert.equal(p.toNumber(), 11111);
            });
        });
    });

    describe('withdrawETHFunds', function() {
        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 10000 });
        });

        it('withdraw 1000 then account has 9000', async function() {
            const { logs } = await this.contract.withdrawETHFunds(1000, { from: subscriber });
            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });

            const event = logs.find(s => s.event === 'withdrawnETH');
            assert.equal(!!event, true);
            assert.equal(event.args.customer, subscriber);
            assert.equal(event.args.to, subscriber);
            assert.equal(event.args.amount.toNumber(), 1000);

            assert.equal(p.toNumber(), 9000);
        });

        it('withdraw all then account has 0', async function() {
            const { logs } = await this.contract.withdrawETHFunds(10000, { from: subscriber });
            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });

            const event = logs.find(s => s.event === 'withdrawnETH');
            assert.equal(!!event, true);
            assert.equal(event.args.customer, subscriber);
            assert.equal(event.args.to, subscriber);
            assert.equal(event.args.amount.toNumber(), 10000);

            assert.equal(p.toNumber(), 0);
        });

        it('withdrawing too much', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.withdrawETHFunds(10001, { from: subscriber }));
            });
        });

        it('withdrawing from another account', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.withdrawETHFunds(10001, { from: anotherAccount }));
            });
        });

    });


    describe('withdrawETHFundsTo', function() {
        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 10000 });
        });

        it('withdraw 1000 then account has 9000', async function() {
            const { logs } = await this.contract.withdrawETHFundsTo(1000, recipient, { from: subscriber });
            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });

            const event = logs.find(s => s.event === 'withdrawnETH');
            assert.equal(!!event, true);
            assert.equal(event.args.customer, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.amount.toNumber(), 1000);

            assert.equal(p.toNumber(), 9000);
        });

        it('withdraw all then account has 0', async function() {
            const { logs } = await this.contract.withdrawETHFundsTo(10000, recipient, { from: subscriber });
            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });

            const event = logs.find(s => s.event === 'withdrawnETH');
            assert.equal(!!event, true);
            assert.equal(event.args.customer, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.amount.toNumber(), 10000);

            assert.equal(p.toNumber(), 0);
        });

        it('withdrawing too much', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.withdrawETHFundsTo(10001, recipient, { from: subscriber }));
            });
        });

        it('withdrawing from another account', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.withdrawETHFundsTo(10001, recipient, { from: anotherAccount }));
            });
        });

    });

    describe('transferFunds', function() {
        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 10000 });
        });

        it('withdraw 1000 then account has 9000', async function() {
            const { logs } = await this.contract.transferFunds(recipient, 1000, { from: subscriber });
            const b = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const p = await this.contract.getETHBalance(recipient, { from: subscriber });

            const event = logs.find(s => s.event === 'transfered');
            assert.equal(!!event, true);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.amount.toNumber(), 1000);

            assert.equal(b.toNumber(), 9000);
            assert.equal(p.toNumber(), 1000);
        });

        it('withdraw all then account has 0', async function() {
            const { logs } = await this.contract.transferFunds(recipient, 10000, { from: subscriber });
            const b = await this.contract.getETHBalance(recipient, { from: subscriber });
            const p = await this.contract.getETHBalance(subscriber, { from: subscriber });

            const event = logs.find(s => s.event === 'transfered');
            assert.equal(!!event, true);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.amount.toNumber(), 10000);

            assert.equal(p.toNumber(), 0);
            assert.equal(b.toNumber(), 10000);
        });

        it('withdrawing too much', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.transferFunds(recipient, 10001, { from: subscriber }));
            });
        });

        it('withdrawing to 0x0', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.transferFunds('0x0', 10001, { from: subscriber }));
            });
        });

        it('withdrawing from another account', async function() {

            it('reverts', async function() {
                await assertRevert(this.contract.transferFunds(recipient, 10001, { from: anotherAccount }));
            });
        });

    });

    // transferFunds


});