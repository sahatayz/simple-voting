# simple-voting

A smart contract-based voting system written in Solidity with automated testing using Hardhat and Chai. This contract allows users to cast binary votes (yes/no), view results, and reset voting sessions securely.

## 🛠 Features

- Start and end voting sessions with custom durations
- Cast binary votes (`true` for yes, `false` for no)
- Prevent double-voting per session
- View:
  - Your own vote
  - Total yes/no votes
  - Voting winner
  - Participation rate
- Reset voting sessions for reuse

## 📄 Contract Overview

**Contract Name**: `SimpleVoting`

### Constructor

```solidity
constructor(uint256 _startDelay, uint256 _duration)
```
Key Functions
```solidity
vote(bool _choice) – Cast a vote

getYesCount() – Get number of "yes" votes

getNoCount() – Get number of "no" votes

getMyVote() – Retrieve the sender’s vote

checkHasVoted(address) – Check if an address has voted

getVoteCount() – Get total number of votes

getParticipationRate() – Get % participation for yes/no

getWinner() – Determine and return voting result

endVoteManually() – End voting period manually

resetVote(uint256 _startDelay, uint256 _duration) – Restart voting
```

## 🧪 Testing
Tests are written with Hardhat and Chai, covering:

- Proper voting behavior

- Edge cases (e.g., vote before start, double voting)

- Accurate result logic

- Resetting and restarting vote sessions

- Participation tracking

Run tests with:
npx hardhat test

## 🧑‍💻 Development
Install dependencies:
```bash
npm install
```

Compile contracts:
```bash
npx hardhat compile
```

Run local Hardhat network:
```bash
npx hardhat node
```

Deploy contract (add script as needed):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 📁 Project Structure
- SimpleVoting.sol – Main contract

- SimpleVoting_test.js – Test suite

- scripts/deploy.js – Deployment script (optional)

## 🔐 License
MIT License
