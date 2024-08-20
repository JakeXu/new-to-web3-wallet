// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Mobile {
    using Strings for uint256;

    struct Log {
        uint step;
        string from;
        string to;
        uint256 time;
        address operator;
    }

    uint256 public serialNumber;
    string public color;
    uint256 public display; // 6.7-inch
    uint256 public capacity; // 256g
    uint256 public steps; // Total processing times
    address public operator;
    Log[] public logs;
    address public factory;

    function getMobileInfo()
        public
        view
        returns (uint _serialNumber, string memory _color, uint _display, uint _capacity, uint _steps, address _operator)
    {
        _serialNumber = serialNumber;
        _color = color;
        _display = display;
        _capacity = capacity;
        _steps = steps;
        _operator = operator;
    }

    constructor() {
        factory = msg.sender;
    }

    event Trace(address operator, string from, string to, uint256 time);
    event OperatorUpdated(address oldOperator, address newOperator, uint256 time);

    modifier onlyOperator() {
        require(operator == msg.sender, "Permission deny");
        _;
    }

    function initialize(address _operator, uint256 _serialNumber, uint256 _display, uint256 _capacity, string memory _color) external {
        require(msg.sender == factory, "Permission deny");
        operator = _operator;
        serialNumber = _serialNumber;
        color = _color;
        display = _display;
        capacity = _capacity;
        _processAction("Init", string(abi.encodePacked(color, "/", display.toString(), "/", capacity.toString())));
    }

    function getAllLogs() public view returns (Log[] memory _logs) {
        _logs = getLogs(0, logs.length);
    }

    function getLogs(uint _start, uint _end) public view returns (Log[] memory _logs) {
        uint end = _end + 1 >= logs.length ? logs.length : _end;
        _logs = new Log[](end - _start);
        for (uint i = _start; i < end; i++) {
            _logs[i - _start] = logs[i];
        }
    }

    function updateOperator(address _operator) external onlyOperator {
        emit OperatorUpdated(operator, _operator, block.timestamp);
        operator = _operator;
    }

    function _processAction(string memory _from, string memory _to) internal {
        steps += 1;
        logs.push(Log({from: _from, to: _to, time: block.timestamp, step: steps, operator: msg.sender}));
        emit Trace(msg.sender, _from, _to, block.timestamp);
    }

    function processAction(string memory _from, string memory _to) public onlyOperator {
        _processAction(_from, _to);
    }
}
