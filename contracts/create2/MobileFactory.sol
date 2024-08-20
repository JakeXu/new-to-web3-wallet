// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Mobile.sol";

interface IMobile {
    function initialize(address _operator, uint256 _serialNumber, uint256 _display, uint256 _capacity, string memory _color) external;
}

contract MobileFactory {
    address[] public mobiles;

    mapping(address => bool) public existMobile;

    bytes32 public hash;

    function getAllMobiles() public view returns (address[] memory _mobiles) {
        _mobiles = getMobiles(0, mobiles.length);
    }

    function getMobiles(uint _start, uint _end) public view returns (address[] memory _mobiles) {
        _mobiles = new address[](_end - _start);
        for (uint i = _start; i < _end; i++) {
            _mobiles[i - _start] = mobiles[i];
        }
    }

    function totalMobile() external view returns (uint256) {
        return mobiles.length;
    }

    event MobileCreated(address maker, uint256 _serialNumber, uint256 _display, uint256 _capacity, string _color, address _mobile);

    function makeMobile(uint256 _display, uint256 _capacity, string memory _color) external returns (address mobile) {
        uint256 _serialNumber = mobiles.length + 1;
        bytes memory bytecode = type(Mobile).creationCode;
        if (hash == bytes32(0)) {
            hash = keccak256(bytecode);
        }
        bytes32 salt = keccak256(abi.encodePacked(_serialNumber, _display, _capacity, _color));
        assembly {
            mobile := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        require(existMobile[mobile] == false, "This mobile has been made");
        existMobile[mobile] = true;
        IMobile(mobile).initialize(msg.sender, _serialNumber, _display, _capacity, _color);
        mobiles.push(mobile);
        emit MobileCreated(msg.sender, _serialNumber, _display, _capacity, _color, mobile);
    }

    function hashMobile(
        int256 _serialNumber,
        uint256 _display,
        uint256 _capacity,
        string memory _color
    ) external view returns (address mobile) {
        mobile = address(
            uint160(
                uint(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            address(this),
                            keccak256(abi.encodePacked(_serialNumber, _display, _capacity, _color)),
                            hash
                        )
                    )
                )
            )
        );
    }
}
