const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleVoting", function () {
  let votingContract;
  let owner, voter1, voter2;

  /*
  async function deployVotingFixture() {
      const [owner, voter1, voter2] = await ethers.getSigners();

      const votingContract = await ethers.deployContract("SimpleVoting");
  }

  it("Should create a platform that voters can properly vote through their right", async function () {
      const [owner, voter1, voter2] = await ethers.getSigners();

      const SimpleVoting = await ethers.deployContract("SimpleVoting");
  });
  */

  beforeEach(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting"); // Deploy a fresh copy of the contract (like loading a new game level)

    votingContract = await SimpleVoting.deploy(0, 3600);

    await votingContract.waitForDeployment();

  });

  it("Should start with 0 votes", async () => {
    // Check the "yes" votes (like counting apples in a basket)
    const yesVotes = await votingContract.getYesCount();
    expect(yesVotes).to.equal(0); // Should be 0 at start

    // Check the "no" votes
    const noVotes = await votingContract.getNoCount();
    expect(noVotes).to.equal(0);
  });

  it("Should allow a user to vote", async () => {
    // Simulate voter1 voting "yes" (like pressing a button
    await votingContract.connect(voter1).vote(true);

    // Check if voter1's vote was recorded
    const hasVoted = await votingContract.checkHasVoted(voter1.address);
    expect(hasVoted).to.be.true; // Should be true

    // Check if "yes" votes increased to 1
    const yesVotes = await votingContract.getYesCount();
    expect(yesVotes).to.equal(1);
  });
});

describe("Testing getWinner()", () => {
  let votingContract;
  let owner, voter1, voter2;

  beforeEach(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting"); // Deploy a fresh copy of the contract (like loading a new game level)

    votingContract = await SimpleVoting.deploy(0, 3600);

    await votingContract.waitForDeployment();
  });

  it("Should say 'Yes votes have won' when yes > no", async () => {
    // 1. Simulate voting
    await votingContract.connect(voter1).vote(true); // Voter1 votes "yes"
    await votingContract.connect(voter2).vote(true); // Voter2 votes "yes"

    // 2. End the voting period (so getWinner() works)
    await votingContract.connect(owner).endVoteManually();

    // 3. Check the winner
    const result = await votingContract.getWinner();
    expect(result).to.equal("Yes votes have won."); // Should return this string
  });

  it("Should say 'Votes are equal' when yes == no", async () => {
    // 1. Create a tie (1 yes, 1 no)
    await votingContract.connect(voter1).vote(true);
    await votingContract.connect(voter2).vote(false);

    // 2. End voting
    await votingContract.connect(owner).endVoteManually();

    // 3. Check result
    expect(await votingContract.getWinner()).to.equal("Votes are equal.");
  });
});

describe("Testing resetVote()", () => {
  let votingContract;
  let owner, voter1;

  beforeEach(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting"); // Deploy a fresh copy of the contract (like loading a new game level)

    votingContract = await SimpleVoting.deploy(0, 3600);

    await votingContract.waitForDeployment();
  });

  it("Should reset votes and allow new voting", async () => {
    // 1. Vote and end the period
    await votingContract.connect(voter1).vote(true);
    await votingContract.connect(owner).endVoteManually();

    // 2. Reset votes (this mines a new block)
    const tx = await votingContract.connect(owner).resetVote(0, 3600);
    await tx.wait(); // Wait for the transaction to be mined

    // 3. Get the timestamp of the NEW block
    const latestBlock = await ethers.provider.getBlock("latest");
    const newBlockTime = latestBlock.timestamp;

    // 4. Check voting period
    const newStartTime = await votingContract.startTime();
    const newEndTime = await votingContract.endTime();

    expect(newStartTime).to.equal(newBlockTime);
    expect(newEndTime).to.equal(newBlockTime + 3600);
  });
});

describe("getMyVote()", function () {
  let votingContract;
  let owner, voter1, voter2;

  beforeEach(async () => {
    // Deploy a fresh contract and get test accounts
    [owner, voter1, voter2] = await ethers.getSigners();
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    votingContract = await SimpleVoting.deploy(0, 3600); // Start immediately
    await votingContract.waitForDeployment();
  });

  // Test 1: Revert if user hasn’t voted
  it("Should revert if user hasn’t voted", async () => {
    // Attempt to get vote before voting
    await expect(
      votingContract.connect(voter1).getMyVote()
    ).to.be.revertedWith("You have not voted yet.");
  });

  // Test 2: Return true after voting "yes"
  it("Should return true after voting 'yes'", async () => {
    await votingContract.connect(voter1).vote(true);
    expect(await votingContract.connect(voter1).getMyVote()).to.be.true;
  });

  // Test 3: Return false after voting "no"
  it("Should return false after voting 'no'", async () => {
    await votingContract.connect(voter2).vote(false);
    expect(await votingContract.connect(voter2).getMyVote()).to.be.false;
  });

  // Test 4: Revert after votes are reset
  it("Should revert after votes are reset", async () => {
    // Vote and then reset
    await votingContract.connect(voter1).vote(true);
    await votingContract.connect(owner).endVoteManually();
    await votingContract.connect(owner).resetVote(0, 3600);

    // Attempt to get vote after reset
    await expect(
      votingContract.connect(voter1).getMyVote()
    ).to.be.revertedWith("You have not voted yet.");
  });
});

describe("getVoteCount()", function () {
  let votingContract;
  let owner, voter1, voter2;

  beforeEach(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting"); // Deploy a fresh copy of the contract (like loading a new game level)

    votingContract = await SimpleVoting.deploy(0, 3600);

    await votingContract.waitForDeployment();
  });

  it("Should revert number of total votes", async () => {
    await votingContract.connect(voter1).vote(true);
    await votingContract.connect(voter2).vote(false);
    await votingContract.connect(owner).endVoteManually();
    expect(await
      votingContract.connect(voter1).getVoteCount()
    ).to.equal(2);

  });
});

describe("getParticipationRate()", function () {
  let votingContract;
  let owner, voter1, voter2;

  beforeEach(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting"); // Deploy a fresh copy of the contract (like loading a new game level)

    votingContract = await SimpleVoting.deploy(0, 3600);

    await votingContract.waitForDeployment();
  });

  it("Should revert participation rate", async () => {
    await votingContract.connect(voter1).vote(true);
    await votingContract.connect(voter2).vote(false);
    await votingContract.connect(owner).endVoteManually();
    const [yesRate, noRate] = await votingContract.getParticipationRate();
    expect(yesRate).to.equal(50);
    expect(noRate).to.equal(50);
  });
});