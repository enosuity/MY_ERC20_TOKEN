const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", function(){

  async function deployedMe() {
    const [ owner, addr1, addr2 ] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();
    await hardhatToken.deployed();
    return { Token, hardhatToken, owner, addr1, addr2 }
  }

  it("Deployed Token returns basic details", async function() {    
    const { hardhatToken, owner } = await loadFixture(deployedMe);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);    
    expect(await hardhatToken.totalSupply()).to.equal (ownerBalance);
    expect(await hardhatToken.owner()).to.equal(owner.address);
    expect(await hardhatToken.symbol()).to.equal("ENO") ;
    expect(await hardhatToken.name()).to.equal("Anuj Contract") ;

  });

  it("Should transfer Tokens between addresses", async function(){
    const { addr1, hardhatToken, owner, addr2 } = await loadFixture(deployedMe);
    
    await expect(
      hardhatToken.transfer(addr1.address, 100)
    ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-100, 100]);

    await expect(
      hardhatToken.connect(addr1).transfer(addr2.address, 70)
    ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-70, 70]);

    await expect(
      hardhatToken.connect(addr1).transfer(addr2.address, 20)
    ).to.emit(hardhatToken, "Transfer")
    .withArgs(addr1.address, addr2.address, 20);

  });

  it("should be enough balance", async function(){
    const { addr1, hardhatToken, owner, addr2 } = await loadFixture(deployedMe);

    const initialBalance = await hardhatToken.balanceOf(addr1.address);

    await expect(
      hardhatToken.connect(addr1).transfer(addr2.address, 50)
    ).to.be.revertedWith("Not Enough Tokens")

    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(initialBalance);
  });

});
