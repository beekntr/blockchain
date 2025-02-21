import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EduGrantABI from '../contracts/EduGrant.json';

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    EduGrantABI.abi,
                    signer
                );
                
                setAccount(accounts[0]);
                setContract(contract);
                setLoading(false);
            } else {
                throw new Error("Please install MetaMask!");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        connectWallet();
    }, []);

    return { account, contract, loading, error, connectWallet };
}; 