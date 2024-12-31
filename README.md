# News Aggregator Application

This project is a **News Aggregator Application** built using a full-stack architecture. The application consists of:

- A **frontend** powered by React, served via Nginx.
- A **backend** built with PHP (Laravel framework).
- A **MySQL database** for data storage.
- A **Meilisearch** instance for fast, relevant search results.

The application aggregates news from various sources, including **NewsAPI**, **New York Times**, and **The Guardian**. It may take a few minutes for the backend to fetch and process the data after starting.

---

## Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Getting Started

Follow the steps below to build and run the application.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/news-aggregator.git
cd news-aggregator
```

## 2. Configure Environment Variables
```bash
Ensure the `.env` file is present in the `news-aggregator` directory (the directory inside the main directory) with the following keys configured:
APP_KEY=your-laravel-app-key
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=news_aggregator
DB_USERNAME=root
DB_PASSWORD=25971
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=DQ3KpvVzIykfJo_Vr6xEnzmSiZISerJYbinlHwcliOA
```

To generate a new Laravel app key, use:
```bash
docker-compose run --rm backend php artisan key:generate
```

### 3. Build and Start the Application

Run the following command to build and start all services:
```bash
docker-compose up --build
```

### 4. Access the Application

After starting, the services will take some time to initialize. The backend service may take a few minutes to fetch data from NewsAPI, New York Times, and The Guardian.

Once ready, access the application at:

- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)  
- **Meilisearch Dashboard:** [http://localhost:7700](http://localhost:7700)

### Notes

- **Wait Time**: The backend will fetch data from external sources. This process might take a few minutes. You can monitor the backend's logs for updates.
- **Database Volume**: The MySQL database data is persisted in the `db_data` volume.
- **Frontend Dependency**: The frontend will wait for the backend to become healthy before starting.
