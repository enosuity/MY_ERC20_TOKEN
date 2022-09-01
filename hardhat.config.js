require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  etherscan: {
    apiKey: "F7Z4CXGNAQ761KQWJZMCYV16RGCUS7DZSR",
  },    
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/-Pk2xZ29LN_CE-4XgzbpPjXSAOSed4g5",
      accounts: ["87561cfc03d1f37f68be4f5999c2c39331df3ab4d695be33c959ef97f1ea0aa7"]
    }    
  }
};
