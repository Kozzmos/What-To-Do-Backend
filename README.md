# What To Do Backend

### !!!THIS PROJECT WORKS TOGETHER WITH ITS FRONTEND PART!!! [HERE](https://github.com/Kozzmos/what-to-do-frontend)

## Overview

This is the backend API for the **What To Do** application.  
It provides RESTful endpoints to manage todo lists and their associated todos.

## Technologies

- Node.js  
- Express.js  
- PostgreSQL  
- pg (node-postgres) for database connection

## Setup

1. Make sure you have PostgreSQL installed and running.  
2. Create a database and run the following SQL to create necessary tables:

```sql
CREATE TABLE List (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  tags TEXT[],
  color VARCHAR(10)
);

CREATE TABLE Todo (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES List(id) ON DELETE CASCADE,
  text TEXT,
  status VARCHAR(20),
  active BOOLEAN
);
```

Create a .env file in the root folder with your database credentials, for example:
```
DATABASE_URL=postgresql://user:password@localhost:5432/yourdbname
PORT=3001
```
Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm run dev
```

Run the test cases:

```bash
npm run test
```

The server will be accessible at http://localhost:3001/api.

## API Endpoints

-Lists

- GET /api/lists - Get all lists
- POST /api/lists - Create a new list
- PUT /api/lists/:id - Update a list
- DELETE /api/lists/:id - Delete a list (cascades to delete todos)

-Todos

- GET /api/todos - Get all todos
- GET /api/todos?listId= - Get todos by list id
- POST /api/todos - Create a new todo
- PUT /api/todos/:id - Update a todo
- DELETE /api/todos/:id - Delete a todo

-Notes
- Deleting a list will delete all associated todos thanks to ON DELETE CASCADE.
- Error handling is implemented with appropriate HTTP status codes.


