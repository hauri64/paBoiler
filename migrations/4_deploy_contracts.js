var cont = artifacts.require("./SubscriptionManagementETH.sol");


module.exports = function(deployer) {
    //deployer.deploy(cont);
    var wallet;

    deployer.then(function() {
        return cont.new();
    }).then(function(instance) {
        wallet = instance;
        console.log('contract:', wallet.address);
    })
};