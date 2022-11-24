async function main() {

	const myAddress = '0x1d06989d5b0473F24AA9Db3db1cAdA6e6799C372';

	SwapperCF = await ethers.getContractFactory("Swapper");
	TokenCF = await ethers.getContractFactory("Token");

	AToken = await TokenCF.deploy("STA", "SwapperTokenA", myAddress);
	ATokenAddress = AToken.address;

	BToken = await TokenCF.deploy("STB", "SwapperTokenB", myAddress);
	BTokenAddress = BToken.address;

	swapper = await SwapperCF.deploy();
	swapperAddress = swapper.address;

	CTokenAddress = await swapper.CToken();

	console.log("Contract Swapper deployed to address:", swapperAddress);
	console.log("Contract AToken deployed to address:", ATokenAddress);
	console.log("Contract BToken deployed to address:", BTokenAddress);
	console.log("Contract CToken deployed to address:", CTokenAddress);

}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});