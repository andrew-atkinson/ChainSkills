rsync -r src/ ../docs/
rsync build/contracts/ChainList.json ../docs/
git add . 
git commit -m "adds: frontend files to github pages"
git push