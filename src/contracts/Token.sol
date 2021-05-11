pragma solidity ^0.5.0;

contract Token {
	string public name = "SweenDoge";
	string public symbol = "SWE";
	uint256 public decimals = 18;
	uint256 public totalSupply;

	constructor() public {
		totalSupply = 10000000 * (10 ** decimals);
	}
}

