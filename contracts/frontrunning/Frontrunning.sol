// SPDX-License-Identifier: MIT
// By jake
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FrontRunningNFT is ERC721 {
    uint256 public totalSupply;

    constructor() ERC721("Front Running NFT", "FRN") {}

    function mint() external {
        _mint(msg.sender, totalSupply);
        totalSupply++;
    }
}
