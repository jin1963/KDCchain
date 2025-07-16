
let web3;
let userAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask or Bitget Wallet");
  }
});

document.getElementById("connectWallet").onclick = async () => {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAccount = accounts[0];
    document.getElementById("walletAddress").innerText = userAccount;
    getBalances();
  } catch (error) {
    console.error(error);
  }
};

async function getBalances() {
  for (const [key, token] of Object.entries(tokenContracts)) {
    const contract = new web3.eth.Contract([
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function"
      }
    ], token.address);

    const balance = await contract.methods.balanceOf(userAccount).call();
    const formatted = (balance / 10 ** token.decimals).toFixed(4);
    document.querySelector(`#${key.toLowerCase()} .balance`).innerText = formatted;
  }
}

async function addToken(symbol) {
  const token = tokenContracts[symbol];
  if (!token) return alert("Token not found.");

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: symbol,
          decimals: token.decimals,
          image: `https://jin1963.github.io/KDCwallet/${symbol.toLowerCase()}.png`,
        },
      },
    });

    if (wasAdded) {
      alert(`${symbol} has been added to your wallet!`);
    } else {
      alert(`User rejected adding ${symbol}`);
    }
  } catch (error) {
    console.error(error);
    alert("Add Token not supported in this wallet.");
  }
}
