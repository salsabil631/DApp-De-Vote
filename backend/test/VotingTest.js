const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    voting = await Voting.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should start at the RegisteringVoters stage", async function () {
      expect(await voting.currentStatus()).to.equal(0); // 0 corresponds to RegisteringVoters
    });
  });

  describe("Voter Registration", function () {
    it("Should allow the owner to register a voter", async function () {
      await voting.registerVoter(addr1.address);
      const voter = await voting.voters(addr1.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("Should not allow non-owners to register a voter", async function () {
      await expect(
        voting.connect(addr1).registerVoter(addr2.address)
      ).to.be.reverted; //Ownable error handling
    });

    it("Should not allow registering a voter twice", async function () {
      await voting.registerVoter(addr1.address);
      await expect(voting.registerVoter(addr1.address)).to.be.revertedWith(
        "Voter is already registered."
      );
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
    });

    it("Should allow a registered voter to submit a proposal", async function () {
      await voting.connect(addr1).submitProposal("Proposal 1");
      const proposal = await voting.proposals(0);
      expect(proposal.description).to.equal("Proposal 1");
    });

    it("Should not allow non-registered voters to submit a proposal", async function () {
      await expect(
        voting.connect(addr2).submitProposal("Proposal 2")
      ).to.be.revertedWith("Only registered voters can submit proposals.");
    });

    it("Should not allow submitting the same proposal twice", async function () {
      await voting.connect(addr1).submitProposal("Proposal 1");
      await expect(
        voting.connect(addr1).submitProposal("Proposal 1")
      ).to.be.revertedWith("This proposal has already been submitted.");
    });

    it("Should move through the workflow correctly", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.endVotingSession(); // endVotingSession appelle également tallyVotes
      expect(await voting.currentStatus()).to.equal(5); // 5 corresponds to VotesTallied
    });

    it("Should not allow voting on an invalid proposal ID", async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await expect(
        voting.connect(addr1).vote(1)
      ).to.be.revertedWith("Invalid proposal ID.");
    });
  });

  describe("Vote Tallying", function () {
    beforeEach(async function () {
      await voting.registerVoter(addr1.address);
      await voting.startProposalsRegistration();
      await voting.connect(addr1).submitProposal("Proposal 1");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      await voting.connect(addr1).vote(0);
      await voting.endVotingSession();
    });

    it("Should tally votes correctly", async function () {
      await voting.tallyVotes();
      const winner = await voting.getWinner();
      expect(winner).to.equal("Proposal 1");
    });

    it("Should handle tie correctly", async function () {
      await voting.connect(addr2).registerVoter(addr2.address);
      await voting.connect(addr2).submitProposal("Proposal 2");
      await voting.connect(addr2).vote(1);
      await voting.tallyVotes();
      const winner = await voting.getWinner();
      expect(winner).to.equal("Proposal 1");
    });

    it("Should not allow non-owners to tally votes", async function () {
      await expect(
        voting.connect(addr1).tallyVotes()
      ).to.be.reverted; //Ownable error handling
    });
  });
});
