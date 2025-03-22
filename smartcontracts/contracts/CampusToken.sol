// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CampusToken is ERC20, Ownable, ERC20Permit {
    constructor(address recipient , address initialOwner)
        ERC20("CampusToken", "BITSG")
        Ownable(initialOwner)
        ERC20Permit("CampusToken")
    {
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }


    // understand the purpose of this function
    //   function stakeTokens(uint256 amount) external {   
    //     require(balanceOf(msg.sender) >= amount, "Insufficient balance"); 
    //     stakedTokens[msg.sender] += amount;
    //     _transfer(msg.sender, address(this), amount);

    // }
    
    function burnTokens(address user, uint256 amount) external {
        require(balanceOf(user) >= amount, "Insufficient balance");
        _burn(user, amount);
    }

    function rewardTokens(address user, uint256 amount) external  {
        _mint(user, amount);
    }


}



