// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/**
 * @title Système de vote
 * @dev Ce contrat gère tout le processus d'un vote. De l'enregistrement des votants, au vote de la proposition gagnante, en passant par la soumission des propositions.
 */

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        uint proposalId;
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    WorkflowStatus public currentStatus;
    string public proposalListHtml;
    uint public winningProposalId;
    

    event VoterRegistered(address voterAddress);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    
    constructor() Ownable(msg.sender) {
        currentStatus = WorkflowStatus.RegisteringVoters;
    }

    modifier atStage(WorkflowStatus _stage) {
        require(currentStatus == _stage, "Function cannot be called at this stage.");
        _;
    }

    function registerVoter(address _voter) public /*onlyOwner*/ atStage(WorkflowStatus.RegisteringVoters) { // Nous obtenons cette erreur en utilisant le modifier onlyOwner de Ownable : Error: VM Exception while processing transaction: reverted with an unrecognized custom error (return data: 0x118cdaa700000000000000000000000090f79bf6eb2c4f870365e785982e1f101e93b906)
        require(!voters[_voter].isRegistered, "Voter is already registered.");
        voters[_voter] = Voter({isRegistered: true, hasVoted: false, votedProposalId: 0});
        emit VoterRegistered(_voter);
    }

    function startProposalsRegistration() public /*onlyOwner*/ atStage(WorkflowStatus.RegisteringVoters) {
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistration() public /*onlyOwner*/ atStage(WorkflowStatus.ProposalsRegistrationStarted) {
        currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function submitProposal(string memory _description) public atStage(WorkflowStatus.ProposalsRegistrationStarted) {
        require(voters[msg.sender].isRegistered, "Only registered voters can submit proposals.");
        require(bytes(_description).length > 0, "Proposal description cannot be empty.");

        for (uint i = 0; i < proposals.length; i++) {
            require(keccak256(bytes(proposals[i].description)) != keccak256(bytes(_description)), "This proposal has already been submitted.");
        }

        proposals.push(Proposal({proposalId: proposals.length, description: _description, voteCount: 0}));
        emit ProposalRegistered(proposals.length - 1);
    }

    function startVotingSession() public /*onlyOwner*/ atStage(WorkflowStatus.ProposalsRegistrationEnded) {
        currentStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function vote(uint _proposalId) public atStage(WorkflowStatus.VotingSessionStarted) {
        Voter storage sender = voters[msg.sender];
        require(sender.isRegistered, "Voter is not registered.");
        require(!sender.hasVoted, "Voter has already voted.");
        require(_proposalId < proposals.length, "Invalid proposal ID.");

        sender.hasVoted = true;
        sender.votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    function endVotingSession() public /*onlyOwner*/ atStage(WorkflowStatus.VotingSessionStarted) {
        currentStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
        tallyVotes();
    }

    function tallyVotes() public /*onlyOwner*/ returns (string memory) {
        require(currentStatus == WorkflowStatus.VotesTallied || currentStatus == WorkflowStatus.VotingSessionEnded);
        uint winningVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        currentStatus = WorkflowStatus.VotesTallied;
    }

    function getDetailedState() public view returns (string memory) {
        if(currentStatus == WorkflowStatus.RegisteringVoters) {
            return "Registering Voters";
        } else if(currentStatus == WorkflowStatus.ProposalsRegistrationStarted) {
            return "Proposals Registration Started";
        } else if(currentStatus == WorkflowStatus.ProposalsRegistrationEnded) {
            return "Proposals Registration Ended";
        } else if(currentStatus == WorkflowStatus.VotingSessionStarted) {
            return "Voting Session Started";
        } else if(currentStatus == WorkflowStatus.VotingSessionEnded) {
            return "Voting Session Ended";
        } else if(currentStatus == WorkflowStatus.VotesTallied) {
            return "Votes Tallied";
        } else {
            return "Unknown State";
        }
    }

    function getWinner() public view atStage(WorkflowStatus.VotesTallied) returns (string memory) {
        require(proposals.length > 0, "No proposals registered.");
        return proposals[winningProposalId].description;
    }

    function getProposals() public view returns (Proposal[] memory){
        return proposals;
    }
}
