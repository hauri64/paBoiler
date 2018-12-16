var WalletProvider = require("truffle-wallet-provider");

// Read and unlock keystore
var wallet = require('ethereumjs-wallet').fromPrivateKey('3cbd62c029c7542dad7ae4936547f203f8d449a8d3e74498582f088b7deed6d4');

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*", // Match any network id
            gas: 47123880
        },
        ropsten: {
            provider: new WalletProvider(wallet, "https://ropsten.infura.io/qaveCKWstr1JyARcFKaY"),
            network_id: 3
        }
    }
};