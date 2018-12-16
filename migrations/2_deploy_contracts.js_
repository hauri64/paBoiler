var ambr = artifacts.require("./SubscriptionManagementETH.sol");
var mgmterc20 = artifacts.require("./SubscriptionManagementERC20.sol");
var erc20 = artifacts.require("./AmbrToken.sol");

module.exports = function(deployer) {
    //deployer.deploy(ambr);
    var wallet;

    deployer.then(function() {
        return ambr.new();
    }).then(function(instance) {
        wallet = instance;
        console.log('ethambr contract:', wallet.address);
        return mgmterc20.new();
    }).then(function(instance) {
        console.log('erc20ambr contract tata:', instance.address);

    });
};