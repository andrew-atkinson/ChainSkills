App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    /* init web3 and set provider to testrpc */
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      // set the provider from web3 provider
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
      web3 = new Web3(App.web3Provider)
    }
    App.displayAccountInfo()
    return App.initContract()
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account
        $("#account").text(account)
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    })
  },

  initContract: function () {
    $.getJSON('ChainList.json', function (chainListArtifact) {
        App.contracts.ChainList = TruffleContract(chainListArtifact)
        App.contracts.ChainList.setProvider(App.web3Provider)
    })
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
