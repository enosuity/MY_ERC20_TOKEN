const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", function(){

  async function deployedMe() {
    const [ owner, addr1, addr2, addr3 ] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Goldy");
    const myContract = await Token.deploy("Goldy Bhai", "GLD");
    await myContract.deployed();
    return { Token, myContract, owner, addr1, addr2, addr3 }
  }

  it("token returns metadata", async function() {    
    const { myContract, owner } = await loadFixture(deployedMe);
    expect(await myContract.name()).to.equal("Goldy Bhai");
    expect(await myContract.symbol()).to.equal("GLD");
    expect(await myContract.decimals()).to.equal(8) ; 
    expect(await myContract.totalSupply()).to.equal(0) ;
    expect(await myContract.balanceOf(owner.address)).to.equal(0) ; 
  });

  it("should minting tokens", async function() {    
    const { myContract, addr1 } = await loadFixture(deployedMe);
    await myContract.mint(addr1.address, 150);
    expect(await myContract.totalSupply()).to.equal(150);

    await myContract.burn(addr1.address, 50);
    expect(await myContract.totalSupply()).to.equal(100);
  });

  it("should transferFrom from one account to another", async function() {    
    const { myContract, addr1, addr2, addr3 } = await loadFixture(deployedMe);

    await myContract.mint(addr1.address, 1500)
    expect(await myContract.totalSupply()).to.equal(1500);
    
    await myContract.connect(addr1).approve(addr2.address, 500);
    await myContract.allowance(addr1.address, addr2.address);
    
    
    await expect(
        myContract.connect(addr2).transferFrom(addr1.address, addr3.address, 550)
    ).to.be.revertedWith("ERC20: insufficient allowance"); 

    expect(await myContract.allowance(addr1.address, addr2.address)).to.equal(500);
    
    await myContract.connect(addr2).transferFrom(addr1.address, addr3.address, 250);
    expect(await myContract.allowance(addr1.address, addr2.address)).to.equal(250);    
    
  });

  it("should trigger emit Transfer", async function() {    
    const { myContract, addr1, addr2 } = await loadFixture(deployedMe);

    await myContract.mint(addr1.address, 150);
    
    await expect(
        myContract.connect(addr1).transfer(addr2.address, 50)
    ).to.emit(myContract, "Transfer")
     .withArgs(addr1.address, addr2.address, 50);

    expect(await myContract.balanceOf(addr1.address)).to.equal(100);
  });


  it("should move from to another", async function() {    
    const { myContract, addr1, addr2 } = await loadFixture(deployedMe);

    await myContract.mint(addr1.address, 1000);
    
    await expect(
        myContract.connect(addr1).transfer(addr2.address, 500)
    ).to.changeTokenBalances(myContract, [addr1, addr2], [-500, 500]);

    expect(await myContract.balanceOf(addr1.address)).to.equal(500);
  });


  it("should increase allowance", async function() {    
    const { myContract, addr1, addr2, addr3 } = await loadFixture(deployedMe);

    await myContract.mint(addr1.address, 1500)
    
    await myContract.connect(addr1).approve(addr2.address, 500);
    await myContract.allowance(addr1.address, addr2.address);
    
    expect(await myContract.allowance(addr1.address, addr2.address)).to.equal(500);
    
    
    await myContract.connect(addr1).increaseAllowance(addr2.address, 200);
    expect(await myContract.allowance(addr1.address, addr2.address)).to.equal(700);    
    
    await myContract.connect(addr1).decreaseAllowance(addr2.address, 300);
    expect(await myContract.allowance(addr1.address, addr2.address)).to.equal(400);   
  });

});