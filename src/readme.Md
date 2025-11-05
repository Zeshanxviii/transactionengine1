 // thing to do 

 create validator using zod
 # transactionengine1



# 1. Create a threshold profile
POST /api/thresholds/profiles
{
  "thresProfileId": "THR_RETAIL_001",
  "name": "Retail User Profile",
  "userType": "USER",
  "status": "Y"
}

# 2. Create threshold details (Daily/Weekly/Monthly limits)
POST /api/thresholds/details
{
  "thresProfileId": "THR_RETAIL_001",
  "groupId": "DEFAULT",
  "payerCount": 5,
  "payerAmt": 50000000,      // ₹500,000 in paise
  "payeeCount": 10,
  "payeeAmt": 100000000       // ₹1,000,000 in paise
}

# 3. Assign threshold profile to user (via database or user creation)
# Update itn_channel_users SET thres_profile_id = 'THR_RETAIL_001' WHERE user_id = 'john123'

# 4. Validate transaction
POST /api/thresholds/validate
{
  "userId": "john123",
  "amount": 5000,
  "role": "PAYER",
  "groupId": "DEFAULT"
}

# 5. Check remaining limits
GET /api/thresholds/limits/me?role=PAYER&groupId=DEFAULT






# Execute Atomic Transaction (All 5 Steps)
POST /api/atomic-transactions/execute
Content-Type: application/json
Authorization: Bearer <token>

{
  "payerUserId": "john123",
  "payeeUserId": "merchant998",
  "amount": 5000,
  "productId": "PROD_001",
  "serviceProvider": "Airtel",
  "productType": "RECHARGE",
  "rechargeType": "MOBILE",
  "recipientInfo": {
    "mobileNumber": "9876543210"
  },
  "remarks": "Mobile recharge"
}

# Response (Success)
{
  "success": true,
  "data": {
    "success": true,
    "transferId": "TXN_abc123xyz",
    "status": "SUCCESS",
    "breakdown": {
      "originalAmount": 500000,
      "commission": 5000,
      "serviceCharge": 2000,
      "gst": 1260,
      "totalCost": 8260,
      "finalAmount": 508260
    }
  },
  "message": "Transaction completed successfully"
}

# Get Transaction Status
GET /api/atomic-transactions/TXN_abc123xyz/status
Authorization: Bearer <token>


# Product & Commission Management - API Testing Guide

## 🔐 Prerequisites

Login as Admin to get token:
```bash
POST http://localhost:3000/api/auth/login
Body: { "userName": "admin007", "password": "your_admin_password" }

# Save the admin token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📦 PRODUCT MANAGEMENT

### 1. Register a New Product (Admin Only)

```bash
POST http://localhost:3000/api/products/register
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "rechargeType": "PREPAID",
  "productCode": "JIO_PREPAID",
  "api": "RAZORPAY",
  "imageUrl": "https://example.com/jio-logo.png",
  "status": "ACTIVE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "productId": "PROD_abc123",
    "message": "Product registered successfully"
  },
  "message": "Product registered successfully"
}
```

### 2. Get All Products with Filters

```bash
GET http://localhost:3000/api/products?productType=MOBILE&status=ACTIVE&limit=50
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "PROD_abc123",
      "product_type": "MOBILE",
      "service_provider": "Jio",
      "recharge_type": "PREPAID",
      "product_code": "JIO_PREPAID",
      "api": "RAZORPAY",
      "status": "ACTIVE",
      "created_on": "2025-11-03T10:00:00.000Z",
      "image_url": "https://example.com/jio-logo.png"
    }
  ],
  "count": 1
}
```

### 3. Get Product by ID

```bash
GET http://localhost:3000/api/products/PROD_abc123
Authorization: Bearer ADMIN_TOKEN
```

### 4. Update Product

```bash
PUT http://localhost:3000/api/products/PROD_abc123
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "INACTIVE",
  "imageUrl": "https://example.com/new-jio-logo.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "productId": "PROD_abc123",
    "message": "Product updated successfully",
    "updates": {
      "status": "INACTIVE",
      "image_url": "https://example.com/new-jio-logo.png"
    }
  },
  "message": "Product updated successfully"
}
```

### 5. Get Products by Type

```bash
GET http://localhost:3000/api/products/type/MOBILE
Authorization: Bearer ADMIN_TOKEN
```

### 6. Get Service Providers for Product Type

```bash
GET http://localhost:3000/api/products/providers/MOBILE
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": ["Jio", "Airtel", "Vi", "BSNL"],
  "count": 4
}
```

### 7. Delete/Deactivate Product

```bash
DELETE http://localhost:3000/api/products/PROD_abc123
Authorization: Bearer ADMIN_TOKEN
```

---

## 🏪 PRODUCT PROFILE MANAGEMENT

### 1. Create Product Profile

```bash
POST http://localhost:3000/api/products/profile/create
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "rechargeType": "PREPAID",
  "productCode": "JIO_PREPAID",
  "api": "RAZORPAY",
  "marginType": "PERCENTAGE",
  "margin": 250,
  "status": "A"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "productId": "PROD_abc123",
    "serviceProvider": "Jio",
    "message": "Product profile created successfully"
  },
  "message": "Product profile created successfully"
}
```

### 2. Get Product Profile

```bash
GET http://localhost:3000/api/products/profile/PROD_abc123/Jio
Authorization: Bearer ADMIN_TOKEN
```

### 3. Update Product Profile

```bash
PUT http://localhost:3000/api/products/profile/PROD_abc123/Jio
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "margin": 300,
  "status": "A"
}
```

### 4. Get All Product Profiles

```bash
GET http://localhost:3000/api/products/profiles/all?productType=MOBILE
Authorization: Bearer ADMIN_TOKEN
```

---

## 💰 COMMISSION MANAGEMENT

### 1. Create Commission Configuration

```bash
POST http://localhost:3000/api/commissions/create
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "rechargeType": "PREPAID",
  "userType": "RETAILER",
  "userCategory": "R1",
  "commissionType": "PERCENTAGE",
  "commissionDirection": "CREDIT",
  "commission": 250,
  "status": "ACTIVE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "productId": "PROD_abc123",
    "userType": "RETAILER",
    "userCategory": "R1",
    "message": "Commission created successfully"
  },
  "message": "Commission created successfully"
}
```

**Commission Explanation:**
- `commissionType: "PERCENTAGE"` + `commission: 250` = 2.5% commission
- `commissionType: "FLAT"` + `commission: 500` = ₹5 flat commission (500 paise)

### 2. Get All Commissions with Filters

```bash
GET http://localhost:3000/api/commissions?productId=PROD_abc123&userType=RETAILER
Authorization: Bearer ADMIN_TOKEN
```

### 3. Get Specific Commission

```bash
GET http://localhost:3000/api/commissions/PROD_abc123/MOBILE/Jio/RETAILER/R1
Authorization: Bearer ADMIN_TOKEN
```

### 4. Get All Commissions for a Product

```bash
GET http://localhost:3000/api/commissions/product/PROD_abc123/MOBILE/Jio
Authorization: Bearer ADMIN_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "PROD_abc123",
      "product_type": "MOBILE",
      "service_provider": "Jio",
      "recharge_type": "PREPAID",
      "user_type": "RETAILER",
      "user_category": "R1",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 250,
      "status": "ACTIVE"
    },
    {
      "user_type": "DISTRIBUTOR",
      "user_category": "D1",
      "commission": 500
    }
  ],
  "count": 2
}
```

### 5. Update Commission

```bash
PUT http://localhost:3000/api/commissions/PROD_abc123/MOBILE/Jio/RETAILER/R1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "commission": 300,
  "status": "ACTIVE"
}
```

### 6. Delete/Deactivate Commission

```bash
DELETE http://localhost:3000/api/commissions/PROD_abc123/MOBILE/Jio/RETAILER/R1
Authorization: Bearer ADMIN_TOKEN
```

### 7. Bulk Create Commissions

```bash
POST http://localhost:3000/api/commissions/bulk-create
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "commissions": [
    {
      "userType": "RETAILER",
      "userCategory": "R1",
      "rechargeType": "PREPAID",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 250,
      "status": "ACTIVE"
    },
    {
      "userType": "DISTRIBUTOR",
      "userCategory": "D1",
      "rechargeType": "PREPAID",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 500,
      "status": "ACTIVE"
    },
    {
      "userType": "SUPER_DISTRIBUTOR",
      "userCategory": "SD1",
      "rechargeType": "PREPAID",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 750,
      "status": "ACTIVE"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": 3,
    "failed": 0,
    "results": [...],
    "errors": []
  },
  "message": "Created 3 commissions, 0 failed"
}
```

---

## 🧮 COMMISSION CALCULATION

### 1. Calculate Commission for Single User

```bash
POST http://localhost:3000/api/commissions/calculate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "userType": "RETAILER",
  "userCategory": "R1",
  "transactionAmount": 29900
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hasCommission": true,
    "commissionAmount": 748,
    "commissionType": "PERCENTAGE",
    "commissionDirection": "CREDIT",
    "commissionConfig": {
      "product_id": "PROD_abc123",
      "commission": 250
    }
  }
}
```

**Calculation:**
- Transaction: ₹299 (29900 paise)
- Commission: 2.5% (250/100)
- Commission Amount: 29900 × 0.025 = 747.5 ≈ 748 paise (₹7.48)

### 2. Calculate Hierarchy Commission

```bash
POST http://localhost:3000/api/commissions/calculate-hierarchy
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "transactionAmount": 29900,
  "userHierarchy": [
    {
      "userId": "retailer001",
      "userType": "RETAILER",
      "userCategory": "R1"
    },
    {
      "userId": "dist001",
      "userType": "DISTRIBUTOR",
      "userCategory": "D1"
    },
    {
      "userId": "superdist001",
      "userType": "SUPER_DISTRIBUTOR",
      "userCategory": "SD1"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "userId": "retailer001",
        "userType": "RETAILER",
        "userCategory": "R1",
        "commissionAmount": 748,
        "commissionType": "PERCENTAGE"
      },
      {
        "userId": "dist001",
        "userType": "DISTRIBUTOR",
        "userCategory": "D1",
        "commissionAmount": 1495,
        "commissionType": "PERCENTAGE"
      },
      {
        "userId": "superdist001",
        "userType": "SUPER_DISTRIBUTOR",
        "userCategory": "SD1",
        "commissionAmount": 2243,
        "commissionType": "PERCENTAGE"
      }
    ],
    "totalCommission": 4486,
    "count": 3
  }
}
```

---

## 🎯 SERVICE TYPE MANAGEMENT

### 1. Register Service Type

```bash
POST http://localhost:3000/api/products/service-type/register
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "serviceType": "MOBILE_RECHARGE",
  "serviceName": "Mobile Recharge Service",
  "status": "A",
  "isFinancial": "Y"
}
```

### 2. Get All Service Types

```bash
GET http://localhost:3000/api/products/service-types/all
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔄 Complete Workflow Example

### Step 1: Register Products

```bash
# Jio Prepaid
POST /api/products/register
{
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "rechargeType": "PREPAID",
  "productCode": "JIO_PREPAID",
  "api": "RAZORPAY"
}

# Airtel Prepaid
POST /api/products/register
{
  "productType": "MOBILE",
  "serviceProvider": "Airtel",
  "rechargeType": "PREPAID",
  "productCode": "AIRTEL_PREPAID",
  "api": "RAZORPAY"
}
```

### Step 2: Create Product Profiles

```bash
POST /api/products/profile/create
{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "rechargeType": "PREPAID",
  "productCode": "JIO_PREPAID",
  "api": "RAZORPAY",
  "marginType": "PERCENTAGE",
  "margin": 250
}
```

### Step 3: Setup Commissions for All User Levels

```bash
POST /api/commissions/bulk-create
{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "commissions": [
    {
      "userType": "RETAILER",
      "userCategory": "R1",
      "rechargeType": "PREPAID",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 250
    },
    {
      "userType": "DISTRIBUTOR",
      "userCategory": "D1",
      "rechargeType": "PREPAID",
      "commissionType": "PERCENTAGE",
      "commissionDirection": "CREDIT",
      "commission": 500
    }
  ]
}
```

### Step 4: Calculate Commission for Transaction

```bash
POST /api/commissions/calculate
{
  "productId": "PROD_abc123",
  "productType": "MOBILE",
  "serviceProvider": "Jio",
  "userType": "RETAILER",
  "userCategory": "R1",
  "transactionAmount": 29900
}
```

---

## ❌ Validation Error Examples

### Invalid Product Type
```json
{
  "productType": "INVALID_TYPE"
}
```
Response (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "productType",
      "message": "Invalid product type",
      "code": "invalid_enum_value"
    }
  ]
}
```

### Commission Percentage > 100
```json
{
  "commissionType": "PERCENTAGE",
  "commission": 150
}
```
Response (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "commission",
      "message": "Percentage commission cannot exceed 100",
      "code": "custom"
    }
  ]
}
```

---

## 📊 Summary Tables

### Product Types
| Type | Description |
|------|-------------|
| MOBILE | Mobile prepaid/postpaid |
| DTH | Direct-to-home TV |
| ELECTRICITY | Electricity bill payment |
| GAS | Gas bill payment |
| WATER | Water bill payment |
| BROADBAND | Internet bill payment |
| FASTAG | FASTag recharge |

### User Types & Categories
| User Type | Category | Commission % |
|-----------|----------|--------------|
| RETAILER | R1 | 2.5% |
| DISTRIBUTOR | D1 | 5.0% |
| SUPER_DISTRIBUTOR | SD1 | 7.5% |

### Commission Types
| Type | Description | Example |
|------|-------------|---------|
| FLAT | Fixed amount in paise | 500 = ₹5 |
| PERCENTAGE | Percentage × 100 | 250 = 2.5% |

---

## 💡 Pro Tips

1. **Always register product first** before creating profiles
2. **Commission values** are in basis points for PERCENTAGE (250 = 2.5%)
3. **Use bulk create** for setting up multiple user level commissions
4. **Service providers with spaces** need URL encoding in GET requests
5. **Calculate commission** before processing recharge transactions

Ready to integrate with your transaction processing! 🚀