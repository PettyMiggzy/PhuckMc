export const PREDICTIONS_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
    { "indexed": false, "internalType": "string", "name": "feeType", "type": "string" }
  ], "name": "FeePaid", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }
  ], "name": "PredictionCancelled", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
    { "indexed": true, "internalType": "bytes32", "name": "marketId", "type": "bytes32" },
    { "indexed": false, "internalType": "uint8", "name": "side", "type": "uint8" },
    { "indexed": false, "internalType": "uint256", "name": "targetPrice", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "escrow", "type": "uint256" },
    { "indexed": false, "internalType": "uint64", "name": "expiry", "type": "uint64" },
    { "indexed": false, "internalType": "uint64", "name": "matchDeadline", "type": "uint64" }
  ], "name": "PredictionCreated", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "opponent", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "escrow", "type": "uint256" }
  ], "name": "PredictionMatched", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }
  ], "name": "PredictionRefunded", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
    { "indexed": true, "internalType": "address", "name": "loser", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "winningsFee", "type": "uint256" }
  ], "name": "PredictionResolved", "type": "event" },

  { "inputs": [], "name": "BPS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "BUYBACK", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "FEE_BPS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "MATCH_WINDOW", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },

  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "cancelPrediction", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [
      { "internalType": "bytes32", "name": "marketId", "type": "bytes32" },
      { "internalType": "uint8", "name": "creatorSide", "type": "uint8" },
      { "internalType": "uint256", "name": "targetPrice", "type": "uint256" },
      { "internalType": "uint64", "name": "expiry", "type": "uint64" }
    ],
    "name": "createPrediction",
    "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "getPot", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "matchPrediction", "outputs": [], "stateMutability": "payable", "type": "function" },

  { "inputs": [], "name": "nextId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },

  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "predictions",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "opponent", "type": "address" },
      { "internalType": "uint256", "name": "creatorEscrow", "type": "uint256" },
      { "internalType": "uint256", "name": "opponentEscrow", "type": "uint256" },
      { "internalType": "uint64", "name": "createdAt", "type": "uint64" },
      { "internalType": "uint64", "name": "matchDeadline", "type": "uint64" },
      { "internalType": "uint64", "name": "expiry", "type": "uint64" },
      { "internalType": "uint8", "name": "creatorSide", "type": "uint8" },
      { "internalType": "uint256", "name": "targetPrice", "type": "uint256" },
      { "internalType": "bytes32", "name": "marketId", "type": "bytes32" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "address", "name": "winner", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "refundIfUnmatched", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "creatorWins", "type": "bool" }
    ],
    "name": "resolve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;
