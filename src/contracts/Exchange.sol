pragma solidity ^0.5.0;

// TODO:
// [x] Set the fee account
// [ ] Deposit Ether
// [ ] Withdraw Ether
// [ ] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make Order
// [ ] Cancel Order
// [ ] Fill Order
// [ ] Charge fees

contract Exchange{
	// Properties
	address public feeAccount; // the account that receives exchange fees
	uint256 public feePercent;

	constructor(address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
}
