export const ORACLE_CONTROLLER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "market_", "type": "address" },
      { "internalType": "address", "name": "resolver_", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "finalCreatorWins", "type": "bool" },
      { "indexed": false, "internalType": "address", "name": "bondWinner", "type": "address" }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "challenger", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "bond", "type": "uint256" }
    ],
    "name": "OutcomeChallenged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "creatorWins", "type": "bool" }
    ],
    "name": "OutcomeFinalized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "creatorWins", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "bond", "type": "uint256" },
      { "indexed": false, "internalType": "uint64", "name": "challengeEnd", "type": "uint64" }
    ],
    "name": "OutcomeProposed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "bondBpsOfPot",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "challengeOutcome",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "challengeWindow",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "disputes",
    "outputs": [
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "bool", "name": "proposedCreatorWins", "type": "bool" },
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "uint256", "name": "proposerBond", "type": "uint256" },
      { "internalType": "uint64", "name": "proposedAt", "type": "uint64" },
      { "internalType": "bool", "name": "challenged", "type": "bool" },
      { "internalType": "address", "name": "challenger", "type": "address" },
      { "internalType": "uint256", "name": "challengerBond", "type": "uint256" },
      { "internalType": "bool", "name": "finalized", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "finalizeIfUnchallenged",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "market",
    "outputs": [{ "internalType": "contract IPhuckPredictionMarket", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minBondWei",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "creatorWins", "type": "bool" }
    ],
    "name": "proposeOutcome",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "requiredBond",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "finalCreatorWins", "type": "bool" }
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resolver",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_challengeWindow", "type": "uint256" },
      { "internalType": "uint256", "name": "_minBondWei", "type": "uint256" },
      { "internalType": "uint256", "name": "_bondBpsOfPot", "type": "uint256" }
    ],
    "name": "setParams",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "r", "type": "address" }],
    "name": "setResolver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "stateMutability": "payable", "type": "receive" }
] as const;
