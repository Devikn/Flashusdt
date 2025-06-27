const contractAddress = "0xD20Ecb072145678B5853B7563EE5dc0a6E6981d9";

const usdtAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)"
];

let provider;
let signer;
let userAddress;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is required. Please install it.");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("wallet").innerText = Wallet: ${userAddress};
    await updateBalance();
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet.");
  }
}

async function updateBalance() {
  try {
    const contract = new ethers.Contract(contractAddress, usdtAbi, provider);
    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();

    const adjustedBalance = Number(ethers.utils.formatUnits(rawBalance, decimals));
    document.getElementById("balance").innerText = USDT Balance: ${adjustedBalance};
  } catch (err) {
    console.error(err);
    document.getElementById("balance").innerText = "USDT Balance: Error";
  }
}

async function sendUSDT() {
  const recipient = document.getElementById("recipient").value.trim();
  const amount = document.getElementById("amount").value;

  if (!provider || !signer || !userAddress) {
    alert("Please connect your wallet first.");
    return;
  }
  if (!ethers.utils.isAddress(recipient)) {
    alert("Invalid recipient address.");
    return;
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    alert("Enter a valid amount.");
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddress, usdtAbi, signer);
    const decimals = await contract.decimals();

    const amountParsed = ethers.utils.parseUnits(amount, decimals);

    document.getElementById("txStatus").innerText = "Sending transaction...";

    const tx = await contract.transfer(recipient, amountParsed);
    await tx.wait();

    document.getElementById("txStatus").innerText = Transaction successful! TxHash: ${tx.hash};

    await updateBalance();
  } catch (err) {
    console.error(err);
    document.getElementById("txStatus").innerText = "Transaction failed.";
  }
}

document.getElementById("connect").onclick = connectWallet;
document.getElementById("send").onclick = sendUSDT;
