# Todo API

## Skeleton

api/
├── docker-compose.yml
├── ecosystem.config.js
├── .env
├── Dockerfile
├── src/
│   ├── index.js
│   ├── routes/
│   │   └── todos.js
│   ├── controllers/
│   │   └── todo.controller.js
│   ├── models/
│   │   └── todo.model.js
│   ├── middleware/
│   │   ├── compression.js
│   │   ├── rateLimiter.js
│   │   ├── validateSchema.js
│   │   ├── idempotency.js
│   │   └── otel.js
│   └── services/
│       └── queue.service.js
├── prometheus/
│   └── prometheus.yml
├── grafana/
│   └── dashboards.json
├── k6/
│   └── load.test.js
├── package.json
└── README.md

## Commands

### Start project

```bash
docker-compose up -d --build
```

### Stop project

```bash
docker-compose down
```

### Run tests

```bash
docker compose run --rm k6
```

### API Documentation

- http://localhost:3000/todos
 Pour la liste des todos

- http://localhost:3000/todos/:id
 Pour un todo spécifique

 etc

### Grafana

- http://localhost:3001
 Pour accéder à Grafana

### Execution du test de charge avec k6 et exporter les résultats au format JSON

``` bash
docker compose run --rm -v "$(pwd)
/results:/output" k6 run /scripts/load.test.js --summary-export=/output/results-baseline.json
```
## Liste des optimisations

| Ordre | Optimisation technique                                               | Action-clef                                                   |
| ----- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1     | **Index SQL** sur la colonne `title` (et éventuellement `created_at`) | `CREATE INDEX …` + vérifier `EXPLAIN QUERY PLAN`              |
| 2     | **Compression HTTP (gzip)**                                          | Middleware `compression` + variable `ENABLE_COMPRESSION=true` |
| 3     | **Cache Redis** avec invalidation                                    | `SETEX todos …` côté lecture ; `DEL todos` côté écriture      |
| 4     | **Cluster PM2** (scaling CPU)                                        | `WORKERS=0` → PM2 spawn N processus                           |



## tableau Avant/Après

| Étape de test                      | p95 (ms)      |
| ---------------------------------- | ------------- |
| **Baseline** (aucune optimisation) | **4,05**      |
| + Index SQL                        | **4,12**      |
| + Compression gzip                 | **3,20** |
| + Cache Redis                      | **1,80** |
| + Cluster PM2                      | **1,10** |