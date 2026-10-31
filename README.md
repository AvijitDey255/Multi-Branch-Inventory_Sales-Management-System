# Multi-Branch Inventory & Sales Management System

## 📌 Project Overview

The **Multi-Branch Inventory & Sales Management System** is a centralized business management platform designed for companies that operate multiple branches.

The system manages:

* Company-level products and inventory
* Multiple branches
* Branch managers
* Salesmen
* Customers / Shopkeepers
* Product categories and variants
* Purchasing and selling prices
* Invoices
* Sales and purchase history
* Stock tracking
* Reports and business analytics

The system follows a **centralized inventory and sales flow**, where the company controls the main product inventory and branches/salesmen manage local sales operations.

---

# 🏢 Business Structure

```text
Company
│
├── Branch 1
│   ├── Branch Manager
│   ├── Salesman 1
│   ├── Salesman 2
│   └── Customers / Shopkeepers
│
├── Branch 2
│   ├── Branch Manager
│   ├── Salesman 1
│   ├── Salesman 2
│   └── Customers / Shopkeepers
│
└── Branch 3
    ├── Branch Manager
    ├── Salesman 1
    ├── Salesman 2
    └── Customers / Shopkeepers
```

The company can have **multiple branches**, and each branch can have multiple salesmen and customers.

---

# 👥 User Roles

## 1. Company / Super Admin

The company has complete control over the entire system.

### Responsibilities

* Manage branches
* Manage branch managers
* Manage global products
* Manage categories
* Manage product variants
* Set company-level product prices
* Transfer stock to branches
* Monitor branch performance
* View overall sales
* View inventory reports
* View salesman performance
* View customer activity
* Manage company settings

---

# 2. Branch Manager

Each branch has a manager who controls the operations of that branch.

### Product Management

The manager can:

* Add products
* Update products
* Delete products
* View products
* Search products
* Filter products
* Manage product categories
* Manage product variants
* Monitor branch stock

### Product Variants

Products may have different variants depending on the business.

Examples:

```text
Product: Rice

Variants:
├── 1 KG
├── 5 KG
├── 10 KG
└── 25 KG
```

Other possible variants:

* Pieces
* Units
* Weight
* Size
* Pack
* Color
* Model
* Volume

---

# 💰 Product Pricing Flow

The system supports multiple pricing levels.

Example:

```text
Company
   │
   │ Product Stock = 450
   │
   ▼
Branch Manager
   │
   │ Adds / receives 50 units
   │
   │ Company Price = ₹500
   ▼
Salesman
   │
   │ Adds Profit = ₹50
   │
   │ Selling Price = ₹550
   ▼
Shopkeeper / Customer
   │
   │ Purchases Product
   ▼
Invoice
```

### Example

Suppose the company has:

```text
Product: Product A
Available Stock: 450
Company Price: ₹500
```

The branch receives:

```text
Quantity: 50
Price: ₹500
```

The salesman decides to sell the product for:

```text
Company Price: ₹500
Salesman Profit: ₹50
Final Selling Price: ₹550
```

The shopkeeper purchases the product for:

```text
₹550
```

The system records the complete price history.

---

# 📦 Inventory Management

The inventory system keeps track of stock at different levels.

### Company Inventory

```text
Product A
Total Stock: 450
```

### Branch Inventory

```text
Branch Kolkata
Stock Received: 50
Sold: 20
Remaining: 30
```

### Salesman Inventory

If products are assigned directly to salesmen:

```text
Salesman: Rahul

Received: 20
Sold: 12
Remaining: 8
```

This makes it possible to track **where every product quantity is currently located**.

---

# 🔄 Stock Transfer

The company or branch manager can transfer products between inventory locations.

Example:

```text
Company Warehouse
       │
       │ 50 Units
       ▼
Kolkata Branch
       │
       │ 20 Units
       ▼
Salesman
```

Every transfer should create a transaction record.

### Stock Transfer Information

* Transfer ID
* Source
* Destination
* Product
* Variant
* Quantity
* Transfer date
* Created by
* Transfer status
* Notes

---

# 🧑‍💼 Salesman Management

Salesmen operate mainly through the mobile application.

### Salesman Features

* Login / logout
* View assigned products
* View available stock
* View product prices
* Set permitted selling price
* Add profit margin
* Create customer orders
* Create invoices
* View sales history
* View today's sales
* View monthly sales
* Track customer payments
* View customer purchase history
* Manage assigned customers
* Track outstanding payments

---

# 🏪 Customer / Shopkeeper

Customers are mainly shopkeepers who purchase products from salesmen.

### Customer Features

* Login
* View purchased products
* View purchase history
* View invoices
* Track orders
* Track delivery/order status
* View payment history
* View pending payments
* View total purchases
* View frequently purchased products

---

# 🧾 Invoice Management

The system generates invoices whenever a sale is completed.

### Invoice Information

```text
Invoice ID
Customer
Salesman
Branch
Product
Variant
Quantity
Unit Price
Discount
Tax
Total Amount
Payment Status
Payment Method
Invoice Date
```

Example:

```text
Invoice: INV-2026-00125

Customer:
ABC General Store

Salesman:
Rahul

Product:
Product A

Quantity:
10

Unit Price:
₹550

Subtotal:
₹5,500

Discount:
₹100

Total:
₹5,400

Payment:
Paid
```

---

# 📊 Sales & Reports

The system provides reports for different levels of the organization.

## Company Reports

* Total sales
* Total branches
* Total inventory
* Branch-wise sales
* Product-wise sales
* Salesman performance
* Customer activity
* Profit reports
* Stock reports

## Branch Reports

* Daily sales
* Weekly sales
* Monthly sales
* Current stock
* Low-stock products
* Salesman performance
* Customer purchases
* Pending payments

## Salesman Reports

* Today's sales
* Monthly sales
* Total orders
* Total customers
* Total profit
* Pending payments
* Best-selling products

---

# 📈 Dashboard

Each role receives a different dashboard.

### Company Dashboard

```text
Total Branches
Total Products
Total Stock
Today's Sales
Monthly Sales
Total Profit
Top Branch
Top Product
Top Salesman
```

### Manager Dashboard

```text
Branch Stock
Today's Sales
Monthly Sales
Active Salesmen
Total Customers
Low Stock
Pending Payments
```

### Salesman Dashboard

```text
Today's Sales
Today's Orders
Total Customers
Assigned Stock
Total Profit
Pending Payments
```

---

# 🔐 Role-Based Access Control

Different users should have different permissions.

```text
Company Admin
    │
    ├── Full System Access
    │
    ▼
Branch Manager
    │
    ├── Branch Access
    │
    ▼
Salesman
    │
    ├── Assigned Customer & Product Access
    │
    ▼
Customer / Shopkeeper
    │
    └── Own Orders & Purchase History
```

A salesman should **not** be able to access another branch's data.

A customer should **only** see their own information.

---

# 📱 Application Architecture

The project will use separate applications for different users.

## Company Web Application

**Technology:**

* Next.js
* React
* Tailwind CSS
* REST API

Used by:

* Company Admin
* Super Admin

---

## Manager Application

Managers can use both:

### Web Application

```text
Next.js
```

### Mobile Application

```text
Expo React Native
```

The manager can choose the platform according to their workflow.

---

## Salesman Mobile Application

**Technology:**

```text
Expo React Native
```

Used for:

* Sales
* Customer management
* Orders
* Invoices
* Stock
* Payments
* Customer history

---

## Customer Mobile Application

**Technology:**

```text
Expo React Native
```

Used for:

* Orders
* Purchase history
* Invoices
* Payments
* Order tracking

---

# ⚙️ Backend

The complete backend will be developed using:

```text
Spring Boot
```

### Backend Responsibilities

* Authentication
* Authorization
* User management
* Branch management
* Product management
* Category management
* Variant management
* Inventory management
* Stock transfers
* Pricing
* Orders
* Invoices
* Payments
* Reports
* Notifications
* Audit logs

---

# 🏗️ High-Level Architecture

```text
                  ┌─────────────────────┐
                  │      Company        │
                  │      Web App        │
                  │      Next.js        │
                  └──────────┬──────────┘
                             │
                             │
┌──────────────────┐         │         ┌──────────────────────┐
│ Manager Web App  │─────────┼─────────│ Manager Mobile App  │
│     Next.js      │         │         │       Expo           │
└──────────────────┘         │         └──────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Spring Boot     │
                  │       Backend      │
                  │      REST API      │
                  └──────────┬──────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
        Database        File Storage      Notifications
             │
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
   Salesman       Customer
   Mobile App     Mobile App
     Expo            Expo
```

---

# 🗃️ Main Backend Modules

```text
Authentication
│
├── User Management
├── Role Management
├── Branch Management
├── Product Management
├── Category Management
├── Variant Management
├── Inventory Management
├── Stock Transfer
├── Pricing Management
├── Sales Management
├── Order Management
├── Invoice Management
├── Payment Management
├── Customer Management
├── Reports & Analytics
└── Notification Management
```

---

# 💡 Additional Features

To make the system more useful for a real business, the following features can be added.

## Low Stock Alerts

Automatically notify managers when stock goes below the minimum quantity.

```text
Product A
Current Stock: 8
Minimum Stock: 10

⚠ Low Stock
```

## Expiry Tracking

Useful for food, medicine, cosmetics, and other products.

Track:

* Manufacturing date
* Expiry date
* Batch number

## Batch Management

Products can be tracked by batch.

```text
Product A

Batch 001 → 100 units
Batch 002 → 150 units
Batch 003 → 200 units
```

## Payment Tracking

Customers may pay immediately or later.

```text
Invoice Total: ₹10,000

Paid: ₹6,000
Pending: ₹4,000
```

The system can track customer credit.

---

# 🔔 Notifications

Notifications can be generated for:

* New order
* Order confirmation
* Stock transfer
* Low stock
* Payment received
* Payment pending
* Invoice generated
* Product assignment
* Important company announcements

---

# 📍 Order & Delivery Tracking

For businesses that deliver products to shops, the system can support:

```text
Order Created
      ↓
Confirmed
      ↓
Packed
      ↓
Assigned to Delivery
      ↓
Out for Delivery
      ↓
Delivered
```

---

# 📜 Audit Log

Important actions should be recorded.

Example:

```text
Manager Rahul

Action:
Updated Product Price

Product:
Product A

Old Price:
₹500

New Price:
₹520

Date:
06 October 2026
```

This helps the company understand **who changed what and when**.

---

# 🔄 Complete Business Flow

```text
Company
   │
   ├── Creates Product
   ├── Sets Base Price
   └── Maintains Central Inventory
             │
             ▼
        Branch Manager
             │
             ├── Receives Stock
             ├── Manages Inventory
             └── Manages Salesmen
                      │
                      ▼
                   Salesman
                      │
                      ├── Receives / Uses Stock
                      ├── Adds Allowed Margin
                      ├── Creates Customer Order
                      └── Generates Sale
                              │
                              ▼
                       Shopkeeper
                              │
                              ├── Receives Product
                              ├── Views Invoice
                              ├── Makes Payment
                              └── Views Purchase History
```

---

# 🎯 Main Goal

The main goal of this project is to create a **centralized multi-branch business management system** where a company can control its products, inventory, branches, salesmen, customers, pricing, sales, invoices, and reports from one platform.

The system should provide **real-time visibility of inventory and sales** while allowing managers, salesmen, and customers to use interfaces designed specifically for their roles.

---

# 🛠️ Technology Stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Company Web     | Next.js              |
| Manager Web     | Next.js              |
| Mobile Apps     | Expo React Native    |
| Backend         | Spring Boot          |
| API             | REST API             |
| Authentication  | JWT / Secure Cookies |
| Database        | SQL Database         |
| File Storage    | Cloud Storage        |
| Deployment      | Cloud / VPS          |
| Version Control | Git + GitHub         |

---

# 🚀 Future Scope

Possible future improvements include:

* AI-based sales prediction
* AI product recommendations
* Automatic stock forecasting
* GST / tax management
* Barcode scanning
* QR-code based products
* Online payment integration
* GPS-based salesman tracking
* Delivery partner management
* WhatsApp notifications
* Email notifications
* Advanced business analytics
* Automated monthly reports
* Multi-company support
* Multi-language support
* Offline mobile sales with later synchronization

---

# 📌 Summary

This project is more than a simple inventory application.

It is a **Multi-Branch Inventory, Sales, Customer & Business Management Platform**.

It connects:

**Company → Branch → Manager → Salesman → Shopkeeper**

while maintaining:

**Products → Inventory → Pricing → Orders → Sales → Invoices → Payments → Reports**

The system provides a centralized platform for the company and role-specific applications for managers, salesmen, and customers.