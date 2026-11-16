// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract Counter {
  uint256 public x;

  function inc() public {
    x += 1;
  }

  function incBy(uint256 amount) public {
    require(amount > 0, "Amount must be greater than zero");
    x += amount;
  }
}
