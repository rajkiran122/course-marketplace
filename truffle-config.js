const HDWalletProvider = require("@truffle/hdwallet-provider");
const keys = require('./keys.json')

module.exports = {
  contracts_build_directory: './public/contracts',
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: keys.MNEMONIC,
          },
          providerOrUrl: `wss://ropsten.infura.io/ws/v3/${keys.INFURA_PROJECT_ID}`,
          addressIndex: 0,
        }),
      network_id: 3,
      gas: 8000000, // Gas Limit,
      gasPrice: 30000000000,//in wei...
      confirmations: 2, // number of blocks to wait between deployment
      timeoutBlocks: 200, //number of  blocks before deployment times out
    }

  },
  compilers: {
    solc: {
      version: "0.8.11",
    }
  },
};


// BASE FEE(Determined by Ethereum) => 12.08798374 Gwei
// Max Priority(TIP): 2 Gwei
// GAS PRICE = BASE FEE + TIP = 14.08798374 Gwei
// GAS USED: 2,560,040 
// Transaction FEE = GAS PRICE * GAS USED

// Burnt Fee => BASE FEE * GAS USED

// Rest to the miner => TIP * GAS USED

