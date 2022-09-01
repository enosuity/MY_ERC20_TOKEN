//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Goldy is ERC20 {
    // uint public _totalSupply;

    // mapping(address => uint) _balanceOf;
    // mapping(address => mapping(address => uint256)) _allowance;

    // string public _name = "My ERC20";
    // string public _symbol = "RAM";
    // uint public _decimal = 8;
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount); 
    }
}