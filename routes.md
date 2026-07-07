# Backend REST API Routes

> **Stack:** JAX-RS (Jersey) + Grizzly embedded HTTP server + Jackson JSON  
> **Base URL:** `http://localhost:8080/api`  
> **CORS:** All origins allowed (`*`)

---

## Authentication & Authorization

All routes except `POST /api/auth/login` require an `Authorization: Bearer <token>`
header. Obtain a token from the login endpoint. A missing/invalid token yields
`401 Unauthorized`; a valid token without the required role yields `403 Forbidden`.

**Roles:** access is admin-vs-everyone-else. The role named exactly `Admin` is
privileged; every other role (e.g. `Member`) is treated as a regular user.
- **Admin** — full access to every endpoint (tickets, users, statuses, categories, priorities, roles).
- **Non-admin** — may read statuses/priorities/categories (for the ticket form), and manage
  tickets/comments, but **only their own tickets** (those they created). Cannot access
  user/role management or create/update/delete statuses, categories or priorities.

| Method | Route                | Description                                            | Access        |
| ------ | -------------------- | ----------------------------------------------------- | ------------- |
| `GET`  | `/api/auth/roles`    | List roles (so the signup form can offer a choice)    | Public        |
| `POST` | `/api/auth/register` | Self-signup; creates a user with the chosen role      | Public        |
| `POST` | `/api/auth/login`    | Log in with username/password, returns a token        | Public        |
| `POST` | `/api/auth/logout`   | Invalidate the current token                          | Any logged in |
| `GET`  | `/api/auth/me`       | Return the currently logged-in user                   | Any logged in |

**`POST /api/auth/register` request body:** (`roleId` optional — omit it to get the
default non-admin role, i.e. `Member`; supply it to pick a role such as `Admin`)
```json
{ "username": "jdoe", "password": "plaintext-password", "fullName": "John Doe", "email": "jdoe@example.com", "roleId": 2 }
```
Returns `201` with the same `{ token, user }` shape as login (the new account is
auto-logged-in). `409` if the username or email is already taken; `400` if a field is
missing or `roleId` is unknown.

> ⚠️ Registration accepts any `roleId`, so a user can self-register as `Admin`. This is
> intentional for this project but is not something you'd expose in production.

**`POST /api/auth/login` request body:**
```json
{ "username": "jdoe", "password": "plaintext-password" }
```

**`POST /api/auth/login` response body:**
```json
{ "token": "opaque-bearer-token", "user": { "userId": 1, "username": "jdoe", "role": { "roleName": "Admin" }, "...": "..." } }
```

---

## Tickets

> Non-admins only ever see/modify tickets they created; `GET` list is filtered to
> their own tickets, and reading/updating/deleting a foreign ticket returns `404`.
> On create, a non-admin's `creatorUserId`/`assigneeUserId` are ignored (creator is
> forced to the logged-in user). The `ticketNo` can only be set/changed by admins;
> for non-admins (or when an admin omits it) the next `TKT-####` is assigned by the
> system.

| Method   | Route                                              | Description                                           |
| -------- | -------------------------------------------------- | ----------------------------------------------------- |
| `GET`    | `/api/tickets`                                     | List all tickets                                      |
| `GET`    | `/api/tickets?creator={userId}`                    | Filter tickets by creator user ID                     |
| `GET`    | `/api/tickets?assignee={userId}`                   | Filter tickets by assignee user ID                    |
| `GET`    | `/api/tickets?status={statusName}`                 | Filter tickets by status name                         |
| `GET`    | `/api/tickets?priority={priorityName}`             | Filter tickets by priority name                       |
| `GET`    | `/api/tickets?category={categoryName}`             | Filter tickets by category name                       |
| `GET`    | `/api/tickets?assignee={userId}&status={name}`     | Filter by assignee and status combined                |
| `GET`    | `/api/tickets?assignee={id1}&assignee={id2}`       | Filter by multiple values of the same field (repeat the query param; works for `creator`, `assignee`, `status`, `priority`, `category`) |
| `GET`    | `/api/tickets/{id}`                                | Get a single ticket by ID                             |
| `GET`    | `/api/tickets/number/{ticketNo}`                   | Get a single ticket by its ticket number              |
| `GET`    | `/api/tickets/next-number`                         | Get the next suggested ticket number (format `TKT-####`) |
| `POST`   | `/api/tickets`                                     | Create a new ticket                                   |
| `PUT`    | `/api/tickets/{id}`                                | Update an existing ticket                             |
| `DELETE` | `/api/tickets/{id}`                                | Delete a ticket                                       |

**POST/PUT request body:**
```json
{
  "ticketNo": "TKT-0001",
  "creatorUserId": 1,
  "assigneeUserId": 2,
  "categoryId": 1,
  "priorityId": 1,
  "statusId": 1,
  "title": "Bug in login",
  "description": "Login fails when..."
}
```

`ticketNo` must match the format `TKT-####` (at least 4 digits) and must be
unique; otherwise the request is rejected with `400 Bad Request`. Use
`GET /api/tickets/next-number` to fetch a suggested next value.

---

## Users

> **Admin only.** All user endpoints require the Admin role.

| Method   | Route                            | Description                       |
| -------- | -------------------------------- | --------------------------------- |
| `GET`    | `/api/users`                     | List all users                    |
| `GET`    | `/api/users/{id}`                | Get user by ID                    |
| `GET`    | `/api/users/username/{username}` | Get user by username              |
| `POST`   | `/api/users`                     | Create a new user                 |
| `PUT`    | `/api/users/{id}`                | Update an existing user           |
| `DELETE` | `/api/users/{id}`                | Delete a user                     |

**POST/PUT request body:** (`password` is plain text; the server BCrypt-hashes it.
On update, omit/blank `password` to keep the current one.)
```json
{
  "username": "jdoe",
  "password": "plaintext-password",
  "fullName": "John Doe",
  "email": "jdoe@example.com",
  "roleId": 1
}
```

---

## Ticket Comments

| Method   | Route                                       | Description                           |
| -------- | ------------------------------------------- | ------------------------------------- |
| `GET`    | `/api/tickets/{ticketId}/comments`          | List all comments for a ticket        |
| `POST`   | `/api/tickets/{ticketId}/comments`          | Add a comment to a ticket             |
| `DELETE` | `/api/tickets/{ticketId}/comments/{commentId}` | Delete a comment                   |

The comment author is always the logged-in user (taken from the session), so it
is not part of the request body.

**POST request body:**
```json
{
  "commentText": "This has been resolved."
}
```

---

## Ticket Assignment History

| Method   | Route                                            | Description                               |
| -------- | ------------------------------------------------ | ----------------------------------------- |
| `GET`    | `/api/tickets/{ticketId}/assignment-history`     | Get full assignment history for a ticket  |

---

## Statuses

> `GET` endpoints: any logged-in user. `POST`/`PUT`/`DELETE`: Admin only.

| Method   | Route                          | Description                    |
| -------- | ------------------------------ | ------------------------------ |
| `GET`    | `/api/statuses`                | List all statuses              |
| `GET`    | `/api/statuses/{id}`           | Get status by ID               |
| `GET`    | `/api/statuses/name/{name}`    | Get status by name             |
| `POST`   | `/api/statuses`                | Create a new status            |
| `PUT`    | `/api/statuses/{id}`           | Update a status                |
| `DELETE` | `/api/statuses/{id}`           | Delete a status                |

**POST/PUT request body:**
```json
{
  "statusName": "In Progress",
  "sortOrder": 2,
  "isFinal": false,
  "isSystem": false,
  "isActive": true
}
```

---

## Categories

> `GET` endpoints: any logged-in user. `POST`/`PUT`/`DELETE`: Admin only.

| Method   | Route                          | Description                    |
| -------- | ------------------------------ | ------------------------------ |
| `GET`    | `/api/categories`              | List all categories            |
| `GET`    | `/api/categories/{id}`         | Get category by ID             |
| `POST`   | `/api/categories`              | Create a new category          |
| `PUT`    | `/api/categories/{id}`         | Update a category              |
| `DELETE` | `/api/categories/{id}`         | Delete a category              |

**POST/PUT request body:**
```json
{
  "categoryName": "Bug",
  "description": "Software defects",
  "isActive": true
}
```

---

## Priorities

> `GET` endpoints: any logged-in user. `POST`/`PUT`/`DELETE`: Admin only.

| Method   | Route                          | Description                    |
| -------- | ------------------------------ | ------------------------------ |
| `GET`    | `/api/priorities`              | List all priorities            |
| `GET`    | `/api/priorities/{id}`         | Get priority by ID             |
| `POST`   | `/api/priorities`              | Create a new priority          |
| `PUT`    | `/api/priorities/{id}`         | Update a priority              |
| `DELETE` | `/api/priorities/{id}`         | Delete a priority              |

**POST/PUT request body:**
```json
{
  "priorityName": "High",
  "sortOrder": 1
}
```

---

## Roles

> **Admin only.** All role endpoints require the Admin role.

| Method   | Route                          | Description                    |
| -------- | ------------------------------ | ------------------------------ |
| `GET`    | `/api/roles`                   | List all roles                 |
| `GET`    | `/api/roles/{id}`              | Get role by ID                 |
| `POST`   | `/api/roles`                   | Create a new role              |
| `PUT`    | `/api/roles/{id}`              | Update a role                  |
| `DELETE` | `/api/roles/{id}`              | Delete a role                  |

**POST/PUT request body:**
```json
{
  "roleName": "Admin"
}
```

---

## Response Format

All responses are JSON. Dates are serialized as ISO-8601 strings (e.g. `"2026-04-19T14:30:00"`).

**Success responses:**
- `200 OK` — entity returned in body
- `201 Created` — new entity returned in body
- `204 No Content` — successful deletion

**Error responses:**
- `404 Not Found` — entity does not exist
- `400 Bad Request` — invalid reference ID (e.g. role, status, priority not found), returned with `{"error": "..."}`
- `401 Unauthorized` — missing/invalid/expired bearer token
- `403 Forbidden` — authenticated but lacking the required role
