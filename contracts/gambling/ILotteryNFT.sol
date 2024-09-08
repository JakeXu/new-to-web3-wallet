// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
pragma experimental ABIEncoderV2;

interface ILotteryNFT {
    function getTotalSupply() external view returns (uint256);

    function getTicketNumbers(uint256 _ticketId) external view returns (uint16[] memory);

    function getOwnerOfTicket(uint256 _ticketId) external view returns (address);

    function getTicketClaimStatus(uint256 _ticketId) external view returns (bool);

    function getUserTickets(uint256 _lotteryId, address _user) external view returns (uint256[] memory);

    function getLotteryUsers(uint256 _lotteryId) external view returns (address[] memory);

    function batchMint(
        address _to,
        uint256 _lottoID,
        uint8 _numberOfTickets,
        uint16[] calldata _numbers,
        uint8 sizeOfLottery
    ) external returns (uint256[] memory);

    function claimTicket(uint256 _ticketId, uint256 _lotteryId) external returns (bool);
}
