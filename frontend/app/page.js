'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';
import { useAccount, useContractWrite, useContractRead, useContractInfiniteReads } from 'wagmi';
import { readContract} from '@wagmi/core'
import { useEffect, useState } from 'react';

export default function Home() {
  const { isConnected } = useAccount();

  const [voterAddress, setVoterAddress] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalId, setProposalId] = useState(0);
  const [winner, setWinner] = useState('');
  const [message, setMessage] = useState("");
  const [proposals, setProposals] = useState([]);
  

  // Register a voter
  const { write: registerVoter } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'registerVoter',
    args: [voterAddress],
  });

  // Start proposal registration
  const { write: startProposalsRegistration } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'startProposalsRegistration',
  });

  async function fetchProposals() {
    try {
      setProposals(readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'getProposals'
      }));
      let list = "";
      console.log(proposals);
      for(let i=0; i<proposals.length;i++){
        list = list +"<li>ID:"+proposal.proposalId+" "+proposal.description+" Votes :npx h"+ proposal.voteCount +"</li>"
      }
      document.getElementById('proposals-list').innerHTML = list;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des propositions :', error);
    }
  }

  

  // End proposal registration
  const { write: endProposalsRegistration } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'endProposalsRegistration',
  });



  // Submit a proposal
  const { write: submitProposal } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'submitProposal',
    args: [proposalDescription],
  });

  // Start voting session
  const { write: startVotingSession } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'startVotingSession',
  });

  // Vote on a proposal
  const { write: voteForProposal } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'vote',
    args: [proposalId],
  });

  // End voting session
  const { write: endVotingSession } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'endVotingSession',
  });

  // Tally votes
  const { write: tallyVotes } = useContractWrite({ // Pas utilisée car déjà appelée dans le backend par la fonction endVotingSession
    address: contractAddress,
    abi: abi,
    functionName: 'tallyVotes',
  });

  // Get winner
  const readWinner = async () => {
    const data = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getWinner',
    });
    setMessage("The winning proposal is : "+data);
  };


  return (
    <>
      <ConnectButton />
      {isConnected ? (
        <div>
          <input
            placeholder="Voter Address"
            onChange={(e) => setVoterAddress(e.target.value)}
            value={voterAddress}
          />
          <button onClick={async () => {
            try {
              await registerVoter();
            } catch (error) {
              console.error('Error registering voter:', error);
            }
          }}>Register Voter</button><br></br><br></br>

          <button onClick={async () => {
            try {
              await startProposalsRegistration();
            } catch (error) {
              console.error('Error starting proposals registration:', error);
            }
          }}>Start Proposals Registration</button><br></br><br></br>
          
          <input
            placeholder="Proposal Description"
            onChange={(e) => setProposalDescription(e.target.value)}
            value={proposalDescription}
          />
          <button onClick={async () => {
            try {
              await submitProposal();
            } catch (error) {
              console.error('Error submitting proposal:', error);
            }
          }}>Submit Proposal</button><br></br><br></br>

          <button onClick={async () => {
            try {
              await endProposalsRegistration();
            } catch (error) {
              console.error('Error ending proposals registration:', error);
            }
          }}>End Proposals Registration</button><br></br><br></br>

          <button onClick={async () => {
            try {
              await startVotingSession();
            } catch (error) {
              console.error('Error starting voting session:', error);
            }
          }}>Start Voting Session</button><br></br><br></br>

          <h2>Proposals</h2>
          <ul id="proposals-list">
            <li>Proposals will be shown here</li>
          </ul>
          <button onClick={async () =>{fetchProposals()}}>Refresh Proposals List</button><br/><br/>

          <input
            type="number"
            placeholder="Proposal ID"
            onChange={(e) => setProposalId(Number(e.target.value))}
            value={proposalId}
          />
          <button onClick={async () => {
            try {
              await voteForProposal();
            } catch (error) {
              console.error('Error voting for proposal:', error);
            }
          }}>Vote for Proposal</button><br></br><br></br>

          <button onClick={async () => {
            try {
              await endVotingSession();
            } catch (error) {
              console.error('Error ending voting session:', error);
            }
          }}>End Voting Session</button><br></br><br></br>

          <button onClick={readWinner}>Get Winning Proposal</button>

          <h2>Winning proposal : </h2>
          {message && <p>{message}</p>}

        </div>
      ) : (
        <p>Please connect your Wallet to interact with the DApp.</p>
      )}
    </>
  );
}
