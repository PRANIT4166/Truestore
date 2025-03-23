// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CampusToken.sol";

contract participate {
    CampusToken public token; // contract instance that makes an instance of CampusToken called token

    uint256 public constant REPORT_STAKE = 25 * 10 ** 18; // 100 ETH IN WEI (IN OUR CASE CAMPUSTOKEN)
    uint256 public constant VALIDATE_STAKE = 50 * 10 ** 18;
    uint256 public constant REPORT_REWARD = 100 * 10 ** 18;
    uint256 public constant VALIDATE_REWARD = 5 * 10 ** 18;

    struct Report {
        uint256 id;
        address uploader;
        int256 net_votes; // Net vote count
        bool validated;
        address[] validators; // Store all voters
        mapping(address => int8) votes; // (address --> vote(1 or -1 hence int8)) - ensures one vote per user per report
    }

    uint256 public reportCount = 0;
    mapping(uint256 => Report) public reports; // reports map stores report serial number --> report struct 
    mapping(address => uint256) public stakedTokens; // address -- no of tokens staked. Essential for unstaking tokens before time limit.

    constructor(address tokenAddress) {
        token = CampusToken(tokenAddress);
    }

    // makes a new report
    function submitReport(uint256 reportId) external {  // Renamed from `report()` to `submitReport()`
        require(token.balanceOf(msg.sender) >= REPORT_STAKE, "Insufficient stake"); // checks if he has enough tokens

        token.burnTokens(msg.sender, REPORT_STAKE); // staking tokens for reporting (implicit penalization)
        stakedTokens[msg.sender] += REPORT_STAKE; // adding to staked tokens
        reportCount++; // for mapping purposes
        
        Report storage newReport = reports[reportId];
        newReport.id = reportId;
        newReport.uploader = msg.sender;
        newReport.net_votes = 0;
        newReport.validated = false;
    }

    function validate(uint256 reportId, int8 vote) external { // we'll get reportId and vote from the database through backend 
        Report storage reportData = reports[reportId]; // Renamed variable to `reportData`

        require(token.balanceOf(msg.sender) >= VALIDATE_STAKE, "Insufficient stake"); // checks if he has enough tokens
        require(vote == 1 || vote == -1, "Invalid vote"); // 1 for YES, -1 for NO
        require(reportData.votes[msg.sender] == 0, "Already voted"); // Fixed incorrect access

        // stake tokens 
        stakedTokens[msg.sender] += VALIDATE_STAKE;
        token.burnTokens(msg.sender, VALIDATE_STAKE); // this should get reflected in the database 

        uint256 weight = getVoteWeight(msg.sender);
        reportData.net_votes += int256(vote * int256(weight)); // Signed int because of negative votes

        reportData.votes[msg.sender] = vote; // to manage rewarding and penalizing
        reportData.validators.push(msg.sender);
    }

    function getVoteWeight(address user) public view returns (uint256) {
        uint256 balance = token.balanceOf(user);

        if (balance > 1000 * 10 ** 18) {
            return 3; // 3x vote weight for top holders
        } else if (balance > 500 * 10 ** 18) {
            return 1; // 1.5x vote weight
        } else {
            return 1; // Normal weight
        }
    }

    function _posoutcome(uint256 reportId) internal {
        Report storage reportData = reports[reportId]; // Renamed variable to `reportData`

        token.rewardTokens(reportData.uploader, REPORT_REWARD + REPORT_STAKE); // reward for uploader

        // reward people with yes votes
        for (uint256 i = 0; i < reportData.validators.length; i++) {
            address validator = reportData.validators[i];
            if (reportData.votes[validator] == 1) {
                token.rewardTokens(validator, VALIDATE_REWARD + VALIDATE_STAKE);
            }
            stakedTokens[validator] -= VALIDATE_STAKE;
        }



    }

    function _negoutcome(uint256 reportId) internal {
        Report storage reportData = reports[reportId]; // Renamed variable to `reportData`

        // reward people with no votes
        for (uint256 i = 0; i < reportData.validators.length; i++) {
            address validator = reportData.validators[i];
            if (reportData.votes[validator] == -1) {
                token.rewardTokens(validator, VALIDATE_REWARD + VALIDATE_STAKE);
            }
            stakedTokens[validator] -= VALIDATE_STAKE;
        }


    }

 

    function finalizeReport(uint256 reportId)  external   {   // add returns bool
        Report storage reportData = reports[reportId]; // report gets stored in the blockchain

        require(!reportData.validated, "Already validated");
        reportData.validated = true;

        stakedTokens[reportData.uploader] -= REPORT_STAKE;
        if (reportData.net_votes > 0) { // implement net_votes == 0
            _posoutcome(reportId);
        // return a bool for report scheme verified
        
        } else {
            _negoutcome(reportId);
           // return a bool for report scheme rejected
        }

    }

    function revoke_vote(uint256 reportId) external {
        Report storage reportData = reports[reportId];

        require(reportData.votes[msg.sender] != 0, "You have not voted or already revoked");

        int8 userVote = reportData.votes[msg.sender];

        // give back their staked tokens
        stakedTokens[msg.sender] -= VALIDATE_STAKE;
        token.rewardTokens(msg.sender, VALIDATE_STAKE);

        // remove them from consensus
        uint256 weight = getVoteWeight(msg.sender);
        reportData.net_votes -= int256(userVote * int256(weight));
        reportData.votes[msg.sender] = 0;

        emit VoteRevoked(reportId, msg.sender);
    }

    function revoke_report(uint256 reportId) external {
        Report storage reportData = reports[reportId];

        require(msg.sender == reportData.uploader, "Only uploader can revoke");
        require(!reportData.validated, "Report already finalized");

        // Refund the uploader's stake
        token.rewardTokens(reportData.uploader, REPORT_STAKE);
        stakedTokens[msg.sender] -= REPORT_STAKE;

        // Delete the report
        delete reports[reportId];

        emit ReportRevoked(reportId, msg.sender);
    }

    event VoteRevoked(uint256 reportId, address voter);
    event ReportRevoked(uint256 reportId, address uploader);
}
