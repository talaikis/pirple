# HA2

## How to use

See all API routes with example call objects below or use Postman collection.

Example path:

1. User registers. `POST /users`
2. User confirms his primary method (email or phone). `POST /confirm`
3. User logins (generates token). `POST /tokens`
4. User gets menu. `POST /menu`
5. User adds/ edits items to cart. `POST /orders`
6. User checkouts. `POST /orders`
7. User can check his order history. `POST /orders`
8. User logouts (deletes token). `DELETE /tokens`

There are many other unrelated to this exact project routes and configs.

## TODO

### Improvements

* Faster json (pickle?), benchmark before
* Check urls globally if same url is on different users tables
* Benchmark everything
* Security checks and static analyses
* Unconfirmed (secondary) method confirm path
* Phone change - should also change all joined data points
* MOve everything under POST and action pattern
* Ability to easily change first confirm methd
* Finalize JWT
* More logs
* Live email tests (due to sandbox not working)
* Be able to login after confirmation only
* Add to menu/ product API endpoint
* Collect all endpoints into one, POST based
* Unfinished orders.delete worker
* Implement quantities to order items
* Delete orders on user deletion
* Change charging to worker
* Return full data on get_orders
* Add user.updatedAt at confirms, etc.
* Don't allow to login if unconfirmed
* Better (i.e. universal) JOINs.

## Features

* No external runtime dependencies

## Run

```bash
npm run start
```

## Debug

```bash
npm run start:debug
```

## System requirements

* Passwords > 12 chars

## Routes

### Tokens

```json
// POST /tokens

{
    "phone": "37061415694",
    "password": "testpassword369"
}

// GET /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6"
}

// PUT /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6",
    "extend": true
}

// DELETE /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6"
}
```

### Users

```json
// POST /users

{
    "phone": "37061415694",
    "firstName": "John",
    "lastName": "Doe",
    "email": "info@talaikis.com",
    "password": "testpassword369",
    "tosAgreement": true
}

// GET /users
// needs auth token

{
  "phone": "37061415694"
}

// PUT /users
// needs auth token

{
    "phone": "37061415694",
    "firstName": "John Renamed",
    "lastName": "Doe Renamed",
    "email": "info@test.com",
    "password": "testpassword369123",
    "tosAgreement": true
}

// DELETE /users
// needs auth token

{
    "phone": "37061415694"
}
```

### URLS

```json
// POST /urls

{
    "protocol": "https",
    "url": "google.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5
}

// GET /urls
// needs auth token

{
  "urlId": "37061415694"
}

// PUT /urls
// needs auth token

{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
    "protocol": "https",
    "url": "google2.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5
}

// DELETE /urls
// needs auth token

{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9"
}
```

### Password reset

```json
// POST /reset

{
    "phone": "37061415694"
}
```

### Confirms

```json
// POST /confirm

{
    "token": "fc8c0abeeb4448f9dc96f36b9b6a84a75330ac9adf82b6f197142c8aebbb0137"
}
```

### Refer

```json
// POST /refer
// action types: 'refer' (needs auth), 'use', 'register'

{
    "action": "refer",
    "refEmail": "invited@test.com",
    "phone": "37061415694"
}

{
    "action": "use",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19"
}

{
    "action": "register",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19",
    "phone": "37061415694"
}
```

### Menu

Get menu.

```json
// POST /menu
// needs auth

{
    "action": "get"
}
```

### Orders

Get products in cart.

```json
// POST /orders
// needs auth
{
    "action": "get_cart",
    "phone": "37061415694"
}
```

Get user's order history.

```json
// POST /orders
// needs auth
{
    "action": "get_orders",
    "phone": "37061415694",
}
```

Add / edit products to basket.

```json
// needs auth
{
    "action": "add_cart",
    "phone": "37061415694",
    "items": [0, 1, 2]
}
```

Clear cart.

```json
// needs auth
{
    "action": "delete_cart",
    "phone": "37061415694"
}
```

Buy / pay.

```json
// needs auth
{
    "action": "buy",
    "phone": "37061415694"    
}
```

Get user's order.

```json
// needs auth
{
    "action": "get_order",
    "phone": "37061415694",
    "orderId": "bd71c2bc-cdef-44a2-991d-ce25dbf307c8"
}
```
