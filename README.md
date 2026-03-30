# n8n-nodes-solvapay

This is an n8n community node. It lets you use [SolvaPay](https://solvapay.com) in your n8n workflows.

SolvaPay is a payments-as-a-service platform for managing customers, products, plans, subscriptions, usage-based billing, and checkout sessions through a single API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Customer

| Operation | Description |
|-----------|-------------|
| Create | Create a new customer |
| Create Portal Session | Create a hosted billing portal session for a customer |
| Ensure Customer | Create a customer if they do not exist, or return the existing one |
| Get | Get a customer by reference |

### Product

| Operation | Description |
|-----------|-------------|
| Create | Create a new product |
| Delete | Delete a product |
| Get | Get a product by reference |
| List | List all products |
| Update | Update a product |

### Plan

| Operation | Description |
|-----------|-------------|
| Create | Create a new plan under a product |
| Delete | Delete a plan |
| Get | Get a plan by reference |
| List for Product | List all plans under a product |
| Update | Update a plan |

### Checkout

| Operation | Description |
|-----------|-------------|
| Create | Create a checkout session |

### Purchase

| Operation | Description |
|-----------|-------------|
| Cancel | Cancel a purchase |
| Get | Get a purchase by ID |
| List | List all purchases |
| List by Customer | List purchases for a customer |
| List by Product | List purchases for a product |

### Usage

| Operation | Description |
|-----------|-------------|
| Check Limits | Check usage limits for a customer and product |
| Record | Record a single usage event |
| Record Bulk | Record multiple usage events |

### SolvaPay Trigger

Starts the workflow when a SolvaPay event occurs (e.g. purchase completed, payment received, usage limit reached). Uses webhook-based event delivery with optional HMAC signature verification.

## Credentials

To authenticate with SolvaPay you need an **API Key**.

1. Log in to the [SolvaPay Dashboard](https://app.solvapay.com).
2. Navigate to **Settings > API Keys**.
3. Copy your secret key (starts with `sk_`).
4. In n8n, create a new **SolvaPay API** credential and paste the key.

Optionally, to verify webhook signatures on the SolvaPay Trigger node:

1. In the SolvaPay Dashboard, go to **Settings > Webhooks**.
2. Copy the **Webhook Secret**.
3. Paste it into the **Webhook Secret** field of your SolvaPay API credential in n8n.

## Compatibility

- Tested with n8n >= 1.0.0
- Requires Node.js >= 22

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [SolvaPay documentation](https://docs.solvapay.com)
- [SolvaPay API reference](https://docs.solvapay.com/api)
