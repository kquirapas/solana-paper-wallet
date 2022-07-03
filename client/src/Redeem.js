import { useState, useRef, useEffect } from 'react';
import * as web3 from '@solana/web3.js';
import styled from 'styled-components';

import Nav from './Nav';

import { paperStore, paperRedeem } from './paper';

// const connection = new web3.Connection('http://127.0.0.1/8899', 'finalized');
const connection = new web3.Connection(
  process.env.REACT_APP_RPC_URL,
  'finalized'
);

function Redeem() {
  const [connected, setConnected] = useState(false); 
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const errorRef = useRef(null);
  const hashRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    errorRef.current.textContent = errorMsg;
  }, [errorMsg]);

  const connectWallet = async (e) => {
    try {
      // connecting Phantom wallet with window.solana
      setLoading(true)
      const response = await window.solana.connect();
      setProvider(window.solana);
      setConnected(true);
      setErrorMsg("You're connected");
      setLoading(false)
    } catch (e) {
      setErrorMsg("Failed to connect wallet. Try again");
    }
  };

  const redeem = async (e) => {
    if (provider) {
      try {
        setLoading(true);
        setErrorMsg("Trying to redeem...");

        // send store transaction to program
        const signature = await paperRedeem(connection, provider, codeRef.current.value, new web3.PublicKey(hashRef.current.value));

        console.log(hashRef.current.value);

        const codeText = codeRef.current.value;

        setLoading(false);
        setErrorMsg('Done. Your wallet must be credited by now.');
      } catch (e) {
        setLoading(false);
        setErrorMsg(`Failed to redeem SOL: ${e.message}`);
      }
    }
  };

  const loadingUI = (<p>Loading</p>);

  const connectButton = connected && window.solana.isPhantom
    ? (<button type="button" onClick={redeem}>Redeem SOL into connected wallet</button>)
    : (<button type="button" onClick={connectWallet}>Connect</button>);

  const codeInputUI = (
    <>
      <h5>Your Code / Password (Temporary)</h5>
      <input ref={codeRef} type="password" />
      <h5>Hash</h5>
      <input ref={hashRef} type="text" />
    </>
  );

  return (
    <StyledMain>
      <h1>Solana Paper Wallet</h1>
      <h3>Redeem</h3>
      { connected ? codeInputUI : null }
      { loading ? loadingUI : connectButton }
      <p ref={errorRef}></p>
      <h5>Lil Navigation</h5>
      <Nav />
    </StyledMain>
  );
}

const StyledMain = styled.main`
  min-width: 100vw;
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Redeem;
