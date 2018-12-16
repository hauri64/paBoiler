pragma solidity ^0.4.23;

contract Counter {

    uint256 public counter;
    event changed(uint256 c);

    constructor() public {
    }

    function getCounter() view public returns (uint256) {
        return counter;
    }

   function increment() public {
        counter = counter +1;
        require(counter<10);
        emit changed(counter);
    }

    function decrement() public {
        counter = counter -1;
        require(counter>=0);
        emit changed(counter);
    }

}