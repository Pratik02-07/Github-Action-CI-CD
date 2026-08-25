
# Github Actions CI/CD

docker build -t api .

docker run -t --rm -p 8080:8080 api

curl http://localhost:8080


docker compose up -d

docker compose down