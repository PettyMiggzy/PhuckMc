// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PhuckVault {
    address public immutable owner;
    address public immutable factory;
    uint256 public immutable createdAt;

    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount);
    event NativeDeposited(uint256 amount);
    event NativeWithdrawn(uint256 amount);

    error NotOwner();
    error TransferFailed();
    error ZeroAmount();
    error InsufficientBalance();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _owner) {
        owner = _owner;
        factory = msg.sender;
        createdAt = block.timestamp;
    }

    function deposit(address token, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        bool ok = IERC20(token).transferFrom(owner, address(this), amount);
        if (!ok) revert TransferFailed();
        emit Deposited(token, amount);
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientBalance();
        bool ok = IERC20(token).transfer(owner, amount);
        if (!ok) revert TransferFailed();
        emit Withdrawn(token, amount);
    }

    function depositNative() external payable onlyOwner {
        if (msg.value == 0) revert ZeroAmount();
        emit NativeDeposited(msg.value);
    }

    function withdrawNative(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (address(this).balance < amount) revert InsufficientBalance();
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit NativeWithdrawn(amount);
    }

    function balanceOf(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function nativeBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        emit NativeDeposited(msg.value);
    }
}
