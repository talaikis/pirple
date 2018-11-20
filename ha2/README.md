# HA2

## How to use

See all API routes with example call objects below or use Postman collection.

Example path:

1. User registers. `POST /users`
2. User confirms his primary username method (email or phone). `POST /confirm`
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
* Benchmark everything
* Security checks and static analyses
* Live email tests (due to sandbox not working)
* Encrypt user data.
* Move all secrets to environment.

### Uptime bot

* Check urls globally if same url is on different users tables

### Delivery

* Implement quantities to order items
* Change charging and unfinsihed orders to worker

### Main system

* Unconfirmed (secondary) method confirm path
* Phone/ email change - should also change all joined data points
* MOve everything under POST and action pattern
* Ability to easily change first confirm method (finalize remaining)
* Finalize JWT
* More logs

## Features

* No external runtime dependencies

## Run

```bash
npm i
npm run start
```

## Debug

```bash
npm i
npm run start:debug
```

## System requirements

* Passwords > 12 chars

## Routes

### Tokens

Login.

```json
// POST /tokens
{
    "phone": "37061415694",
    "password": "testpassword369"
}
```

Get token information.

```json
// GET /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6"
}
```

Extend token expiration.

```json
// PUT /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6",
    "extend": true
}
```

Logout.

```json
// DELETE /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6"
}
```

### Users

Register

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
```

Get user data.

```json
// GET /users
// needs auth token

{
  "phone": "37061415694"
}
```

Edit user data.

```json
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
```

Delete user.

```json
// DELETE /users
// needs auth token

{
    "phone": "37061415694"
}
```

### URLS

Create new url.

```json
// POST /urls
{
    "protocol": "https",
    "url": "google.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5
}
```

Get url data.

```json
// GET /urls
// needs auth token
{
  "phone": "37061415694",
  "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
}
```

Edit url.

```json
// PUT /urls
// needs auth token
{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
    "protocol": "https",
    "url": "google2.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5,
    "phone": "37061415694"
}
```

Delete Url.

```json
// DELETE /urls
// needs auth token
{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
    "phone": "37061415694"
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

Referral sends invite.

```json
// POST /refer
// needs auth
{
    "action": "refer",
    "refEmail": "invited@test.com",
    "phone": "37061415694"
}
```

Referred user clicks.

```json
{
    "action": "use",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19"
}
```

Called after refrered user registration.

```json
{
    "action": "register",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19"
}
```

### Menu

Get menu.

```json
// POST /menu
// needs auth
{
    "action": "get",
    "phone": "37061415694"
}
```

Add to menu.

```json
// POST /menu
// needs auth and admin role
{
    "action": "add",
    "name": "Product",
    "price": 3.99
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
