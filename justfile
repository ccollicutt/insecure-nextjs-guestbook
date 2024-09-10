push:
    git add -A 
    git commit -m "update"
    git push

build:
    docker build -t insecure-guestbook .

docker-run:
    docker run --name insecure-guestbook -p 3002:3001 insecure-guestbook

run:
    npm run dev