pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./ERC20.sol";

contract SubscriptionManagementERC20 is  Ownable {
    using SafeMath for uint256;

    event payedOut(uint256 id);

    event subscriptionUpdated(uint256 id);

    Subscription[] subscriptions;

    struct Subscription {
        address tokenAddress; //customer that allowed for withdrawl
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
    function addSubscription (
                            address _tokenAddress,
                            address _payoutAddress,
                            uint16 _subscriptionTimeFrame,
                            uint256 _maxAmount) public returns(bool)
    {
        
        Subscription memory s;
        s.tokenAddress = _tokenAddress;
        s.customer = msg.sender;
        s.payoutAddress = _payoutAddress;
        s.cycleStart = block.timestamp;
        s.subscriptionTimeFrame = _subscriptionTimeFrame;
        s.maxAmount = _maxAmount;
        s.withdrawnAmount = 0;
        s.approved = true;
        subscriptions.push(s);
        emit subscriptionUpdated(subscriptions.length-1);
        return true;
    }


    function getSubscriptionLength() view public returns(uint256) {
        return subscriptions.length;
    }

    function getSubscrition(uint256 i) view public returns(address, address,uint256,uint16,uint256,uint256,bool,address) {
        Subscription storage s = subscriptions[i];
        return (
            s.customer,
            s.payoutAddress,
            s.cycleStart,
            s.subscriptionTimeFrame,
            s.maxAmount,
            s.withdrawnAmount,
            s.approved,
            s.tokenAddress
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

    function withdrawERC20ForSubscription(uint256[] indices,uint256[] _amounts) onlyOwner public {
        require(indices.length == _amounts.length);
        require(indices.length < 4294967295);
        
        for (uint32 j = 0; j < indices.length; j++) {
           
            Subscription storage s =  subscriptions[indices[j]];
            ERC20 token = ERC20(s.tokenAddress);

            if(token.allowance(s.customer,address(this))<_amounts[j] || !s.approved || s.maxAmount<_amounts[j]+ s.withdrawnAmount) continue;
            
            token.transferFrom(s.customer,s.payoutAddress,_amounts[j]);

            s.withdrawnAmount = s.withdrawnAmount.add(_amounts[j]); //5971
           
            if(s.cycleStart+s.subscriptionTimeFrame*60*60*24<block.timestamp) { //500
              s.cycleStart = block.timestamp; //5378
              s.withdrawnAmount = 0; //5379
            }
         
            emit payedOut(indices[j]); //1123
        }
      
      
    }

   
}
