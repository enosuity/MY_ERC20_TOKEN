//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

import "hardhat/console.sol"; 

contract Token {
    uint public totalSupply = 1000000;
    
    string public name = "Anuj Contract";
    string public symbol = "ENO";

    address public owner;

    mapping(address => uint256) balances;
    event Transfer(address from, address to, uint256 amount);
    constructor() {
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function transfer(address to, uint256 amount ) external  {
        require(balances[msg.sender] >= amount, "Not Enough Tokens");

        console.log(
            "Transferring from %s to %s %s tokens",
            msg.sender,
            to,
            amount
        );
    

        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function balanceOf(address account) public view returns(uint256) {
        return balances[account];
    }
}