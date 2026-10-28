# Reel Check

Search a movie and see its details plus IMDb, Rotten Tomatoes and Metacritic ratings.

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder.

## Deploy
Push this folder to a GitHub repo, then enable GitHub Pages (Settings > Pages > Deploy from branch > main, root).
Netlify and Vercel also work: drag the folder in, no build step needed.

## API key
Get a free key at https://www.omdbapi.com/apikey.aspx and paste it into the page.
It is stored in your browser's localStorage only. Do not commit the key to the repo.
