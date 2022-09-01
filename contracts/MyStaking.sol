//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Goldy.sol";


struct AccountHolder {
    uint startingAt;
    uint finishAt;
}

contract Staking  {
    Goldy public immutable stakingToken;
    Goldy public immutable rewardsToken;
    address public owner;
    uint public duration;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public rewardsPaid;
    mapping(address => AccountHolder) public info;
    uint256 public totalSupply;

    uint public rewardRate;

    function deposit() payable public {}

    modifier onlyOwner() {
        require(owner == msg.sender, "not authorized");
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid Address!" );

        _;
    }

    modifier validDuration() {
        require(duration > 0, "invalid duration");

        _;
    }

    modifier updateReward(address _account) {
        require(_account != address(0), "Invalid address");
        rewards[_account] = earning(_account);

        _;
    }

    constructor(address _stakingAddess, address _rewardAddress) {
        owner = msg.sender;
        stakingToken = Goldy(_stakingAddess);
        rewardsToken = Goldy(_rewardAddress);
    }

    function setRewardRate(uint _rewardAmount) external onlyOwner {
       rewardRate = _rewardAmount; 
    }

    function setRewardDuration(uint _duration_in_seconds) external onlyOwner {
        duration = _duration_in_seconds;
    }

    function earning(address _account) public view validDuration validAddress(_account) returns(uint) {
        uint counter = no_of_durations(_account);
        if(counter == 0) {
            return 0;
        } else {
            return rewardsPerUnit(balances[_account]) * counter;
        }   
    }

    function claim() external updateReward(msg.sender) {
        address _account = msg.sender;
        uint reward = rewards[_account];
        uint counter = no_of_durations(_account);
        
        require(reward > 0 , "earning = 0");

        require(reward < rewardsToken.balanceOf(address(this)), "reward amount > balance");
        require(block.timestamp >= info[_account].finishAt, "No maturity time");

        info[_account].startingAt += (duration * 1 seconds) * counter;
        info[_account].finishAt = info[_account].startingAt + (duration * 1 seconds);

        rewardsPaid[_account] += reward;

        rewardsToken.transfer(msg.sender, reward);
    } 

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(balances[msg.sender] >= _amount, "Not sufficient balance");

        balances[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);        
    }

    function stake(uint _amount) external validDuration {
        require(_amount > 0, "Amount = 0 ");        

        info[msg.sender] = AccountHolder({
            startingAt: block.timestamp,
            finishAt: block.timestamp + (duration * 1 seconds)
        });

        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] += _amount;
        totalSupply += _amount;
    }

    function rewardsPerUnit(uint _amount) private view returns(uint) {
        return rewardRate * _amount / 100 ;
    }

    function no_of_durations(address _account) private view returns(uint) {
        uint i = 0;
        uint256 startTime = info[_account].startingAt + (duration * 1 seconds);
        while (startTime <=  block.timestamp) {
            i++ ;
            startTime += (duration * 1 seconds);
        }
        return i;
    }

}