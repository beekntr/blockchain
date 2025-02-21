const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduGrant", function () {
  let EduGrant;
  let eduGrant;
  let owner;
  let student;
  let verifier;
  let mockUSDT;

  beforeEach(async function () {
    // Deploy mock USDT token
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    // Deploy EduGrant contract
    [owner, student, verifier] = await ethers.getSigners();
    EduGrant = await ethers.getContractFactory("EduGrant");
    eduGrant = await EduGrant.deploy(mockUSDT.address);
    await eduGrant.deployed();

    // Add verifier
    await eduGrant.addVerifier(verifier.address);
  });

  describe("Student Registration", function () {
    it("Should allow students to register", async function () {
      await eduGrant.connect(student).registerStudent(
        "John Doe",
        "STU123"
      );

      const studentData = await eduGrant.students(student.address);
      expect(studentData.name).to.equal("John Doe");
      expect(studentData.universityId).to.equal("STU123");
    });

    it("Should not allow duplicate registration", async function () {
      await eduGrant.connect(student).registerStudent(
        "John Doe",
        "STU123"
      );

      await expect(
        eduGrant.connect(student).registerStudent(
          "John Doe",
          "STU123"
        )
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Scholarship Creation", function () {
    it("Should allow owner to create scholarship", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      
      await eduGrant.createScholarship(
        "Test Scholarship",
        ethers.utils.parseEther("1000"),
        deadline,
        10
      );

      const scholarship = await eduGrant.scholarships(0);
      expect(scholarship.name).to.equal("Test Scholarship");
      expect(scholarship.maxRecipients).to.equal(10);
    });
  });

  describe("Document Submission", function () {
    it("Should allow registered students to submit documents", async function () {
      await eduGrant.connect(student).registerStudent(
        "John Doe",
        "STU123"
      );

      await eduGrant.connect(student).submitDocuments("QmTest123");

      const studentData = await eduGrant.students(student.address);
      expect(studentData.ipfsDocsHash).to.equal("QmTest123");
    });
  });
}); 