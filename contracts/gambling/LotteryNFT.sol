// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract LotteryNFT is ERC1155 {
    // State variables
    address internal lotteryContract;
    uint256 internal totalSupply;
    // Ticket ID => Token information
    mapping(uint256 => TicketInfo) internal ticketInfo;
    // User address => Lottery ID => Ticket IDs
    mapping(address => mapping(uint256 => uint256[])) internal userTickets;
    // Lottery ID => User addresses
    mapping(uint256 => address[]) internal lotteryUsers;
    // Storage for ticket information
    struct TicketInfo {
        address owner;
        uint16[] numbers;
        bool claimed;
        uint256 lotteryId;
    }

    event InfoBatchMint(address indexed receiving, uint256 lotteryId, uint256 amountOfTokens, uint256[] tokenIds);

    modifier onlyLotto() {
        require(msg.sender == lotteryContract, "Only Lotto can mint");
        _;
    }

    constructor(string memory _uri, address _lotto) ERC1155(_uri) {
        // Only Lotto contract will be able to mint new tokens
        lotteryContract = _lotto;
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function getTicketNumbers(uint256 _ticketID) external view returns (uint16[] memory) {
        return ticketInfo[_ticketID].numbers;
    }

    function getOwnerOfTicket(uint256 _ticketID) external view returns (address) {
        return ticketInfo[_ticketID].owner;
    }

    function getTicketClaimStatus(uint256 _ticketID) external view returns (bool) {
        return ticketInfo[_ticketID].claimed;
    }

    function getUserTickets(uint256 _lotteryId, address _user) external view returns (uint256[] memory) {
        return userTickets[_user][_lotteryId];
    }

    function getLotteryUsers(uint256 _lotteryId) external view returns (address[] memory) {
        return lotteryUsers[_lotteryId];
    }

    function batchMint(
        address _to,
        uint256 _lotteryId,
        uint8 _numberOfTickets,
        uint16[] calldata _numbers,
        uint8 sizeOfLottery
    ) external onlyLotto returns (uint256[] memory) {
        // Storage for the amount of tokens to mint (always 1)
        uint256[] memory amounts = new uint256[](_numberOfTickets);
        // Storage for the token IDs
        uint256[] memory tokenIds = new uint256[](_numberOfTickets);
        for (uint8 i = 0; i < _numberOfTickets; i++) {
            // Incrementing the tokenId counter
            totalSupply++;
            tokenIds[i] = totalSupply;
            amounts[i] = 1;
            // Getting the start and end position of numbers for this ticket
            uint16 start = uint16(i * sizeOfLottery);
            uint16 end = uint16((i + 1) * sizeOfLottery);
            // Splitting out the chosen numbers
            uint16[] calldata numbers = _numbers[start:end];
            // Storing the ticket information
            ticketInfo[totalSupply] = TicketInfo(_to, numbers, false, _lotteryId);
            userTickets[_to][_lotteryId].push(totalSupply);
        }
        lotteryUsers[_lotteryId].push(_to);
        // Minting the batch of tokens
        _mintBatch(_to, tokenIds, amounts, msg.data);
        // Emitting relevant info
        emit InfoBatchMint(_to, _lotteryId, _numberOfTickets, tokenIds);
        // Returns the token IDs of minted tokens
        return tokenIds;
    }

    function claimTicket(uint256 _ticketID, uint256 _lotteryId) external onlyLotto returns (bool) {
        require(ticketInfo[_ticketID].claimed == false, "Ticket already claimed");
        require(ticketInfo[_ticketID].lotteryId == _lotteryId, "Ticket not for this lottery");

        ticketInfo[_ticketID].claimed = true;
        return true;
    }
}
