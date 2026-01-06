type EthereumRequest = {
  method: string;
  params?: unknown;
};

type EthereumMockOptions = {
  rpcUrl: string;
  chainIdHex: string;
  accounts: string[];
};

export function ethereumMockInitScript(options: EthereumMockOptions): string {
  const { rpcUrl, chainIdHex, accounts } = options;

  // Intentionally serialize config into the script so Playwright can inject it
  // via addInitScript({ content }).
  return `(() => {
    window.__E2E__ = true;
    const RPC_URL = ${JSON.stringify(rpcUrl)};
    const CHAIN_ID = ${JSON.stringify(chainIdHex)};
    const ACCOUNTS = ${JSON.stringify(accounts)};

    let isConnected = false;
    let selectedAddress = ACCOUNTS[0] || null;

    const listeners = new Map();
    function emit(event, ...args) {
      const set = listeners.get(event);
      if (!set) return;
      for (const fn of set) {
        try { fn(...args); } catch (_) {}
      }
    }

    let rpcId = 0;
    async function rpc(method, params) {
      const body = {
        jsonrpc: '2.0',
        id: ++rpcId,
        method,
        params: params ?? [],
      };

      const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json && json.error) {
        const err = new Error(json.error.message || 'RPC error');
        // @ts-ignore
        err.code = json.error.code;
        throw err;
      }
      return json.result;
    }

    async function handleRequest({ method, params }) {
      switch (method) {
        case 'eth_requestAccounts': {
          isConnected = true;
          emit('connect', { chainId: CHAIN_ID });
          emit('accountsChanged', ACCOUNTS);
          return ACCOUNTS;
        }
        case 'eth_accounts': {
          return isConnected ? ACCOUNTS : [];
        }
        case 'eth_chainId': {
          return CHAIN_ID;
        }
        case 'wallet_switchEthereumChain': {
          // For E2E we accept any switch request. If callers expect chainChanged,
          // emit it with our configured chain id.
          emit('chainChanged', CHAIN_ID);
          return null;
        }
        case 'wallet_addEthereumChain': {
          return null;
        }
        case 'wallet_requestPermissions': {
          // Minimal permissions shape used by some libs.
          isConnected = true;
          emit('accountsChanged', ACCOUNTS);
          return [{ parentCapability: 'eth_accounts' }];
        }
        case 'wallet_getPermissions': {
          return isConnected ? [{ parentCapability: 'eth_accounts' }] : [];
        }
        case 'eth_sendTransaction': {
          const tx = Array.isArray(params) ? params[0] : params;
          if (tx && typeof tx === 'object' && tx.from == null && selectedAddress) {
            tx.from = selectedAddress;
          }
          return rpc('eth_sendTransaction', Array.isArray(params) ? params : [tx]);
        }
        default: {
          // Forward everything else to Anvil.
          return rpc(method, params);
        }
      }
    }

    const ethereum = {
      isMetaMask: false,
      isConnected: () => isConnected,
      get chainId() { return CHAIN_ID; },
      get selectedAddress() { return selectedAddress; },
      request: (args) => {
        if (!args || typeof args !== 'object') {
          return Promise.reject(new Error('Invalid request'));
        }
        return handleRequest(args);
      },
      // Legacy methods used by some providers
      send: (methodOrPayload, params) => {
        if (typeof methodOrPayload === 'string') {
          return handleRequest({ method: methodOrPayload, params });
        }
        if (methodOrPayload && typeof methodOrPayload === 'object') {
          return handleRequest(methodOrPayload);
        }
        return Promise.reject(new Error('Invalid send'));
      },
      sendAsync: (payload, cb) => {
        handleRequest(payload)
          .then((result) => cb(null, { id: payload.id, jsonrpc: '2.0', result }))
          .catch((error) => cb(error, null));
      },
      on: (event, fn) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(fn);
      },
      removeListener: (event, fn) => {
        const set = listeners.get(event);
        if (!set) return;
        set.delete(fn);
      },
    };

    Object.defineProperty(window, 'ethereum', {
      value: ethereum,
      writable: false,
      configurable: true,
    });

    // Make it discoverable to some wallet detection logic.
    // @ts-ignore
    window.ethereum = ethereum;
  })();`;
}
