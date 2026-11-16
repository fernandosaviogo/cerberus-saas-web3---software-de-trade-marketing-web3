// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CerberusPay is Ownable, Pausable, ReentrancyGuard {

    IERC20 public acceptedToken;

    uint public mounthyAmount = 0.001 ether;
    uint private constant thirtyDaysInSeconds = 30 * 24 * 60 * 60;

    mapping(address => uint) public payments; // customer => next payment
    address[] public customers;

    event Paid(address indexed customer, uint date, uint amount);
  
    constructor() Ownable(msg.sender) {
        acceptedToken = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48); // USDC token address on Ethereum mainnet
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getCustomers() external view returns (address[] memory) {
        return customers;
    }

    function setAcceptedToken(address tokenAddress) external onlyOwner {
        acceptedToken = IERC20(tokenAddress);
    }

    function setMounthyAmount(uint newAmount) external onlyOwner {
        mounthyAmount = newAmount;
    }

    function withdraw(uint amount) external onlyOwner nonReentrant {
        uint balance = acceptedToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        acceptedToken.transfer(owner(), amount);
    }

    function pay(address customer) external onlyOwner whenNotPaused {
        bool thirtyDaysHavePassed = payments[customer] <= block.timestamp;
        bool firstPayment = payments[customer] == 0;
        bool hasAmount = acceptedToken.balanceOf(customer) >= mounthyAmount;
        bool hasAllowance = acceptedToken.allowance(customer, address(this)) >= mounthyAmount;
        bool timePay = thirtyDaysHavePassed || firstPayment;

        if(!timePay) return;

        if(!hasAmount || !hasAllowance) {
            revert("Insufficient balance or allowance for payment");
        }

        acceptedToken.transferFrom(customer, address(this), mounthyAmount);

        if(firstPayment) {
            customers.push(customer);
        }

        payments[customer] = block.timestamp + thirtyDaysInSeconds; // Set next payment date to 30 days from now

        emit Paid(customer, block.timestamp, mounthyAmount);
    }

}
