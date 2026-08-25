
# GitHub Actions CI/CD - Express App Deployment on AWS EC2

This project demonstrates a simple end-to-end CI/CD pipeline that deploys a Dockerized Express app to an AWS EC2 instance whenever code is pushed to the `main` branch.

## Tech Stack

- Node.js (Express)
- Docker
- Docker Compose
- GitHub Actions
- AWS EC2 (Ubuntu)

## Project Structure

- `.github/workflows/deploy.yml` - GitHub Actions workflow that deploys to EC2 over SSH.
- `index.js` - Express server source code.
- `Dockerfile` - Container image build instructions.
- `docker-compose.yml` - Service definition for deployment.
- `package.json` - Node.js dependencies and scripts.

## How the CI/CD Works

1. You push code to `main`.
2. GitHub Actions workflow runs.
3. Workflow connects to EC2 using SSH (appleboy/ssh-action).
4. On EC2, it pulls latest code and runs:
	- `sudo docker compose up -d --build`
5. Docker rebuilds and restarts the app container.
6. App is available on port `8080`.

## Architecture Diagram

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 100, "rankSpacing": 130}, "themeVariables": {"fontSize": "30px"}}}%%
flowchart LR
	DEV[Developer Machine] -->|git push main| REPO[GitHub Repository]
	REPO -->|trigger workflow| CI[GitHub Actions Runner]
	CI -->|SSH with EC2_SSH_KEY| EC2[AWS EC2 Instance]
	EC2 -->|docker compose up -d --build| COMPOSE[Docker Compose]
	COMPOSE --> APP[Express Container]
	APP --> PORT[Port 8080]
	USER[Browser or curl client] -->|HTTP| PORT
```

Architecture summary:

1. Code push to main triggers GitHub Actions.
2. Runner uses SSH to connect to EC2.
3. EC2 pulls latest code and rebuilds the container with Docker Compose.
4. Express app is served publicly on port 8080.

### Visual Reference

<p align="center">
	<img src="1.png" alt="Github Action Deployment" width="1600" />
</p>

## Prerequisites

Before running this project, make sure you have:

- A GitHub repository with this code.
- An AWS EC2 Ubuntu instance.
- Security Group rule allowing inbound TCP traffic on port `8080`.
- Docker and Docker Compose plugin installed on EC2.
- SSH access to EC2 using a private key.

## Local Development and Testing

### Run with Docker

Build image:

`docker build -t "name" .`

Run container:

`docker run --rm -p 8080:8080 "name"`

Test API:

`curl http://localhost:8080`

### Run with Docker Compose

Start services:

`docker compose up -d --build`

Stop services:

`docker compose down`

## EC2 Setup Steps

Run these on your EC2 instance:

1. Install Docker and Compose plugin
	- `sudo apt update`
	- `sudo apt install -y docker.io docker-compose-plugin`
2. Enable and start Docker
	- `sudo systemctl enable docker`
	- `sudo systemctl start docker`
3. Clone your repository
	- `git clone https://github.com/Pratik02-07/Github-Action-CI-CD.git`
4. Move into project folder
	- `cd Github-Action-CI-CD`

## Generate SSH Key for CI/CD

Run this on your local machine:

`ssh-keygen -t rsa -b 4096 -C "ec2@name"`

It creates:

- Private key (example: `key`) -> Keep this secret.
- Public key (example: `key.pub`) -> Safe to share with server.

### Where to add this key

1. Add public `key.pub` key to EC2
	- SSH into EC2.
	- Append public key to `~/.ssh/authorized_keys` for your deploy user (`ubuntu` or `ec2-user`).
	- Set permissions:
		- `chmod 700 ~/.ssh`
		- `chmod 600 ~/.ssh/authorized_keys`

2. Add private key to GitHub Actions secret
	- Copy full private key content including:
		- `-----BEGIN OPENSSH PRIVATE KEY-----`
		- `-----END OPENSSH PRIVATE KEY-----`
	- Add it as repository secret named `EC2_SSH_KEY`.

3. Confirm other required secrets
	- `EC2_SERVER_IP`
	- `EC2_USER`
	- `EC2_SSH_KEY`

## GitHub Actions Workflow

Workflow file: `.github/workflows/deploy.yml`

Current deploy script on EC2:

- `cd /home/ubuntu/Github-Action-CI-CD`
- `git pull origin main`
- `sudo docker compose up -d --build`

## Required GitHub Secrets

Add these in repository settings:

- `EC2_SERVER_IP` - Public IP of your EC2 instance.
- `EC2_USER` - SSH user (for Ubuntu AMI, usually `ubuntu`, for Amazon Linux  AMI `ec2-user`).
- `EC2_SSH_KEY` - Private SSH key content.

Path:

GitHub Repository -> Settings -> Secrets and variables -> Actions -> New repository secret

## Verify Deployment

After workflow success, test:

`curl http://<EC2_PUBLIC_IP>:8080`

Expected response example:

`{"message":"Hello from the server v2:latest deployed!"}`

## Troubleshooting

If app is not reachable:

1. Check container status on EC2
	- `sudo docker compose ps`
2. Check logs
	- `sudo docker compose logs --tail=200`
3. Check if app port is listening
	- `sudo ss -tulnp | grep 8080`
4. Confirm EC2 Security Group allows inbound TCP `8080`.
5. Confirm your app is running and not crashing inside container.

If GitHub Action fails at deploy step:

1. Verify `EC2_SERVER_IP`, `EC2_USER`, `EC2_SSH_KEY` secrets.
2. Ensure the key matches the public key installed on EC2.
3. Ensure repository path on EC2 is correct:
	- `/home/ubuntu/Github-Action-CI-CD`

## Security Notes

- Never commit private keys to the repository.
- Rotate SSH keys immediately if a private key is exposed.
- Keep `private` and `private.pub` ignored in `.gitignore`.