rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
git add . 
git commit -m "adds files to github pages"
git push