// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CampusToken.sol";

contract participate{
        CampusToken public token; // contract instance that makes an instance of CampusToken called token

    uint256 public constant REPORT_STAKE = 100 * 10 ** 18; // 100 ETH IN WEI (IN OUR CASE CAMPUSTOKEN)
    uint256 public constant VALIDATE_STAKE = 50 * 10 ** 18;
    uint256 public constant REPORT_REWARD = 5 * 10 ** 18;
    uint256 public constant VALIDATE_REWARD = 10 * 10 ** 18;


      struct Report {
        uint256 id;
        address uploader;
        int256 net_votes; // Net vote count
        bool validated;
        address[] validators; // Store all voters
        mapping(address => int8) votes; // (address --> vote(1 or -1 hence int8)) - ensures one vote per user per report
    }

    uint256 public reportCount = 0;
    mapping(uint256 => Report) public reports; //reports map stores report serial number --> report struct 


    mapping(address => uint256) public stakedTokens; // address -- no of tokens staked.
    // essential for unstaking tokens before time limit. 




     constructor(address tokenAddress) {
        token = CampusToken(tokenAddress);
    }


        // makes a new report
    function report() external {
        require(token.balanceOf(msg.sender) >= REPORT_STAKE, "Insufficient stake"); // checks if he has enough tokens

        token.burnTokens(msg.sender,REPORT_STAKE); //staking tokens for reporting (implicit penalization)
        stakedTokens[msg.sender]+=REPORT_STAKE; // adding to staked tones
        reportCount++; // for mapping purposes
        reports[reportCount] = Report(reportCount, msg.sender, 0, false);
    }

    function validate(uint256 reportId, int8 vote) external{
         Report storage report = reports[reportId];

        require(token.balanceOf(msg.sender) >= VALIDATE_STAKE , "Insufficient stake"); // checks if he has enough tokens
        require(vote == 1 || vote == -1, "Invalid vote"); // 1 for YES, -1 for NO
        require(report.votes[reportId][msg.sender] == 0, "Already voted");

        // stake his tokens 
        stakedTokens[msg.sender]+= VALIDATE_STAKE;
        token.burnTokens(msg.sender, VALIDATE_STAKE);


        uint256 weight = getVoteWeight(msg.sender);
        reports[reportId].net_votes += int256(vote * int256(weight)); // we see that it is a signed int (because of negative votes)

        report.votes[reportId][msg.sender] = vote; // to manage rewarding and penalizing

        reports[reportId].validators.push(msg.sender); 


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

    function _posoutcome(uint256 reportId) internal {
        Report storage report = reports[reportId]; // refers to the original report

        token.rewardTokens(report.uploader, REPORT_REWARD + REPORT_STAKE); // reward for uploader


        //reward people with yes
        for (uint256 i = 0; i < report.validators.length; i++) {
        address validator = report.validators[i];
            if (report.votes[reportId][validator] == 1) {
                token.rewardTokens(validator,VALIDATE_REWARD + VALIDATE_STAKE); 
            }

             token.stakedTokens[validator] -= VALIDATE_STAKE ;


        }
        

         // BELOW WAS COMMENTED OUT BECAUSE PENALIZATION WAS DONE AT VALIDATION TIME IN validate();

        // //penalize people with no
        // for (uint256 i = 1; i <= reportCount; i++) {
        //     if (votes[reportId][msg.sender] == -1) {
        //         token.burnTokens(msg.sender, stakedTokens[msg.sender]); // burn their stake
        //     }
        // }
      
    }

    function _negoutcome(uint256 reportId) internal{
       Report storage report = reports[reportId]; // refers to the original report

    //    token.burnTokens(report.uploader,REPORT_STAKE);  BURNED AT SOURCE

        // BELOW WAS COMMENTED OUT BECAUSE PENALIZATION WAS DONE AT VALIDATION TIME IN validate();

        // // penalize people with yes
        //  for (uint256 i = 1; i <= reportCount; i++) {
        //     if (votes[reportId][msg.sender] == 1) {
        //         token.burnTokens(msg.sender, stakedTokens[msg.sender]); // burn their stake
        //     }
        // }

        // reward people with no
         for (uint256 i = 0; i < report.validators.length; i++) {

            address validator = report.validators[i];
            if (report.votes[reportId][validator] == -1) {
                token.rewardTokens(validator,VALIDATE_REWARD + VALIDATE_STAKE);  
            }
            token.stakedTokens[validator] -= VALIDATE_STAKE ;

        }

    }

    function finalizeReport(uint256 reportId) external{
        Report storage report = reports[reportId]; // report gets stored in the blockchain (happens by default with primitives)
        require(!report.validated, "Already validated");

        report.validated = true;

          if (report.net_votes > 0) {
            _posoutcome(reportId);
        } else {
            _negoutcome(reportId);
        }

        stakedTokens[report.uploader]-=REPORT_STAKE;

    }

    function revoke_vote(uint256 reportID) external {  // to revoke a vote for validation
        require(report.votes[reportId][msg.sender] != 0, "You have not voted or already revoked");

        int8 userVote = report.votes[reportId][msg.sender];


        // give back their staked tokens
        stakedTokens[msg.sender]-= VALIDATE_STAKE;
        token.rewardTokens(msg.sender,VALIDATE_STAKE);

        //to remove them from consensus
        uint256 weight = getVoteWeight(msg.sender);
        reports[reportId].net_votes -= int256(userVote * int256(weight));
        report.votes[reportId][msg.sender] = 0;

        emit VoteRevoked(reportId, msg.sender);
    }

    function revoke_report(uint256 reportID) external{ // should we do revoke report?
          Report storage report = reports[reportId];

    require(msg.sender == report.uploader, "Only uploader can revoke");
    require(!report.validated, "Report already finalized");


    // Refund the uploader's stake
    token.rewardTokens(report.uploader, REPORT_STAKE);
    stakedTokens[msg.sender]-=REPORT_STAKE;

    // Delete the report
    delete reports[reportId];

    emit ReportRevoked(reportId, msg.sender);


    }   

    




}