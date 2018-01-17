var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList', (accounts) => {
  var chainListInstance,
    seller = accounts[1],
    buyer = accounts[2],
    articleName1 = "article 1",
    articleDescription1 = "Description for article 1",
    articlePrice1 = 10,
    articleName2 = "article 2",
    articleDescription2 = "Description for article 2",
    articlePrice2 = 10

    it('should throw an exception if you try to buy an article when there is no article for sale', ()=>{
      return ChainList.deployed()
        .then(instance=>{
          chainListInstance = instance
          return chainListInstance.buyArticle({
            from: buyer,
            value: web3.toWei(articlePrice, "ether")
          })
        })
        .then(assert.fail)
        .catch(err=>{
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
        .then(()=>{
          return chainListInstance.getArticle.call()
        })
        .then(data=>{
          assert.equal(data[0], 0x0, 'seller must be empty')
          assert.equal(data[1], 0x0, 'buyer must be empty')
          assert.equal(data[2], '', 'article name must be empty')
          assert.equal(data[3], '', 'description must be empty')
          assert.equal(+ data[4], 0, 'article price must be zero')
        })
    })

    it('should raise an exception if you try to buy your own article', ()=>{
      return ChainList.deployed()
        .then(instance=>{
          chainListInstance = instance
          return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"),{
            from: seller
          })
        })
        .then(receipt=>{
          return chainListInstance.buyArticle({
            from: seller,
            value: web3.toWei(articlePrice, "ether")
        })
        .then(assert.fail)
        .catch(err=>{
          assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
        })
        .then(()=>{
          return chainListInstance.getArticle.call()
        })
        .then(data=>{
          assert.equal(data[0], seller, 'seller must be ' + seller)
          assert.equal(data[1], 0x0, 'buyer must be empty')
          assert.equal(data[2], articleName, 'article name must be ' + articleName)
          assert.equal(data[3], articleDescription, 'description must be ' + articleDescription)
          assert.equal(+data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
        })
      })
    })

    it('should throw an exception when you try to buy for a price different than the listed price', ()=>{
      return ChainList.deployed()
      .then(instance=>{
        chainListInstance = instance
        return chainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(assert.fail)
      .catch(err=>{
        assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
      })
      .then(()=>{
        return chainListInstance.getArticle.call()
      })
      .then(data=>{
        assert.equal(data[0], seller, 'seller must be ' + seller)
        assert.equal(data[1], 0x0, 'buyer must be empty')
        assert.equal(data[2], articleName, 'article name must be ' + articleName)
        assert.equal(data[3], articleDescription, 'description must be ' + articleDescription)
        assert.equal(+data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
    })

    it('should throw an exception if you try to buy an item that has been already sold', ()=>{
      return ChainList.deployed()
      .then(instance=>{
        chainListInstance = instance
        return chainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(()=>{
        return chainListInstance.buyArticle({
          from: web3.eth.accounts[0],
          value: web3.toWei(articlePrice + 1, "ether")
        })
      })
      .then(assert.fail)
      .catch(err=>{
        assert(err.message.indexOf('revert') >= 0, 'error should be revert opcode')
      })
      .then(()=>{
        return chainListInstance.getArticle.call()
      })
      .then(data=>{
        assert.equal(data[0], seller, 'seller must be ' + seller)
        assert.equal(data[1], 0x0, 'buyer must be empty')
        assert.equal(data[2], articleName, 'article name must be ' + articleName)
        assert.equal(data[3], articleDescription, 'description must be ' + articleDescription)
        assert.equal(+data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
    })
})