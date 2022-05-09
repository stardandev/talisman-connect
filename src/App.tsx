import {useEffect, useState} from 'react';
import './App.css';
import { WalletSelectButton } from '@talisman-connect/components';
import { TalismanWallet, WalletAccount } from '@talisman-connect/wallets';
import { ApiPromise, WsProvider  } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
  web3ListRpcProviders,
  web3UseRpcProvider
} from '@polkadot/extension-dapp';

const talismanWallet = new TalismanWallet();
function App() {

  const [wallet, setWallet] = useState<WalletAccount>();
  const [address, setAddress] = useState<string>("");
  const[balance, setBalance] = useState<string>("");
  const [API, setAPI] = useState<ApiPromise>();

  useEffect(() => {
    async function init() {
      const provider = new WsProvider('wss://kusama-rpc.polkadot.io');

      const api = await ApiPromise.create({ provider });

      setAPI(api);
    }
    init();
  }, [])
  useEffect(() => {
    if (!wallet || !API) return;
    async function getBalace() {
      let response = await API?.query?.system.account(wallet?.address);
      const sender = wallet?.address;
    }

    getBalace();

  }, [wallet, API])
  const signMessage =async () => {
    const signRaw = await talismanWallet._signer?.signRaw;
    
    if (signRaw && wallet?.address) {
      const { signature } = await signRaw({
        type: 'payload',
        data: 'Some data to sign...',
        address: wallet.address,
      });
    }
  }

  const connectWallet = async() => {
    const allInjected = await web3Enable('my cool dapp');

    const allAccounts = await web3Accounts();

    const SENDER = allAccounts[0].address;
    setAddress(SENDER);

  }

  const sendMoney = async() => {
    if (!address && !wallet?.address) return;
    
    let injector;
    let account;
    if (address) {
      injector = await web3FromAddress(address);
      account = address;
    } else if (wallet?.address) {
      const allInjected = await web3Enable('my cool dapp');
      account  = wallet.address;
      injector = await web3FromAddress(wallet.address);
    }
    if (!injector || !account) return;

    API?.tx.balances
      .transfer('5C5555yEXUcmEJ5kkcCMvdZjUo7NGJiQJMS7vZXEeoMhj3VQ', 1)
      .signAndSend(account, { signer: injector.signer }, (status) => { console.log({status}) });
  }
  return (
    <div className="App">
      <header className="App-header">
        <div className='wallet-container'>
          {
            wallet ? (
              <div>
                {`${wallet.address.slice(0,4)}...${wallet.address.slice(-3)}`}<br></br>
                <span>{balance}</span>
              </div>
            )
              :
              <WalletSelectButton
                dappName="My First Dapp"
                wallet={talismanWallet}
                onClick={(accounts) => {
                  if (accounts){
                    setWallet(accounts[0]);}
                }}
              >
              <img
                width={32}
                height={32}
                src={talismanWallet.logo.src}
                alt={talismanWallet.logo.alt}
              />
              Talisman Connect
            </WalletSelectButton>
          }
        </div>
        <div className='wallet-container'>
        {
            address ?
              <div>
                {`${address.slice(0,4)}...${address.slice(-3)}`}<br></br>
                <span>{balance}</span>
              </div>
              : <button onClick={() => connectWallet()}>Connect</button>
          }
        </div>
      <div>
        <button className='btn' onClick={() => signMessage()}>Sign message</button>
      </div>
      <div>
        <button className='btn' onClick={() => sendMoney()}>Send Money</button>
      </div>
      </header>
    </div>
  );
}

export default App;
