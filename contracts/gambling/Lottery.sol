// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./ILotteryNFT.sol";
import "./IRandomNumberGenerator.sol";
import "hardhat/console.sol";

contract Lottery is Ownable, Initializable {
    // Storing of the NFT
    ILotteryNFT internal nft;
    // Storing of the randomness generator
    IRandomNumberGenerator internal randomGenerator;
    // Counter for lottery Id
    uint256 public lotteryId;
    // Lottery size
    uint8 public sizeOfLottery;
    // User address => Exist
    mapping(address => bool) internal isExist;

    mapping(uint256 => LottoInfo) internal allLotteries;

    // Represents the status of the lottery
    enum Status {
        NotStarted, // The lottery has not started yet
        Open, // The lottery is open for ticket purchases
        Completed // The lottery has been closed and the numbers drawn
    }

    struct LottoInfo {
        uint256 lotteryID; // ID for lotto
        Status lotteryStatus; // Status for lotto
        uint256 prizePool; // The amount for prize money
        uint256 costPerTicket; // Cost per ticket / 100000000000000000
        uint8[] prizeDistribution; // The distribution for prize money ["5","10","15","25","45"]
        uint256 startingTimestamp; // Block timestamp for star of lotto
        uint256 closingTimestamp; // Block timestamp for end of entries
        uint16[] winningNumbers; // The winning numbers
        uint8[] winningDistribution; // The distribution for winning
    }

    event NewMint(address indexed minter, uint256[] ticketIDs, uint16[] numbers, uint256 totalCost, uint256 discount, uint256 pricePaid);

    event LotteryOpen(uint256 lotteryId, uint256 ticketSupply);

    event LotteryClose(uint256 lotteryId, uint16[] winningNumbers, uint256 ticketSupply);

    event WithdrawAll(uint256 lotteryId, uint256 leftPrize);

    modifier notContract() {
        require(msg.sender == tx.origin, "contract not allowed");
        _;
    }

    constructor(address initialOwner, uint8 _sizeOfLotteryNumbers) Ownable(initialOwner) {
        sizeOfLottery = _sizeOfLotteryNumbers;
    }

    function initialize(address _lotteryNFT, address _IRandomNumberGenerator) external initializer onlyOwner {
        require(_lotteryNFT != address(0) && _IRandomNumberGenerator != address(0), "Contracts cannot be 0 address");
        nft = ILotteryNFT(_lotteryNFT);
        randomGenerator = IRandomNumberGenerator(_IRandomNumberGenerator);
    }

    function costToBuyTickets(uint256 _lotteryId, uint256 _numberOfTickets) external view returns (uint256 totalCost) {
        uint256 pricePer = allLotteries[_lotteryId].costPerTicket;
        totalCost = pricePer * _numberOfTickets;
    }

    function getLottoInfo(uint256 _lotteryId) external view returns (LottoInfo memory) {
        return allLotteries[_lotteryId];
    }

    function drawWinningNumbers(uint256 _lotteryId, uint256 _seed) external onlyOwner {
        // Checks that the lottery is past the closing block
        require(allLotteries[_lotteryId].closingTimestamp <= block.timestamp, "Cannot set winning numbers during lottery");
        // Checks lottery numbers have not already been drawn
        require(allLotteries[_lotteryId].lotteryStatus == Status.Open, "Lottery State incorrect for draw");
        // Sets lottery status to closed
        allLotteries[_lotteryId].lotteryStatus = Status.Completed;
        // Requests a random number from the generator
        uint16[] memory winningNumbers = _split(uint256(randomGenerator.getRandomNumber(_lotteryId, _seed)));
        allLotteries[_lotteryId].winningNumbers = winningNumbers;
        address[] memory users = nft.getLotteryUsers(_lotteryId);
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (isExist[user]) {
                continue;
            }
            uint256[] memory tickets = nft.getUserTickets(_lotteryId, user);
            for (uint256 j = 0; j < tickets.length; j++) {
                uint8 matchingNumbers = _getNumberOfMatching(nft.getTicketNumbers(tickets[j]), winningNumbers);
                if (matchingNumbers > 0) {
                    allLotteries[_lotteryId].winningDistribution[matchingNumbers - 1]++;
                }
            }
            isExist[user] = true;
        }
        for (uint256 i = 0; i < users.length; i++) {
            delete isExist[users[i]];
        }
        // Emits that random number has been requested
        emit LotteryClose(_lotteryId, winningNumbers, nft.getTotalSupply());
    }

    function createNewLotto(
        uint8[] calldata _prizeDistribution,
        uint256 _costPerTicket,
        uint256 _startingTimestamp,
        uint256 _closingTimestamp
    ) external onlyOwner returns (uint256) {
        require(_prizeDistribution.length == sizeOfLottery, "Invalid distribution");
        uint256 prizeDistributionTotal = 0;
        for (uint256 j = 0; j < _prizeDistribution.length; j++) {
            prizeDistributionTotal = prizeDistributionTotal + uint256(_prizeDistribution[j]);
        }
        // Ensuring that prize distribution total is 100%
        require(prizeDistributionTotal == 100, "Prize distribution is not 100%");
        require(_costPerTicket != 0, "Cost cannot be 0");
        require(_startingTimestamp != 0 && _startingTimestamp < _closingTimestamp, "Timestamps for lottery invalid");
        // Incrementing lottery ID
        lotteryId++;
        uint256 lotteryId_ = lotteryId;
        uint16[] memory winningNumbers = new uint16[](sizeOfLottery);
        Status lotteryStatus;
        if (_startingTimestamp >= block.timestamp) {
            lotteryStatus = Status.Open;
        } else {
            lotteryStatus = Status.NotStarted;
        }
        // Saving data in struct
        uint8[] memory winningDistribution = new uint8[](sizeOfLottery);
        LottoInfo memory newLottery = LottoInfo(
            lotteryId_,
            lotteryStatus,
            0,
            _costPerTicket,
            _prizeDistribution,
            _startingTimestamp,
            _closingTimestamp,
            winningNumbers,
            winningDistribution
        );
        allLotteries[lotteryId_] = newLottery;

        // Emitting important information around new lottery.
        emit LotteryOpen(lotteryId_, nft.getTotalSupply());

        return lotteryId_;
    }

    function buyLottoTicket(uint16[] calldata _chosenNumbersForEachTicket) external payable notContract {
        // Ensuring the lottery is within a valid time
        require(block.timestamp >= allLotteries[lotteryId].startingTimestamp, "Invalid time for mint:start");
        require(block.timestamp < allLotteries[lotteryId].closingTimestamp, "Invalid time for mint:end");
        require(allLotteries[lotteryId].costPerTicket <= msg.value, "Insufficient payment");
        if (allLotteries[lotteryId].lotteryStatus == Status.NotStarted) {
            if (allLotteries[lotteryId].startingTimestamp >= block.timestamp) {
                allLotteries[lotteryId].lotteryStatus = Status.Open;
            }
        }
        require(allLotteries[lotteryId].lotteryStatus == Status.Open, "Lottery not in state for mint");
        allLotteries[lotteryId].prizePool += msg.value;
        uint8 _numberOfTickets = 1;
        // Temporary storage for the check of the chosen numbers array
        uint256 numberCheck = _numberOfTickets * sizeOfLottery;
        // Ensuring that there are the right amount of chosen numbers
        require(_chosenNumbersForEachTicket.length == numberCheck, "Invalid chosen numbers");
        // Batch mints the user their tickets
        uint256[] memory ticketIds = nft.batchMint(msg.sender, lotteryId, _numberOfTickets, _chosenNumbersForEachTicket, sizeOfLottery);
        // Emitting event with all information
        emit NewMint(msg.sender, ticketIds, _chosenNumbersForEachTicket, msg.value, 0, msg.value);
    }

    function claimReward(uint256 _lotteryId, uint256 _tokenId) external notContract {
        // Checking the lottery is in a valid time for claiming
        require(allLotteries[_lotteryId].closingTimestamp <= block.timestamp, "Wait till end to claim");
        // Checks the lottery winning numbers are available
        require(allLotteries[_lotteryId].lotteryStatus == Status.Completed, "Winning Numbers not chosen yet");
        require(nft.getOwnerOfTicket(_tokenId) == msg.sender, "Only the owner can claim");
        // Sets the claim of the ticket to true (if claimed, will revert)
        require(nft.claimTicket(_tokenId, _lotteryId), "Numbers for ticket invalid");
        // Getting the number of matching tickets
        uint8 matchingNumbers = _getNumberOfMatching(nft.getTicketNumbers(_tokenId), allLotteries[_lotteryId].winningNumbers);
        // Getting the prize amount for those matching tickets
        uint256 prize = _prizeForMatching(matchingNumbers, _lotteryId);
        if (prize > 0) {
            prize += allLotteries[_lotteryId].costPerTicket;
            (bool success, ) = payable(address(msg.sender)).call{value: prize}("");
            require(success, "Transfer failed");
        }
    }

    function _getNumberOfMatching(uint16[] memory _usersNumbers, uint16[] memory _winningNumbers) internal pure returns (uint8) {
        uint8 noOfMatching;
        // Loops through all winning numbers
        for (uint256 i = 0; i < _winningNumbers.length; i++) {
            // If the winning numbers and user numbers match
            if (_usersNumbers[i] == _winningNumbers[i]) {
                // The number of matching numbers increases
                noOfMatching += 1;
            }
        }
        return noOfMatching;
    }

    function _prizeForMatching(uint8 _noOfMatching, uint256 _lotteryId) internal view returns (uint256) {
        uint256 prize = 0;
        // If user has no matching numbers their prize is 0
        if (_noOfMatching == 0) {
            return 0;
        }
        // Getting the percentage of the pool the user has won
        uint256 perOfPool = allLotteries[_lotteryId].prizeDistribution[_noOfMatching - 1];
        uint256 matchingCount = allLotteries[_lotteryId].winningDistribution[_noOfMatching - 1];
        // Calculating the percentage one by the pool
        prize = (allLotteries[_lotteryId].prizePool * perOfPool * 9) / matchingCount;
        // Returning the prize divided by 100 (as the prize distribution is scaled)
        return prize / 1000;
    }

    function _split(uint256 _randomNumber) internal view returns (uint16[] memory) {
        // Temporary storage for winning numbers
        uint16[] memory winningNumbers = new uint16[](sizeOfLottery);
        // Loops the size of the number of tickets in the lottery
        for (uint i = 0; i < sizeOfLottery; i++) {
            // Encodes the random number with its position in loop
            bytes32 hashOfRandom = keccak256(abi.encodePacked(_randomNumber, i));
            // Casts random number hash into uint256
            uint256 numberRepresentation = uint256(hashOfRandom);
            // Sets the winning number position to a uint16 of random hash number
            winningNumbers[i] = uint16(numberRepresentation % 10);
        }
        return winningNumbers;
    }

    function withdrawAll(uint256 _lotteryId) external notContract onlyOwner {
        uint256 leftPrize = address(this).balance;
        (bool success, ) = payable(owner()).call{value: leftPrize}("");
        require(success, "Transfer failed");
        emit WithdrawAll(_lotteryId, leftPrize);
    }
}
