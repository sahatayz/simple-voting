// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleVoting is Ownable {
    event VoteReset(uint256 yesVotes, uint256 noVotes);
    uint256 yesVotes;
    uint256 noVotes;
    uint256 startTime;
    uint256 endTime;
    mapping(address => bool) hasVoted;
    mapping(address => bool) userVote;
    address[] private voterAddresses;

    modifier onlyAfterVoting() {
    require(block.timestamp > endTime, "Voting is ongoing.");
    _;
    }

    modifier onlyVotingPeriod() {
        require(block.timestamp >= startTime, "Voting not started.");
        require(block.timestamp < endTime, "Voting ended.");
        _;
    }

    constructor(uint256 _startAfter, uint256 _durationInSeconds) Ownable(msg.sender) {
        require(_durationInSeconds > 0, "Duration must be positive");
        startTime = block.timestamp + _startAfter;
        endTime = startTime + _durationInSeconds;
    }

    function vote(bool _myVote) external onlyVotingPeriod {
        require(!hasVoted[msg.sender], "Already voted.");

        voterAddresses.push(msg.sender);

        if (_myVote) yesVotes++;
        else noVotes++;
        userVote[msg.sender] = _myVote;
        hasVoted[msg.sender] = true;
    }

    function getVoteCount() external view returns (uint256) {
        return yesVotes + noVotes;
    }

    function checkHasVoted(address _user) external view returns (bool) {
        return hasVoted[_user];
    }

    function getMyVote() external view returns (bool _userVote) {
        //getMyVote(address _user)
        require(hasVoted[msg.sender], "You have not voted yet.");
        //require(hasVoted[_user], "You have not voted yet.");
        return userVote[msg.sender];
        //return userVote[_user];
    }

    function getWinner() external view onlyAfterVoting returns (string memory) {
        if (yesVotes > noVotes) {
            return "Yes votes have won";
        } else if (noVotes > yesVotes) {
            return "No votes have won.";
        } else {
            return "Votes are equal.";
        }
    }

    function getYesCount() external view returns (uint256) {
        return yesVotes;
    }

    function getNoCount() external view returns (uint256) {
        return noVotes;
    }

    function getParticipationRate() external view onlyAfterVoting returns (uint256 _yesRate, uint256 _noRate)  {
        uint256 totalVotes = yesVotes + noVotes;
        _yesRate = (yesVotes * 100) / totalVotes;
        _noRate = (noVotes * 100) / totalVotes;

        if (voterAddresses.length > 0)
            return (_yesRate, _noRate);
    }

    function endVoteManually() external onlyOwner {
        endTime = block.timestamp;
    }

    function resetVote(uint256 _startTime, uint256 _durationInSeconds) external onlyOwner onlyAfterVoting {
        require(_durationInSeconds > 0, "Duration must be positive");
        emit VoteReset(yesVotes, noVotes);

        yesVotes = 0;
        noVotes = 0;

        for (uint i = 0; i < voterAddresses.length; i++) {
        address voter = voterAddresses[i];
        delete hasVoted[voter];
        delete userVote[voter];
        }
        delete voterAddresses;

        startTime = block.timestamp+_startTime;
        endTime = startTime + _durationInSeconds;

    }
}
