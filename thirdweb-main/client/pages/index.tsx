import {
  useAddress,
  useUser,
  useLogin,
  useLogout,
  useMetamask,
} from '@thirdweb-dev/react';
import axios from 'axios';
import type { NextPage } from 'next';
import { useState } from 'react';

const Home: NextPage = () => {
  const address = useAddress();
  const connect = useMetamask();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { user, isLoggedIn } = useUser();
  const [secret, setSecret] = useState();

  const getSecret = async () => {
    const res = await fetch('/api/secret', { credentials: 'include' });
    const data = await res.json();
    setSecret(data.message);
  };

  async function getData() {
    const res = await axios.get('http://localhost:8000/auth/login', {
      // Include all cookies in this request

      withCredentials: true,
    });
    console.log(res);

    return res.data;
  }

  async function handleLogin() {
    await login();
    try {
      // const res = await axios.post(
      //   'http://localhost:8000/auth/login',
      //   {
      //     payload: {
      //       payload: {
      //         type: 'evm',
      //         domain: 'localhost:3000',
      //         address: '0xD63Ef08a38EfF4416d7EBf9895B69A525AE593F7',
      //         statement:
      //           'Please ensure that the domain above matches the URL of the current website.',
      //         uri: 'http://localhost:3000',
      //         version: '1',
      //         chain_id: '1',
      //         nonce: 'ab36a56f-25e8-4b0a-b591-bc5c8f7ccbfd',
      //         issued_at: '2023-03-02T07:15:18.451Z',
      //         expiration_time: '2023-03-02T07:20:20.240Z',
      //         invalid_before: '2023-03-02T07:15:18.451Z',
      //       },
      //       signature:
      //         '0xd6ab804b7eb969c17221d86a279a1e4dcbcfee9f99ddc15eb8ab4515fb9b61437ca97b2f80d6f95bd628347e3fd81d81422e2584cf53226fddcf6b53eff21b381c',
      //     },
      //   },
      //   { withCredentials: true }
      // );
      // console.log(res);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {isLoggedIn ? (
        <button onClick={() => logout()}>Logout</button>
      ) : address ? (
        <>
          <button onClick={handleLogin}>Login</button>
          <button onClick={getData}>Login</button>
        </>
      ) : (
        <button onClick={() => connect()}>Connect</button>
      )}
      <button onClick={getSecret}>Get Secret</button>

      <pre>Connected Wallet: {address}</pre>
      <pre>User: {JSON.stringify(user, undefined, 2) || 'N/A'}</pre>
      <pre>Secret: {secret || 'N/A'}</pre>
    </div>
  );
};

export default Home;
