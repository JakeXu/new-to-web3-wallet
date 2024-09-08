// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract RandomNumberGenerator {
    address public lottery;

    modifier onlyLottery() {
        require(msg.sender == lottery, "Only Lottery can call function");
        _;
    }

    constructor(address _lottery) {
        lottery = _lottery;
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 lotteryId, uint256 userProvidedSeed) public view onlyLottery returns (bytes32) {
        return keccak256(abi.encodePacked(lotteryId, userProvidedSeed, block.prevrandao, block.timestamp, block.coinbase));
    }
}
