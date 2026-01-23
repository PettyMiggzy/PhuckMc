export const ORACLE_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getPot",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "predictions",
    "outputs": [
      { "internalType": "address", "type": "address" },
      { "internalType": "address", "type": "address" },
      { "internalType": "uint256", "type": "uint256" },
      { "internalType": "uint256", "type": "uint256" },
      { "internalType": "uint64", "type": "uint64" },
      { "internalType": "uint64", "type": "uint64" },
      { "internalType": "uint64", "type": "uint64" },
      { "internalType": "uint8", "type": "uint8" },
      { "internalType": "uint256", "type": "uint256" },
      { "internalType": "bytes32", "type": "bytes32" },
      { "internalType": "uint8", "type": "uint8" },
      { "internalType": "address", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "creatorWins", "type": "bool" }
    ],
    "name": "resolve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
