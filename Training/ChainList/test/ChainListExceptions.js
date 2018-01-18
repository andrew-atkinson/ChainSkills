var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList', (accounts) => {
  var chainListInstance,
    seller = accounts[1],
    buyer = accounts[2],
    articleId = 1,
    articleName = "article 1",
    articleDescription = "Description for article 1",
    articlePrice = 10

    it('should throw an exception if you try to get articles for sale when there is no article at all', ()=>{
      return ChainList.deployed()
        .then(instance=>{
          chainListInstance = instance
          return chainListInstance.getArticlesForSale();
        })
        .then(assert.fail)
        .catch(err=>{
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
    })

    it('should throw an exception if you try to buy an article when there is no article for sale', ()=>{
      return ChainList.deployed()
        .then(instance=>{
          chainListInstance = instance
          return chainListInstance.buyArticle(articleId, {
            from: buyer,
            value: web3.toWei(articlePrice, "ether")
          })
        })
        .then(assert.fail)
        .catch(err=>{
          console.log(err.message)
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
        .then(()=>{
          return chainListInstance.getNumberOfArticles()
        })
        .then(data=>{
          assert.equal(data.toNumber(), 0, 'number of articles should be zero')
        })
    })

    it('should raise an exception if you try to buy an article that does not exist', ()=>{
      return ChainList.deployed()
        .then(instance=>{
          chainListInstance = instance
          return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"),{
            from: seller
          })
        })
        .then(receipt=>{
          return chainListInstance.buyArticle(2,{
            from: seller,
            value: web3.toWei(articlePrice, "ether")
        })
        .then(assert.fail)
        .catch(err=>{
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
        .then(()=>{
          return chainListInstance.articles(articleId)
        })
        .then(data=>{
          assert.equal(data[0], articleId, 'article ID must be ' + articleId)
          assert.equal(data[1], seller, 'seller must be ' + seller)
          assert.equal(data[2], 0x0, 'buyer must be empty')
          assert.equal(data[3], articleName, 'article name must be ' + articleName)
          assert.equal(data[4], articleDescription, 'description must be ' + articleDescription)
          assert.equal(+data[5], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
        })
      })
    })

    it('should raise an exception if you try to buy your own article', ()=>{
      return ChainList.deployed()
        .then(receipt=>{
          return chainListInstance.buyArticle(articleId,{
            from: seller,
            value: web3.toWei(articlePrice, "ether")
        })
        .then(assert.fail)
        .catch(err=>{
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
        .then(()=>{
          return chainListInstance.articles(articleId)
        })
        .then(data=>{
          assert.equal(data[0], articleId, 'article ID must be ' + articleId)
          assert.equal(data[1], seller, 'seller must be ' + seller)
          assert.equal(data[2], 0x0, 'buyer must be empty')
          assert.equal(data[3], articleName, 'article name must be ' + articleName)
          assert.equal(data[4], articleDescription, 'description must be ' + articleDescription)
          assert.equal(+data[5], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
        })
      })
    })

    it('should throw an exception when you try to buy for a price different than the listed price', ()=>{
      return ChainList.deployed()
      .then(instance=>{
        chainListInstance = instance
        return chainListInstance.buyArticle(articleId, {
          from: buyer,
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(assert.fail)
      .catch(err=>{
        assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
      })
      .then(()=>{
        return chainListInstance.articles(articleId)
      })
      .then(data=>{
        assert.equal(data[0], articleId, 'article ID must be ' + articleId)
        assert.equal(data[1], seller, 'seller must be ' + seller)
        assert.equal(data[2], 0x0, 'buyer must be empty')
        assert.equal(data[3], articleName, 'article name must be ' + articleName)
        assert.equal(data[4], articleDescription, 'description must be ' + articleDescription)
        assert.equal(+data[5], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
    })

    it('should throw an exception if you try to buy an item that has been already sold', ()=>{
      return ChainList.deployed()
      .then(instance=>{
        chainListInstance = instance
        return chainListInstance.buyArticle(articleId, {
          from: buyer,
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(()=>{
        return chainListInstance.buyArticle(articleId, {
          from: web3.eth.accounts[0],
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(assert.fail)
      .catch(err=>{
        assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
      })
      .then(()=>{
        return chainListInstance.articles(articleId)
      })
      .then(data=>{
        assert.equal(data[0], articleId, 'article ID must be ' + articleId)
        assert.equal(data[1], seller, 'seller must be ' + seller)
        assert.equal(data[2], 0x0, 'buyer must be empty')
        assert.equal(data[3], articleName, 'article name must be ' + articleName)
        assert.equal(data[4], articleDescription, 'description must be ' + articleDescription)
        assert.equal(+data[5], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
    })
})