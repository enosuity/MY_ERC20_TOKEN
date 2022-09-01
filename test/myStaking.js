const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", function(){

  async function deployedContract() {
    const [ owner, addr1, addr2 ] = await ethers.getSigners();
    // Goldy Token Deployment
    const Goldy = await ethers.getContractFactory("Goldy");
    const goldy = await Goldy.deploy("Goldy Bhai", "GLD");
    await goldy.deployed();
    
    // Minting some tokens onto addr1 & addr2.
    await goldy.mint(addr1.address, 30000);
    await goldy.mint(addr2.address, 26000);

    //  Staking Contract Deployment
    const Staking= await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(goldy.address, goldy.address);
    await staking.deployed();

    // Give smart contract approval for some funds
    await goldy.connect(addr1).approve(staking.address, 15000);
    await goldy.connect(addr2).approve(staking.address, 13000);

    // mint some token for rewards distrubution.
    await goldy.mint(staking.address, 20000);

    return { goldy, staking, owner, addr1, addr2 }
  }
  
  describe("Deployment", function () {
    it("Owner", async function () {
        const { goldy, staking, owner } = await loadFixture(deployedContract);
        console.log("QWERTY : ", await goldy.symbol());
        expect(await staking.owner()).to.equal(owner.address);
        expect(await goldy.symbol()).to.equal("GLD");
    });

    it("Token supply", async function () {
        const { goldy, staking, addr1, addr2 } = await loadFixture(deployedContract);
        expect(await goldy.totalSupply()).to.equal(76000);
        expect(await goldy.balanceOf(addr1.address)).to.equal(30000);
        expect(await goldy.balanceOf(addr2.address)).to.equal(26000);
        expect(await goldy.balanceOf(staking.address)).to.equal(20000);
    });

    it("Allowance", async function () {
        const { goldy, staking, addr1, addr2 } = await loadFixture(deployedContract);
        expect(await goldy.allowance(addr1.address, staking.address)).to.equal(15000);
        expect(await goldy.allowance(addr2.address, staking.address)).to.equal(13000);
    });
  });

  describe("Staking", function () {
    it("duration required", async function () {
        const { staking, addr1 } = await loadFixture(deployedContract);
        
        await expect(
            staking.connect(addr1).stake(1000)
        ).to.be.revertedWith("invalid duration"); 
        
    });

    it("reward rate missing", async function () {
        const { staking, addr1} = await loadFixture(deployedContract);
        
        await staking.setRewardDuration(60);
        await expect(
            staking.connect(addr1).stake(1000)
        ).to.be.revertedWith("APY rate = 0");         
    });


    it("Stake Amount", async function () {
        const { staking, addr1} = await loadFixture(deployedContract);
        
        await staking.setRewardDuration(60);
        await staking.setRewardRate(10);
        await staking.connect(addr1).stake(1000);

        expect(await staking.balances(addr1.address)).to.equal(1000);
    });

    it("earning", async function () {
        const { staking, addr1} = await loadFixture(deployedContract);
        
        await staking.setRewardDuration(60);
        await staking.setRewardRate(10);
        await staking.connect(addr1).stake(1000);

        expect(await staking.balances(addr1.address)).to.equal(1000);
        
        // Increase Blockchain time stamp
        await network.provider.send("evm_increaseTime", [360]);
        await network.provider.send("evm_mine");

        expect(await staking.earning(addr1.address)).to.equal(600);
    });

    it("claim", async function () {
        const { staking, addr1, goldy} = await loadFixture(deployedContract);
        
        await staking.setRewardDuration(60);
        await staking.setRewardRate(10);
        await staking.connect(addr1).stake(1000);

        expect(await staking.balances(addr1.address)).to.equal(1000);
        
        // Increase Blockchain time stamp
        await network.provider.send("evm_increaseTime", [360]);
        await network.provider.send("evm_mine");

        expect(await staking.rewards(addr1.address)).to.equal(0);
        expect(await staking.rewardsPaid(addr1.address)).to.equal(0);

        expect(await staking.earning(addr1.address)).to.equal(600);
        await staking.connect(addr1).claim();
        expect(Number(await goldy.balanceOf(addr1.address))).to.equal(29600);
        // After First claim.
        expect(await staking.balances(addr1.address)).to.equal(1000);
        expect(await staking.rewards(addr1.address)).to.equal(600);
        expect(await staking.rewardsPaid(addr1.address)).to.equal(600);

        // Increase Blockchain time stamp
        await network.provider.send("evm_increaseTime", [60]);
        await network.provider.send("evm_mine");

        expect(await staking.earning(addr1.address)).to.equal(100);
        await staking.connect(addr1).claim();
        expect(await staking.rewards(addr1.address)).to.equal(100);
        expect(await staking.rewardsPaid(addr1.address)).to.equal(700);

    });

    it("withdraw", async function () {
        const { staking, addr1, goldy} = await loadFixture(deployedContract);
        
        await staking.setRewardDuration(60);
        await staking.setRewardRate(10);
        await staking.connect(addr1).stake(1000);

        expect(await staking.balances(addr1.address)).to.equal(1000);
        
        // Increase Blockchain time stamp
        await network.provider.send("evm_increaseTime", [60]);
        await network.provider.send("evm_mine");

        expect(await staking.earning(addr1.address)).to.equal(100);
        await staking.connect(addr1).withdraw(250);
        expect(await staking.balances(addr1.address)).to.equal(750);
        expect(await goldy.balanceOf(addr1.address)).to.equal(29250);
    });

  });

  

});