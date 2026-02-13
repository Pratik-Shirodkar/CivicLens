// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CivicLensBounty
 * @notice Manages civic incident reports with AI verification and x402-powered bounty payouts
 * @dev Deployed on Cronos EVM for the x402 Paytech Hackathon
 */
contract CivicLensBounty is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Report {
        uint256 id;
        address reporter;
        string contentHash;      // IPFS hash of image
        string description;
        string aiAnalysis;
        uint8 severityScore;     // 1-10
        uint256 timestamp;
        uint256 upvotes;
        bool isVerified;
        bool bountyPaid;
        uint256 bountyAmount;
    }
    
    // ============ State Variables ============
    
    IERC20 public usdcToken;
    
    uint256 public reportCount;
    mapping(uint256 => Report) public reports;
    mapping(address => uint256) public reporterReputation;
    mapping(address => uint256) public lastReportTime;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    
    // Bounty configuration
    uint256 public constant BOUNTY_LOW = 1 * 10**6;       // 1 USDC (6 decimals)
    uint256 public constant BOUNTY_MEDIUM = 3 * 10**6;    // 3 USDC
    uint256 public constant BOUNTY_HIGH = 5 * 10**6;      // 5 USDC
    uint256 public constant BOUNTY_CRITICAL = 10 * 10**6; // 10 USDC
    
    uint256 public constant UPVOTE_BONUS = 100000;        // 0.1 USDC per upvote
    uint256 public constant COOLDOWN_PERIOD = 5 minutes;
    
    // ============ Events ============
    
    event NewIncidentReported(
        uint256 indexed id,
        address indexed reporter,
        uint8 severity,
        string description
    );
    
    event ReportVerified(
        uint256 indexed id,
        uint8 severity,
        uint256 bountyAmount
    );
    
    event BountyPaid(
        uint256 indexed reportId,
        address indexed recipient,
        uint256 amount
    );
    
    event ReportUpvoted(
        uint256 indexed reportId,
        address indexed voter,
        uint256 newUpvoteCount
    );
    
    // ============ Constructor ============
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Submit a new civic incident report
     * @param _contentHash IPFS hash of the incident image
     * @param _description Description of the incident
     */
    function submitReport(
        string calldata _contentHash,
        string calldata _description
    ) external returns (uint256) {
        require(
            block.timestamp >= lastReportTime[msg.sender] + COOLDOWN_PERIOD,
            "Please wait before submitting another report"
        );
        
        reportCount++;
        
        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            contentHash: _contentHash,
            description: _description,
            aiAnalysis: "",
            severityScore: 0,
            timestamp: block.timestamp,
            upvotes: 0,
            isVerified: false,
            bountyPaid: false,
            bountyAmount: 0
        });
        
        lastReportTime[msg.sender] = block.timestamp;
        
        emit NewIncidentReported(reportCount, msg.sender, 0, _description);
        
        return reportCount;
    }
    
    /**
     * @notice Verify a report and process bounty payment (called by backend/x402 facilitator)
     * @param _reportId Report ID to verify
     * @param _aiAnalysis AI analysis result
     * @param _severityScore Severity score (1-10)
     */
    function verifyAndPayBounty(
        uint256 _reportId,
        string calldata _aiAnalysis,
        uint8 _severityScore
    ) external onlyOwner nonReentrant {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        require(!reports[_reportId].isVerified, "Report already verified");
        require(_severityScore >= 1 && _severityScore <= 10, "Severity must be 1-10");
        
        Report storage report = reports[_reportId];
        
        report.aiAnalysis = _aiAnalysis;
        report.severityScore = _severityScore;
        report.isVerified = true;
        
        // Calculate bounty based on severity
        uint256 bountyAmount = calculateBounty(_severityScore);
        report.bountyAmount = bountyAmount;
        
        // Pay bounty
        if (bountyAmount > 0 && usdcToken.balanceOf(address(this)) >= bountyAmount) {
            report.bountyPaid = true;
            reporterReputation[report.reporter] += _severityScore;
            
            require(
                usdcToken.transfer(report.reporter, bountyAmount),
                "Bounty transfer failed"
            );
            
            emit BountyPaid(_reportId, report.reporter, bountyAmount);
        }
        
        emit ReportVerified(_reportId, _severityScore, bountyAmount);
    }
    
    /**
     * @notice Upvote a verified report
     * @param _reportId Report ID to upvote
     */
    function upvoteReport(uint256 _reportId) external {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        require(reports[_reportId].isVerified, "Report not verified");
        require(!hasUpvoted[_reportId][msg.sender], "Already upvoted");
        require(reports[_reportId].reporter != msg.sender, "Cannot upvote own report");
        
        hasUpvoted[_reportId][msg.sender] = true;
        reports[_reportId].upvotes++;
        
        emit ReportUpvoted(_reportId, msg.sender, reports[_reportId].upvotes);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate bounty based on severity score
     */
    function calculateBounty(uint8 _severity) public pure returns (uint256) {
        if (_severity >= 9) return BOUNTY_CRITICAL;
        if (_severity >= 7) return BOUNTY_HIGH;
        if (_severity >= 4) return BOUNTY_MEDIUM;
        if (_severity >= 1) return BOUNTY_LOW;
        return 0;
    }
    
    /**
     * @notice Get report details
     */
    function getReport(uint256 _id) external view returns (Report memory) {
        require(_id > 0 && _id <= reportCount, "Invalid report ID");
        return reports[_id];
    }
    
    /**
     * @notice Fetch recent reports (for feed)
     */
    function fetchRecentReports(uint256 _limit) external view returns (Report[] memory) {
        uint256 count = _limit > reportCount ? reportCount : _limit;
        Report[] memory result = new Report[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = reports[reportCount - i];
        }
        
        return result;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Fund the contract with USDC for bounties
     */
    function fundBountyPool(uint256 _amount) external {
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "Funding transfer failed"
        );
    }
    
    /**
     * @notice Withdraw excess USDC (emergency only)
     */
    function withdrawExcess(uint256 _amount) external onlyOwner {
        require(
            usdcToken.transfer(owner(), _amount),
            "Withdrawal failed"
        );
    }
    
    /**
     * @notice Get contract's USDC balance
     */
    function getBountyPoolBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}
