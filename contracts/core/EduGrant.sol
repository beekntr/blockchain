// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EduGrant is Ownable, ReentrancyGuard {
    struct Student {
        address walletAddress;
        string name;
        string universityId;
        string ipfsDocsHash;  // Hash of student documents on IPFS
        bool isVerified;
        uint256 scholarshipAmount;
        bool hasPendingScholarship;
    }
    
    struct Scholarship {
        string name;
        uint256 amount;
        uint256 deadline;
        bool isActive;
        uint256 maxRecipients;
        uint256 currentRecipients;
        mapping(address => bool) applicants;
    }

    mapping(address => Student) public students;
    mapping(uint256 => Scholarship) public scholarships;
    mapping(address => bool) public verifiers;
    
    uint256 public scholarshipCount;
    IERC20 public stablecoin;
    
    event StudentRegistered(address indexed studentAddress, string name);
    event ScholarshipCreated(uint256 indexed id, string name, uint256 amount);
    event ScholarshipAwarded(address indexed student, uint256 amount);
    event DocumentsSubmitted(address indexed student, string ipfsHash);
    event StudentVerified(address indexed student);

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized as verifier");
        _;
    }

    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
        verifiers[msg.sender] = true;
    }

    function registerStudent(string memory _name, string memory _universityId) external {
        require(students[msg.sender].walletAddress == address(0), "Already registered");
        
        students[msg.sender] = Student({
            walletAddress: msg.sender,
            name: _name,
            universityId: _universityId,
            ipfsDocsHash: "",
            isVerified: false,
            scholarshipAmount: 0,
            hasPendingScholarship: false
        });
        
        emit StudentRegistered(msg.sender, _name);
    }

    function submitDocuments(string memory _ipfsHash) external {
        require(students[msg.sender].walletAddress != address(0), "Student not registered");
        students[msg.sender].ipfsDocsHash = _ipfsHash;
        emit DocumentsSubmitted(msg.sender, _ipfsHash);
    }

    function verifyStudent(address _studentAddress) external onlyVerifier {
        require(students[_studentAddress].walletAddress != address(0), "Student not found");
        students[_studentAddress].isVerified = true;
        emit StudentVerified(_studentAddress);
    }

    function createScholarship(
        string memory _name,
        uint256 _amount,
        uint256 _deadline,
        uint256 _maxRecipients
    ) external onlyOwner {
        uint256 scholarshipId = scholarshipCount++;
        Scholarship storage newScholarship = scholarships[scholarshipId];
        newScholarship.name = _name;
        newScholarship.amount = _amount;
        newScholarship.deadline = _deadline;
        newScholarship.isActive = true;
        newScholarship.maxRecipients = _maxRecipients;
        newScholarship.currentRecipients = 0;
        
        emit ScholarshipCreated(scholarshipId, _name, _amount);
    }

    function applyForScholarship(uint256 _scholarshipId) external {
        require(students[msg.sender].isVerified, "Student not verified");
        require(!students[msg.sender].hasPendingScholarship, "Already has pending scholarship");
        require(scholarships[_scholarshipId].isActive, "Scholarship not active");
        require(block.timestamp < scholarships[_scholarshipId].deadline, "Deadline passed");
        require(!scholarships[_scholarshipId].applicants[msg.sender], "Already applied");
        
        scholarships[_scholarshipId].applicants[msg.sender] = true;
    }

    function awardScholarship(uint256 _scholarshipId, address _student) external onlyVerifier {
        Scholarship storage scholarship = scholarships[_scholarshipId];
        require(scholarship.isActive, "Scholarship not active");
        require(scholarship.applicants[_student], "Student did not apply");
        require(scholarship.currentRecipients < scholarship.maxRecipients, "Maximum recipients reached");
        
        uint256 amount = scholarship.amount;
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient funds");
        
        scholarship.currentRecipients++;
        students[_student].scholarshipAmount = amount;
        students[_student].hasPendingScholarship = true;
        
        stablecoin.transfer(_student, amount);
        emit ScholarshipAwarded(_student, amount);
    }
} 