// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract UglyAvatars is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {
    uint256 private _tokenId;
    uint256 public nftPrice = 0.1 ether;
    mapping(uint256 => uint256) public tokenPrices;

    constructor(address initialOwner) ERC721("Ugly Avatars", "UAT") Ownable(initialOwner) {}

    // Mint a new NFT
    function mintNFT(address recipient, string memory _tokenURI) public payable nonReentrant returns (uint256) {
        require(msg.value >= nftPrice, "Insufficient payment");

        uint256 newItemId = _tokenId;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        _tokenId++;

        // Transfer the payment to the contract owner
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "Transfer failed.");

        return newItemId;
    }

    // Set price for an NFT owned by the caller
    function setTokenPrice(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");

        tokenPrices[tokenId] = price;
    }

    // Purchase a listed NFT
    function purchaseNFT(uint256 tokenId) public payable nonReentrant {
        uint256 price = tokenPrices[tokenId];
        address seller = ownerOf(tokenId);

        require(msg.value >= price, "Insufficient payment");
        require(seller != msg.sender, "You cannot buy your own NFT");

        // Clear the listing price
        tokenPrices[tokenId] = 0;

        // Transfer the NFT to the buyer
        _transfer(seller, msg.sender, tokenId);

        // Transfer the payment to the seller
        (bool success, ) = seller.call{value: msg.value}("");
        require(success, "Payment transfer failed.");
    }

    // Function to allow the owner to set a new price for the initial minting
    function setPrice(uint256 newPrice) public onlyOwner {
        nftPrice = newPrice;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenId;
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 newItemId = _tokenId;

        _safeMint(to, newItemId);
        _setTokenURI(newItemId, uri);

        _tokenId++;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
