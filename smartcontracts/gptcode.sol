// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CampusToken.sol";

contract ReportValidation {
    CampusToken public token;
    
    uint256 public constant REPORT_STAKE = 100 * 10 ** 18;
    uint256 public constant VALIDATE_STAKE = 50 * 10 ** 18;
    
    struct Report {
        uint256 id;
        address uploader;
        int256 votes; // Net vote count (YES - NO)
        bool validated;
    }

    mapping(uint256 => Report) public reports;
    mapping(uint256 => mapping(address => int8)) public votes; // Stores votes per report
    mapping(address => uint256) public stakedTokens;

    uint256 public reportCount = 0;

    constructor(address tokenAddress) {
        token = CampusToken(tokenAddress);
    }

    function report() external {
        require(token.stakedTokens(msg.sender) >= REPORT_STAKE, "Insufficient stake");

        reportCount++;
        reports[reportCount] = Report(reportCount, msg.sender, 0, false);
    }

    function validate(uint256 reportId, int8 vote) external {
        require(token.stakedTokens(msg.sender) >= VALIDATE_STAKE, "Insufficient stake");
        require(vote == 1 || vote == -1, "Invalid vote"); // 1 for YES, -1 for NO
        require(votes[reportId][msg.sender] == 0, "Already voted");

        uint256 weight = getVoteWeight(msg.sender);
        reports[reportId].votes += int256(vote * int256(weight));
        votes[reportId][msg.sender] = vote;
    }

    function finalizeReport(uint256 reportId) external {
        Report storage report = reports[reportId];
        require(!report.validated, "Already validated");

        report.validated = true;

        if (report.votes > 0) {
            _reward(reportId);
        } else {
            _penalize(reportId);
        }
    }

    function _reward(uint256 reportId) internal {
        Report storage report = reports[reportId];

        // Reward uploader
        token.rewardTokens(report.uploader, 10 * 10 ** 18);

        // Reward validators who voted YES
        for (uint256 i = 1; i <= reportCount; i++) {
            if (votes[reportId][msg.sender] == 1) {
                token.rewardTokens(msg.sender, 5 * 10 ** 18);
            }
        }
    }

    function _penalize(uint256 reportId) internal {
        Report storage report = reports[reportId];

        // Penalize uploader
        token.burnTokens(report.uploader, 10 * 10 ** 18);

        // Penalize those who voted YES
        for (uint256 i = 1; i <= reportCount; i++) {
            if (votes[reportId][msg.sender] == 1) {
                token.burnTokens(msg.sender, 5 * 10 ** 18);
            }
        }

        // Reward those who voted NO
        for (uint256 i = 1; i <= reportCount; i++) {
            if (votes[reportId][msg.sender] == -1) {
                token.rewardTokens(msg.sender, 5 * 10 ** 18);
            }
        }
    }

    function getVoteWeight(address user) public view returns (uint256) {
        uint256 balance = token.balanceOf(user);

        if (balance > 1000 * 10 ** 18) {
            return 3; // 3x vote weight for top holders
        } else if (balance > 500 * 10 ** 18) {
            return 1.5; // 1.5x vote weight
        } else {
            return 1; // Normal weight
        }
    }
}
