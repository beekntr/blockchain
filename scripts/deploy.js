const hre = require("hardhat");

async function main() {
  console.log("Deploying EduGrant contract...");

  // Get the USDT contract address from environment variables
  const USDT_ADDRESS = process.env.USDT_ADDRESS;
  
  if (!USDT_ADDRESS) {
    throw new Error("USDT_ADDRESS not set in environment variables");
  }

  // Deploy the contract
  const EduGrant = await hre.ethers.getContractFactory("EduGrant");
  const eduGrant = await EduGrant.deploy(USDT_ADDRESS);

  await eduGrant.deployed();

  console.log("EduGrant deployed to:", eduGrant.address);

  // Wait for a few block confirmations
  await eduGrant.deployTransaction.wait(6);

  // Verify the contract on Polygonscan
  console.log("Verifying contract on Polygonscan...");
  try {
    await hre.run("verify:verify", {
      address: eduGrant.address,
      constructorArguments: [USDT_ADDRESS],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 