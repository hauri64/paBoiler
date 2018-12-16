pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./ETHPayable.sol";
import "./SafeMath.sol";

contract SubscriptionManagementETH is ETHPayable, Ownable {
    using SafeMath for uint256;

    event payedOut(uint256 id);

    event subscriptionUpdated(uint256 id);

    Subscription[] subscriptions;

    struct Subscription {
        address customer; //customer that allowed for withdrawl
        address payoutAddress; //Address of the Business that can withdraw
        uint256 cycleStart; //start of the subscription cycle
        uint16 subscriptionTimeFrame; //Length of the subscription (1 Month ususally) in days
        uint256 maxAmount; //Max amount that can be withdrawn in one timeframe
        uint256 withdrawnAmount; //Amount that has been withdrawn so far this timeframe
        bool approved; // true if the subscription is active
    }

    constructor() public {
        owner = msg.sender;
    }

     //adding a subscription
    function addSubscription (address _payoutAddress,
                            uint16 _subscriptionTimeFrame,
                            uint256 _maxAmount) payable public returns(bool)
    {

        Subscription memory s;
        s.customer = msg.sender;
        s.payoutAddress = _payoutAddress;
        s.cycleStart = block.timestamp;
        s.subscriptionTimeFrame = _subscriptionTimeFrame;
        s.maxAmount = _maxAmount;
        s.withdrawnAmount = 0;
        s.approved = true;
        subscriptions.push(s);

        ethbalances[msg.sender] = ethbalances[msg.sender].add(msg.value);
        emit payedInETH(msg.sender, ethbalances[msg.sender]);
        emit subscriptionUpdated(subscriptions.length-1);
        return true;
    }


    function getSubscriptionLength() view public returns(uint256) {
        return subscriptions.length;
    }

    function getSubscrition(uint256 i) view public returns(address, address,uint256,uint16,uint256,uint256,bool) {
        Subscription storage s = subscriptions[i];
        return (
            s.customer,
            s.payoutAddress,
            s.cycleStart,
            s.subscriptionTimeFrame,
            s.maxAmount,
            s.withdrawnAmount,
            s.approved
        );
    }


    function deactivateSubscription(uint256 i) public returns(bool) {
        Subscription storage s = subscriptions[i];
        require(s.approved);
        require(s.customer == msg.sender);
        s.approved = false;
        emit subscriptionUpdated(i);
        return true;
    }

    function activateSubscription(uint256 i) public returns(bool) {
        Subscription storage s = subscriptions[i];
        require(!s.approved);
        require(s.customer == msg.sender);
        s.approved = true;
        emit subscriptionUpdated(i);
        return true;
    }

    function updateSubscription (uint256 i,
                            address _payoutAddress,
                            uint16 _subscriptionTimeFrame,
                            uint256 _maxAmount) public returns(bool)
    {

        Subscription storage s = subscriptions[i];
        require(s.customer == msg.sender);
        s.payoutAddress = _payoutAddress;
        s.subscriptionTimeFrame = _subscriptionTimeFrame;
        s.maxAmount = _maxAmount;
        emit subscriptionUpdated(i);
        return true;
    }

    function withdrawETHForSubscription(uint256[] indices,uint256[] _amounts) onlyOwner public {
        require(indices.length == _amounts.length);
        require(indices.length < 4294967295);
        
        for (uint32 j = 0; j < indices.length; j++) {
           
            Subscription storage s =  subscriptions[indices[j]];

            if(ethbalances[s.customer]<_amounts[j] || !s.approved || s.maxAmount<_amounts[j]+ s.withdrawnAmount) continue;

            s.withdrawnAmount = s.withdrawnAmount.add(_amounts[j]); //5971
            ethbalances[s.customer] = ethbalances[s.customer].sub(_amounts[j]); //6048 gas
            ethbalances[s.payoutAddress] = ethbalances[s.payoutAddress].add(_amounts[j]); //6048 gas
           
            if(s.cycleStart+s.subscriptionTimeFrame*60*60*24<block.timestamp) { //500
              s.cycleStart = block.timestamp; //5378
              s.withdrawnAmount = 0; //5379
            }
         
            emit payedOut(indices[j]); //1123
        }
      
      
    }

   
}
