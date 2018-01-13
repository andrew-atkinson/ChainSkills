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

  displayAccountInfo: function () {
    web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account
          $("#account").text(account)
          web3.eth.getBalance(account, function (err, balance) {
              if (err === null) {
                $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH")
              }
            })
        }
      })
  },

  initContract: function () {
    $.getJSON('ChainList.json', function (chainListArtifact) {
        App.contracts.ChainList = TruffleContract(chainListArtifact)
        App.contracts.ChainList.setProvider(App.web3Provider)
        App.listenToEvents()
        return App.reloadArticles()
      })
  },

  reloadArticles: function () {
    App.displayAccountInfo()

    App.contracts.ChainList.deployed()
      .then(function (instance) {
        return instance.getArticle.call()
      })
      .then(function (article) {
        if (article[0] === 0x0) return; //i.e. there's no article
        
        // retrieve and empty the articlesRow placeholder
        var articlesRow = $('#articlesRow')
        articlesRow.empty()

        // retrieve and fill the article template
        var articleTemplate = $('#articleTemplate')
        articleTemplate.find('.panel-title').text(article[1])
        articleTemplate.find('.article-description').text(article[2])
        articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"))

        var seller = article[0];
        if (seller === App.account) seller = "You"

        articleTemplate.find('.article-seller').text(seller)
        articlesRow.append(articleTemplate.html())
      }).catch((err) => {
        console.log(err.message)
      })
    },

    sellArticle: function(){
      var _article_name = $('#article_name').val()
      var _description =  $('#article_description').val()
      var _price =  web3.toWei(parseInt($('#article_price').val() || 0), "ether")

      if ((_article_name.trim() === '') || (_price === 0)) return false

      App.contracts.ChainList.deployed()
        .then(function(instance){
          return instance.sellArticle(_article_name, _description, _price, {from:App.account, gas: 500000})
        })
        .then(function(result){

        })
        .catch(function(err){
          console.error(err)
        })
    },

    listenToEvents: function() {
      App.contracts.ChainList.deployed().then(function(instance) {
        instance.SellArticleEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(err, event) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>')
          App.reloadArticles();
        })
      })
    }
}

$(function () {
  $(window).load(function () {
      App.init()
    })
})
