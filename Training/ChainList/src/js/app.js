App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: () => {
    return App.initWeb3();
  },

  initWeb3: () => {
    // init web3 and set provider to testrpc
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

  displayAccountInfo: () => {
    web3.eth.getCoinbase((err, account) => {
        if (err === null) {
          App.account = account
          $("#account").text(account)
          web3.eth.getBalance(account, (err, balance) => {
              if (err === null) {
                $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH")
              }
            })
        }
      })
  },

  initContract: () => {
    $.getJSON('ChainList.json', chainListArtifact => {
        App.contracts.ChainList = TruffleContract(chainListArtifact)
        App.contracts.ChainList.setProvider(App.web3Provider)
        App.listenToEvents()
        return App.reloadArticles()
      })
  },

  reloadArticles: () => {
    if (App.loading) return;
    App.loading = true;
    
    App.displayAccountInfo()
    
    var chainListInstance;
    
    App.contracts.ChainList.deployed()
    .then(instance => {
      chainListInstance = instance
      return chainListInstance.getArticlesForSale()
    })
    .then(articleIds => {
      // retrieve and empty the articlesRow placeholder
      var articlesRow = $('#articlesRow')
      articlesRow.empty()
      
      for (var i = 0; i < articleIds.length; i++) {
        var articleId = articleIds[i]
        chainListInstance.articles(+articleId)
        .then(article=>{
            App.displayArticle(
              article[0],
              article[1],
              article[3],
              article[4],
              article[5]
            )
          })
        }
        App.loading = false
      })
      .catch(err => {
        App.loading = false
      })
    },
  
  displayArticle: (id, seller, name, description, price) => {
    var articlesRow = $('#articlesRow')
    var etherPrice = web3.fromWei(price, 'ether') // and converts to number from BigNumber

    // retrieve and fill the article template
    var articleTemplate = $('#articleTemplate')
    articleTemplate.find('.panel-title').text(name)
    articleTemplate.find('.article-description').text(description)
    articleTemplate.find('.article-price').text(etherPrice + " ETH")
    articleTemplate.find('.btn-buy').attr('data-id', id) //coerces id to number 
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice)

    //  if user == seller, hide buy button 
    if (seller == App.account){
      articleTemplate.find('.article-seller').text("You")
      articleTemplate.find('.btn-buy').hide()
    } else {
      articleTemplate.find('.article-seller').text(seller)
      articleTemplate.find('.btn-buy').show()
    }

    // append the new article
    articlesRow.append(articleTemplate.html())
  },

  sellArticle: () => {
    var _article_name = $('#article_name').val()
    var _description =  $('#article_description').val()
    var _price =  web3.toWei(parseFloat($('#article_price').val() || 0), "ether")

    if ((_article_name.trim() === '') || (_price === 0)) return false

    App.contracts.ChainList.deployed()
      .then(instance => {
        return instance.sellArticle(_article_name, _description, _price, {from:App.account, gas: 500000})
      })
      .catch(err => {
        console.error(err)
      })
  },

  // Listen for events raised from the contract
  listenToEvents: () => {
    App.contracts.ChainList.deployed()
    .then(instance => {
      instance.SellArticleEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      })
      .watch((error, event) => {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.BuyArticleEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      })
      .watch((error, event) => {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  },

  buyArticle: () => {
    event.preventDefault()

    var _articleId = $(event.target).data('id')
    var _price = parseFloat($(event.target).data('value'))

    App.contracts.ChainList.deployed()
    .then(instance => {
      return instance.buyArticle(_articleId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      })
    })
    .catch(err => {
      console.log(err)
    })
  }
}

$(() => {
  $(window).load(() => {
      App.init()
    })
})
