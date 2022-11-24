pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";

contract Swapper {

	address public owner;

	// Tokens
	IERC20 public CToken;

	// CToken/Token exchange rate
	uint public CTokenPrice = 1;

	constructor() {

		owner = msg.sender;
		CToken = new Token("SwapperTokenC", "STC", address(this));

	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Not owner");
		_;
	}


	// User should approve contract to spend needed amount of token
	// And then call this function 
	function swap(address token_, uint amount) public {

		// Amount of CToken according to CToken/Token exchange rate
		uint transferAmount = calculateCTokenFromToken(amount);

		IERC20 tokenToSwap = IERC20(token_);
		
		// Check the availability of funds
		require(tokenToSwap.allowance(msg.sender, address(this)) >= amount, "Insufficient Swapper allowance");
		require(CToken.balanceOf(address(this)) >= transferAmount, "Insufficient amount of CToken");
		
		// Make transfers
		require(tokenToSwap.transferFrom(msg.sender, address(this), amount), "Token transfer to Swapper error");
		require(CToken.transfer(msg.sender, transferAmount), "CToken transfer to caller error");

	}

	// User should approve contract to spend needed amount of CToken
	// And then call this function
	function unswap(address token_, uint amount) public {

		IERC20 tokenToReceive = IERC20(token_);
		
		// Amount of Token to be received by user according to CToken/Token exchange rate
		uint transferAmount = calculateTokenFromCToken(amount);

		// Check the availability of funds
		require(CToken.allowance(msg.sender, address(this)) >= amount, "Insufficient Swapper allowance");
		require(tokenToReceive.balanceOf(address(this)) >= transferAmount, "Insufficient amount of CToken");
		
		// Make transfers
		require(CToken.transferFrom(msg.sender, address(this), amount), "Token transfer to Swapper error");
		require(tokenToReceive.transfer(msg.sender, transferAmount), "CToken transfer to caller error");

	}

	// Get CToken/Token exchange rate
	function getCTokenPrice() public view returns (uint) {
		return CTokenPrice;
	}

	// Set CToken/Token exchange rate
	function setCTokenPrice(uint price) public onlyOwner {
		CTokenPrice = price;
	}

	// Calculate amount of CToken to be received according to CToken/Token exchange rate
	function calculateCTokenFromToken(uint amount) public view returns (uint) {
		return amount / getCTokenPrice();
	}

	// Calculate amount of Token to be received according to CToken/Token exchange rate
	function calculateTokenFromCToken(uint amount) public view returns (uint) {
		return amount * getCTokenPrice();
	}


}