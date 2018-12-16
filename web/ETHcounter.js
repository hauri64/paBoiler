counter = {};
window.addEventListener('load', function() {

    var _web3;
    var contractAddress = '0x053d7f5bae226319b1eb956551a2f4ad4e1aaa93'; //put the current address here!
    console.log(web3);
    if (typeof web3 !== 'undefined') {
        this.console.log('hello web3', web3);
        web3js = new Web3(web3.currentProvider);
        //web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
        _web3 = web3;
        counter.increment = increment;
        counter.decrement = decrement;
        counter.getCounter = getCounter;
    }


    this.console.log('hello hello');

    function increment() {
        return new Promise(function(resolve, reject) {
            getAccount()
                .then(function(acc) {
                    var instance = _web3.eth.contract(contract.abi).at(contractAddress);
                    console.log(instance);
                    instance.increment({ gas: 500000, from: acc }, function(e, res) {
                        if (e) { reject(e); }
                        resolve(res);
                    });
                });
        });
    }

    function decrement() {
        return new Promise(function(resolve, reject) {
            getAccount()
                .then(function(acc) {
                    var instance = _web3.eth.contract(contract.abi).at(contractAddress);
                    instance.decrement({ gas: 500000, from: acc }, function(e, res) {
                        if (e) { reject(e); }
                        resolve(res);
                    });
                });
        });
    }


    function getCounter() {
        return new Promise(function(resolve, reject) {
            getAccount()
                .then(function(acc) {
                    var instance = _web3.eth.contract(contract.abi).at(contractAddress);
                    console.log(instance);
                    instance.getCounter({ from: acc }, function(e, res) {
                        if (e) { reject(e); }
                        resolve(res);
                    });
                });
        });
    }



    function methaMaskLoaded() {
        return _web3;
    }

    function metaMaskLocked() {
        return _web3.eth.accounts.length > 0;
    }


    function getAccount() {
        return new Promise(function(resolve, reject) {
            _web3.eth.getAccounts(function(e, o) {
                if (e) return reject(e);
                return resolve(o[0]);
            });
        });
    }

    function getAccountBalance() {
        return new Promise(function(resolve, reject) {
            getAccount()
                .then(function(acc) {
                    if (!acc) { return resolve(null); }
                    _web3.eth.getBalance(acc, function(e, o) {
                        if (e) return reject(e);
                        var value = _web3.fromWei(o);
                        return resolve(value);
                    });
                });
        });
    }






    var contract = {
        "abi": [{
                "constant": true,
                "inputs": [],
                "name": "counter",
                "outputs": [{
                    "name": "",
                    "type": "uint256"
                }],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [{
                    "indexed": false,
                    "name": "c",
                    "type": "uint256"
                }],
                "name": "changed",
                "type": "event"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getCounter",
                "outputs": [{
                    "name": "",
                    "type": "uint256"
                }],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "increment",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "decrement",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
    };
});