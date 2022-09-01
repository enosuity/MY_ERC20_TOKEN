// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  const networkUrl = hre.network.config.url;
  console.log('Deploying to network', networkName, networkUrl);

  if(networkName == "hardhat") {
    const [ deployer ] = await ethers.getSigners(); 
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account Balance => ", (await deployer.getBalance()).toString());
  }

  const Token = await ethers.getContractFactory("Goldy");
  const token_contract = await Token.deploy("Goldy Bhai", "GLD");
  console.log("token_contract ====>", token_contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});