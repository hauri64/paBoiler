var Migrations = artifacts.require("./Migrations.sol");

// var safeMathMock = artifacts.require("./SafeMath.sol");


module.exports = function(deployer) {
    deployer.deploy(Migrations);
    // deployer.deploy(safeMathMock);
};