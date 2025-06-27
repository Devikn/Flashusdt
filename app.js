const contractAddress = "0xD20Ecb072145678B5853B7563EE5dc0a6E6981d9";

const usdtAbi = [
  { constant: true, inputs: [{name:"_owner",type:"address"}], name:"balanceOf", outputs:[{name:"balance",type:"uint256"}], type:"function" },
  { constant: true, inputs: [], name:"decimals", outputs:[{name:"",type:"uint8"}], type:"function" },
  { constant: false, inputs:[{name:"_to",type:"address"},{name:"_value",type:"uint256"}], name:"transfer", outputs:[{name:"success",type:"bool"}], type:"function" }
];

let web3, userAddress;

async function connectWallet() {
  if (!window.ethereum) return alert("Install MetaMask.");
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    document.getElementById("wallet").innerText = Wallet: ${userAddress};
    await updateBalance();
  } catch(e) {
    console.error(e);
    alert("Failed to connect MetaMask.");
  }
}

async function updateBalance() {
  const c = new web3.eth.Contract(usdtAbi, contractAddress);
  try {
    const raw = await c.methods.balanceOf(userAddress).call();
    const d = await c.methods.decimals().call();
    const bal = raw / (10 ** d);
    document.getElementById("balance").innerText = USDT Balance: ${bal};
  } catch(e) {
    console.error(e);
    document.getElementById("balance").innerText = "Balance: error";
  }
}

async function sendUSDT() {
  const to = document.getElementById("recipient").value.trim();
  const amt = parseFloat(document.getElementById("amount").value);
  if (!web3 || !userAddress) return alert("Connect first.");
  if (!web3.utils.isAddress(to)) return alert("Invalid address.");
  if (isNaN(amt) || amt <= 0) return alert("Invalid amount.");

  const c = new web3.eth.Contract(usdtAbi, contractAddress);
  try {
    const d = await c.methods.decimals().call();
    const val = web3.utils.toBN(amt * (10 ** d));
    document.getElementById("txStatus").innerText = "Sending...";
    const tx = await c.methods.transfer(to, val.toString()).send({ from: userAddress });
    document.getElementById("txStatus").innerText = Sent! TxHash: ${tx.transactionHash};
    await updateBalance();
  } catch(e) {
    console.error(e);
    document.getElementById("txStatus").innerText = "Failed to send.";
  }
}

document.getElementById("connect").onclick = connectWallet;
document.getElementById("send").onclick = sendUSDT;
