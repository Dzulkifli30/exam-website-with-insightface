# CBT Examination System

A Computer-Based Testing (CBT) system integrated with facial biometric monitoring to help detect potential identity similarities among examination participants.

This project uses a multi-container Docker architecture consisting of:

* **Frontend**: React + Vite + Nginx
* **Backend**: Laravel REST API
* **Database**: MySQL
* **Face Recognition Service**: FastAPI + InsightFace
* **Container Management**: Docker Compose

With Docker, the required application environments and dependencies are already configured inside containers. Users do not need to manually install PHP, Composer, Node.js, Python, MySQL, FastAPI, or InsightFace.

---

# Features

* Computer-Based Testing (CBT)
* User authentication
* Participant management
* Exam session and class management
* Question and answer management
* Participant data management
* Facial embedding extraction using InsightFace
* Facial similarity comparison using cosine similarity
* Detection of potential identity similarities between participants
* Laravel REST API
* Separate frontend and backend architecture
* Dockerized application environment

---

# System Architecture

The application consists of several Docker containers that communicate with each other through a Docker network.

```text
                    Browser
                       │
                       │ http://localhost:8080
                       ▼
              ┌─────────────────┐
              │ React + Nginx   │
              │    frontend     │
              └────────┬────────┘
                       │
                       │ /api
                       ▼
              ┌─────────────────┐
              │ Laravel API     │
              │     backend     │
              └──────┬─────┬────┘
                     │     │
              db:3306│     │ai:8001
                     │     │
                     ▼     ▼
              ┌─────────┐ ┌──────────────┐
              │  MySQL  │ │ FastAPI      │
              │   db    │ │ InsightFace  │
              └─────────┘ └──────────────┘
```

## Docker Services

| Service    | Technology            | Purpose                                    | Port            |
| ---------- | --------------------- | ------------------------------------------ | --------------- |
| `frontend` | React + Nginx         | Runs the web interface                     | `8080`          |
| `backend`  | Laravel               | Provides the REST API                      | `8000`          |
| `ai`       | FastAPI + InsightFace | Facial embedding and similarity processing | Internal `8001` |
| `db`       | MySQL 8               | Stores application data                    | Internal `3306` |

The MySQL and InsightFace services are not required to be exposed directly to the host machine because they are accessed internally through the Docker network.

---

# Requirements

## Software Requirements

The main requirement for running this project is:

### 1. Docker Desktop

Download and install Docker Desktop:

https://www.docker.com/products/docker-desktop/

Docker Desktop includes:

* Docker Engine
* Docker CLI
* Docker Compose

Therefore, you do **not** need to manually install:

* PHP
* Composer
* Node.js
* npm
* Python
* pip
* MySQL
* FastAPI
* InsightFace

### 2. Git

Git is only required if you want to clone the repository using the command line.

Download Git:

https://git-scm.com/downloads

> Git is not required if you download the repository as a ZIP file from GitHub.

---

# System Requirements

Recommended environment:

* Windows 10/11 64-bit
* macOS
* Linux
* A recent version of Docker Desktop with Docker Compose support

The default InsightFace configuration uses **CPU execution**, so an NVIDIA GPU is not required.

---

# Getting Started

## 1. Clone the Repository

Clone the repository using Git:

```bash
git clone https://github.com/USERNAME/REPOSITORY-NAME.git
```

Navigate to the project directory:

```bash
cd REPOSITORY-NAME
```

For example:

```bash
cd website-ujian
```

---

# 2. Start Docker Desktop

Open **Docker Desktop** and make sure the Docker Engine is running.

Verify the installation:

```bash
docker --version
```

Then check Docker Compose:

```bash
docker compose version
```

If both commands work successfully, Docker is ready.

---

# 3. Build and Start the Application

From the project root directory, run:

```bash
docker compose up -d --build
```

This command will:

1. Build the frontend image
2. Build the Laravel backend image
3. Build the FastAPI + InsightFace image
4. Start the MySQL database
5. Create the Docker network
6. Create required Docker volumes
7. Start all application services

The first build may take several minutes because Docker needs to download the required images and dependencies.

---

# 4. Check Container Status

Run:

```bash
docker compose ps
```

All services should be running.

Example:

```text
NAME              STATUS
cbt_frontend      Up
cbt_backend       Up
cbt_ai            Up
cbt_mysql         Up (healthy)
```

The actual container names may differ depending on the Compose project name.

---

# 5. Open the Website

Once all containers are running, open:

```text
http://localhost:8080
```

The CBT application should now be available in your browser.

---

# Backend API

The Laravel backend runs on:

```text
http://localhost:8000
```

API endpoints use the `/api` prefix.

For example:

```text
http://localhost:8000/api/login
```

However, the React frontend normally does not access the backend directly through `localhost:8000`.

Instead, the frontend uses:

```text
/api/
```

and Nginx forwards the request to the Laravel backend container.

---

# InsightFace Service

The facial recognition service runs internally on:

```text
ai:8001
```

Laravel accesses the AI service using:

```text
http://ai:8001
```

Available endpoints include:

```text
GET  /health
POST /embedding
POST /compare
POST /compare-embedding
```

The AI service is intended to be accessed internally by Laravel and does not need to be directly accessible from the browser.

---

# Database

The project uses MySQL 8 inside a Docker container.

Internal configuration:

```text
Host     : db
Port     : 3306
Database : cbt
Username : cbt
Password : cbt_password
```

Laravel connects to MySQL using:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=cbt
DB_USERNAME=cbt
DB_PASSWORD=cbt_password
```

## Database Persistence

MySQL data is stored in a Docker volume:

```text
mysql_data
```

This keeps database data persistent even when the containers are stopped or recreated.

> Do not use `docker compose down -v` unless you intentionally want to remove all Docker volumes and permanently delete the stored database data.

---

# Laravel Storage

Laravel uploaded files are stored using the Docker volume:

```text
laravel_storage
```

The backend container also creates the Laravel storage link automatically using:

```bash
php artisan storage:link
```

---

# InsightFace Model Storage

The InsightFace model is stored in a Docker volume:

```text
insightface_models
```

This prevents the model from being stored inside the Git repository.

The model is stored inside the container at:

```text
/root/.insightface
```

The first startup may take longer while the `buffalo_l` model is prepared.

---

# Restarting the Application

If the project has already been built, start the containers with:

```bash
docker compose up -d
```

Then open:

```text
http://localhost:8080
```

---

# Stopping the Application

To stop the containers:

```bash
docker compose stop
```

To start them again:

```bash
docker compose start
```

---

# Removing Containers

To stop and remove the containers:

```bash
docker compose down
```

This does **not** remove the Docker volumes, so the database and stored files remain available.

The application can be started again using:

```bash
docker compose up -d
```

---

# Rebuilding the Application

If you modify the source code or Docker configuration and need to rebuild the images:

```bash
docker compose up -d --build
```

To perform a complete rebuild without using Docker's build cache:

```bash
docker compose build --no-cache
```

Then start the application:

```bash
docker compose up -d
```

---

# Viewing Logs

To view logs from all services:

```bash
docker compose logs -f
```

Laravel logs:

```bash
docker compose logs -f backend
```

Frontend/Nginx logs:

```bash
docker compose logs -f frontend
```

InsightFace logs:

```bash
docker compose logs -f ai
```

MySQL logs:

```bash
docker compose logs -f db
```

---

# Laravel Artisan Commands

Laravel Artisan commands can be executed inside the backend container.

Check Laravel information:

```bash
docker compose exec backend php artisan about
```

Check migration status:

```bash
docker compose exec backend php artisan migrate:status
```

Run migrations:

```bash
docker compose exec backend php artisan migrate
```

Run database seeders:

```bash
docker compose exec backend php artisan db:seed
```

Clear Laravel caches:

```bash
docker compose exec backend php artisan optimize:clear
```

---

# Troubleshooting

## 1. Port 3306 Is Already in Use

If you see an error such as:

```text
listen tcp 0.0.0.0:3306:
bind: Only one usage of each socket address
```

another application is already using port `3306`, commonly a local MySQL installation such as Laragon or XAMPP.

The Docker MySQL service does not need to expose port `3306` to the host.

Laravel accesses the database internally using:

```text
db:3306
```

Make sure the MySQL service does not contain:

```yaml
ports:
  - "3306:3306"
```

---

## 2. Frontend Build Fails

If an error appears such as:

```text
Could not resolve "./pages/..."
```

check the file path and filename capitalization.

For example:

```text
DetailPeserta.jsx
```

is different from:

```text
Detailpeserta.jsx
```

Linux, which is used by Docker containers, is case-sensitive.

---

## 3. Laravel Cannot Connect to MySQL

Make sure Laravel uses:

```env
DB_HOST=db
DB_PORT=3306
```

Do not use:

```env
DB_HOST=localhost
```

because Laravel and MySQL are running in separate containers.

---

## 4. Laravel Cannot Connect to InsightFace

Make sure Laravel uses:

```env
INSIGHTFACE_URL=http://ai:8001
```

Do not use:

```env
INSIGHTFACE_URL=http://localhost:8001
```

Inside the Laravel container, `localhost` refers to the Laravel container itself.

---

## 5. Check Laravel → MySQL Connection

Run:

```bash
docker compose exec backend php artisan migrate:status
```

If Laravel can read the migration status successfully, the database connection is working.

---

## 6. Check InsightFace

View the AI service logs:

```bash
docker compose logs --tail=100 ai
```

If the AI service is exposed for development/debugging, its health endpoint can be tested at:

```text
http://localhost:8001/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "insightface"
}
```

---

# Project Structure

```text
website-ujian/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
│
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── artisan
│   ├── composer.json
│   ├── composer.lock
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── .dockerignore
│
├── ai/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# Technologies

## Frontend

* React
* Vite
* Axios
* Nginx

## Backend

* Laravel
* Laravel Sanctum
* PHP
* REST API

## Database

* MySQL 8

## Face Recognition

* Python
* FastAPI
* InsightFace
* ArcFace
* ONNX Runtime
* OpenCV
* NumPy

## Containerization

* Docker
* Docker Compose

---

# Face Recognition Configuration

The AI service uses InsightFace with the `buffalo_l` model and CPU execution:

```python
FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)
```

The model is prepared using:

```python
face_app.prepare(
    ctx_id=-1,
    det_size=(640, 640)
)
```

Facial similarity is calculated using cosine similarity.

## API Endpoints

### Extract Face Embedding

```http
POST /embedding
```

Accepts a single image and returns its face embedding.

### Compare Two Images

```http
POST /compare
```

Extracts embeddings from two images and calculates their cosine similarity.

### Compare Two Embeddings

```http
POST /compare-embedding
```

Compares two existing face embeddings without uploading the original images again.

---

# Security Notes

Do not commit sensitive information to the repository, including:

```text
.env
API keys
Passwords
Production database
Real participant data
Real participant photographs
Biometric embeddings
Private credentials
```

Use demo or authorized data when sharing the project publicly on GitHub.

---

# InsightFace License and Model Usage

This project uses the InsightFace library and the `buffalo_l` pretrained model.

Please review the applicable InsightFace and pretrained model licensing terms before distributing or using the project for commercial purposes.

---

# Quick Start

For users who only want to run the project:

```bash
git clone https://github.com/USERNAME/REPOSITORY-NAME.git
cd REPOSITORY-NAME
docker compose up -d --build
```

Then open:

```text
http://localhost:8080
```

That's it.

You do **not** need to manually install:

```text
PHP
Composer
Node.js
npm
Python
pip
MySQL
FastAPI
InsightFace
```

These dependencies are already configured inside the Docker containers.

---

# Developer

This project is developed using a separated frontend, backend, database, and artificial intelligence service architecture to support a computer-based examination system with facial biometric monitoring.
