pragma solidity ^0.4.11;


contract Owned {
    address owner;

    // modifier
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Owned() {
        owner = msg.sender;
    }
}