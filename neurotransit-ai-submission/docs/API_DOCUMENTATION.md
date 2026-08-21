# API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Check service health |
| GET | `/intersections` | List intersections |
| GET | `/intersections/:id` | Read one intersection |
| POST | `/intersections/:id/traffic` | Submit vehicle count |
| GET | `/analytics/metrics` | Read current metrics |
| GET | `/analytics/history` | Read analytics history |
| POST | `/emergency/register` | Register an emergency vehicle |
| POST | `/emergency/:id/prioritize` | Establish an emergency corridor |
| POST | `/emergency/:id/clear` | Clear an emergency corridor |

Successful responses use `{ "success": true, "data": ... }`.