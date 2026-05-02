// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PhuckVault.sol";

/**
 * @title PhuckVaultFactory
 * @notice Deploys unique PhuckVault contracts for each user.
 *         One vault per wallet. No fees, no admin.
 *
 *         Tier gating (2M $PHUCK required) is enforced at the FRONTEND
 *         level via balance check. Factory itself is open — bypassing
 *         the frontend just means deploying a vault that nobody can see
 *         in the official UI, no harm done.
 */

contract PhuckVaultFactory {
    mapping(address => address) public userVault;
    address[] public allVaults;

    event VaultCreated(address indexed owner, address indexed vault, uint256 totalVaultsAtCreation);

    error VaultAlreadyExists();

    function createMyVault() external returns (address vault) {
        if (userVault[msg.sender] != address(0)) revert VaultAlreadyExists();

        vault = address(new PhuckVault(msg.sender));
        userVault[msg.sender] = vault;
        allVaults.push(vault);

        emit VaultCreated(msg.sender, vault, allVaults.length);
    }

    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    function hasVault(address user) external view returns (bool) {
        return userVault[user] != address(0);
    }

    function getVault(address user) external view returns (address) {
        return userVault[user];
    }
}
