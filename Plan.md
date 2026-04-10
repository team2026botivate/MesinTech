# 📦 Business Management System — Comprehensive Project Plan

---

## 🗂️ TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Project Flow & Architecture](#2-project-flow--architecture)
3. [Data Models (What Gets Stored)](#3-data-models)
4. [Module-wise Page Details](#4-module-wise-page-details)
   - 4.1 Dashboard
   - 4.2 Inventory
   - 4.3 Companies
   - 4.4 Customers
   - 4.5 Sales
   - 4.6 Purchase
   - 4.7 Returns (Sales Return / Purchase Return)
   - 4.8 Expenses
   - 4.9 Payments
   - 4.10 Dispatch
   - 4.11 Notifications
5. [Invoice Generation & PDF Flow](#5-invoice-generation--pdf-flow)
6. [Stock Update Logic](#6-stock-update-logic)
7. [Payment & Ageing Logic](#7-payment--ageing-logic)
8. [Notification Engine Logic](#8-notification-engine-logic)
9. [Forms Summary (All Modules)](#9-forms-summary)
10. [Inter-Module Relationships](#10-inter-module-relationships)

---

## 1. PROJECT OVERVIEW

This is a **Business Management System** designed to manage the complete lifecycle of a trading/distribution business — from purchasing goods from suppliers, storing in inventory, selling to customers, tracking dispatches, handling returns and expenses, and monitoring payments with ageing alerts.

### Core Capabilities:
- Real-time inventory tracking (auto-updated via sales, purchases, returns)
- Full invoice generation with PDF export
- Payment tracking with overdue notifications
- Ageing analysis per company/customer
- Expense tracking per dispatch/delivery
- Comprehensive dashboard with financial KPIs

---

## 2. PROJECT FLOW & ARCHITECTURE

```
SUPPLIER ──► PURCHASE MODULE ──► INVENTORY (Stock +)
                │
                ▼
         COMPANIES (Supplier Profile + Ageing)

INVENTORY ──► SALES MODULE ──► CUSTOMER
                │                    │
                ▼                    ▼
         INVOICE CREATED        DISPATCH MODULE
                │                    │
                ▼                    ▼
         PAYMENT MODULE         EXPENSES MODULE
                │
                ▼
         NOTIFICATION MODULE (overdue alerts)
                │
                ▼
         DASHBOARD (aggregated view)


RETURNS FLOW:
  Sales Return ──► Inventory (Stock +) + Payment adjustment
  Purchase Return ──► Inventory (Stock -) + Payment adjustment
```

### Full Transaction Lifecycle:

```
Step 1: Add Supplier → Companies Module
Step 2: Purchase from Supplier → Purchase Module → Stock increases in Inventory
Step 3: Sell to Customer → Sales Module → Stock decreases in Inventory → Invoice PDF generated
Step 4: Dispatch Order → Dispatch Module → Tracking updated
Step 5: Delivery Boy logs Expenses → Expenses Module
Step 6: Customer pays → Payments Module → Receivable updated
Step 7: If payment overdue → Notification Module fires alert
Step 8: If order returned → Returns Module → Stock adjusted, payment recalculated
Step 9: Dashboard reflects all above data in real-time
```

---

## 3. DATA MODELS

### 3.1 Product / Item
| Field | Type | Description |
|-------|------|-------------|
| product_id | UUID | Unique identifier |
| product_name | String | Name of product |
| SKU / Item Code | String | Short code |
| category | String | Product category |
| unit | String | pcs / kg / ltr / box etc. |
| current_stock | Number | Live quantity (auto-updated) |
| min_stock_alert | Number | Low stock threshold |
| purchase_price | Number | Last purchase price |
| selling_price | Number | Default selling price |
| GST_rate | Number | Tax % |
| HSN_code | String | For GST compliance |
| description | Text | Product details |
| created_at | DateTime | Record creation |

---

### 3.2 Company (Supplier)
| Field | Type | Description |
|-------|------|-------------|
| company_id | UUID | Unique ID |
| company_name | String | Business name |
| contact_person | String | Primary contact |
| phone | String | Contact number |
| email | String | Email |
| address | Text | Full address |
| city / state / pincode | String | Location |
| GSTIN | String | GST number |
| PAN | String | PAN number |
| payment_terms_days | Number | e.g. 30, 45, 60 days |
| bank_details | Object | Account/IFSC/Bank |
| products_supplied | Array | Products they sell |
| rate_per_product | Array | Price list per product |
| outstanding_balance | Number | Computed field |
| created_at | DateTime | Record date |

---

### 3.3 Customer
| Field | Type | Description |
|-------|------|-------------|
| customer_id | UUID | Unique ID |
| customer_name | String | Full name |
| company_name | String | Business name (if any) |
| phone | String | Mobile/Landline |
| alternate_phone | String | Secondary number |
| email | String | Email |
| address | Text | Full address |
| city / state / pincode | String | Location |
| GSTIN | String | GST (if B2B) |
| PAN | String | PAN |
| payment_terms_days | Number | e.g. 15, 30 days |
| credit_limit | Number | Max allowed credit |
| outstanding_balance | Number | Computed |
| total_purchases | Number | Lifetime purchases |
| notes | Text | Internal remarks |
| created_at | DateTime | |

---

### 3.4 Sales Invoice
| Field | Type | Description |
|-------|------|-------------|
| invoice_id | UUID | Internal ID |
| invoice_number | String | e.g. INV-2025-001 |
| invoice_date | Date | Date of invoice |
| due_date | Date | Auto-calc based on payment terms |
| customer_id | FK | Linked customer |
| company_name | String | Customer company |
| billing_address | Text | |
| shipping_address | Text | |
| line_items | Array | Products, qty, rate, GST |
| subtotal | Number | Before discount |
| discount_type | Enum | amount / percentage |
| discount_value | Number | |
| discount_amount | Number | Computed |
| taxable_amount | Number | After discount |
| CGST / SGST / IGST | Number | GST split |
| total_amount | Number | Grand total |
| amount_paid | Number | Payments received |
| balance_due | Number | Computed |
| payment_status | Enum | Paid / Partial / Pending / Overdue |
| dispatch_id | FK | Linked dispatch |
| notes / description | Text | |
| created_by | String | User |
| created_at | DateTime | |

---

### 3.5 Purchase
| Field | Type | Description |
|-------|------|-------------|
| purchase_id | UUID | |
| purchase_number | String | e.g. PUR-2025-001 |
| supplier_id | FK | Linked company |
| supplier_invoice_no | String | Supplier's own invoice |
| purchase_date | Date | |
| due_date | Date | Based on supplier payment terms |
| line_items | Array | Product, qty, rate, GST |
| subtotal | Number | |
| discount_amount | Number | |
| total_amount | Number | |
| amount_paid | Number | |
| balance_due | Number | |
| payment_status | Enum | Paid / Partial / Pending |
| dispatch_through | String | Transport/courier used |
| vehicle_number | String | |
| notes | Text | |
| created_at | DateTime | |

---

### 3.6 Sales Return
| Field | Type | Description |
|-------|------|-------------|
| return_id | UUID | |
| return_number | String | e.g. SR-2025-001 |
| return_date | Date | |
| original_invoice_id | FK | Linked sales invoice |
| customer_id | FK | |
| return_reason | Text | Why returned |
| line_items | Array | Products, qty returned |
| refund_amount | Number | Computed |
| refund_type | Enum | Refund / Credit Note |
| stock_restocked | Boolean | Whether inventory updated |
| notes | Text | |
| created_at | DateTime | |

---

### 3.7 Purchase Return
| Field | Type | Description |
|-------|------|-------------|
| return_id | UUID | |
| return_number | String | e.g. PR-2025-001 |
| return_date | Date | |
| original_purchase_id | FK | Linked purchase |
| supplier_id | FK | |
| return_reason | Text | |
| line_items | Array | Products, qty returned |
| debit_note_amount | Number | |
| stock_deducted | Boolean | |
| notes | Text | |
| created_at | DateTime | |

---

### 3.8 Expense
| Field | Type | Description |
|-------|------|-------------|
| expense_id | UUID | |
| expense_date | Date | |
| expense_type | Enum | Courier / Travelling / Food |
| sales_invoice_id | FK | Linked to which sale |
| dispatch_id | FK | Linked dispatch |
| **Courier Fields** | | |
| courier_name | String | Service provider |
| dispatcher_name | String | Person name |
| items_count | Number | |
| courier_amount | Number | |
| **Travelling Fields** | | |
| from_location | String | Point A |
| to_location | String | Point B |
| travel_mode | String | Two-wheeler / Auto / Train |
| travel_amount | Number | |
| **Food Fields** | | |
| food_description | Text | Meal details |
| food_amount | Number | |
| total_expense | Number | Sum of all |
| created_by | String | |
| notes | Text | |
| created_at | DateTime | |

---

### 3.9 Payment
| Field | Type | Description |
|-------|------|-------------|
| payment_id | UUID | |
| payment_number | String | e.g. PAY-2025-001 |
| payment_date | Date | |
| payment_type | Enum | Received / Sent |
| linked_to | Enum | Sales / Purchase |
| reference_id | FK | Sales or Purchase ID |
| party_type | Enum | Customer / Supplier |
| party_id | FK | Customer or Company ID |
| amount | Number | |
| payment_mode | Enum | Cash / Bank Transfer / Cheque / UPI |
| reference_number | String | UTR / Cheque no. |
| notes | Text | |
| created_at | DateTime | |

---

### 3.10 Dispatch
| Field | Type | Description |
|-------|------|-------------|
| dispatch_id | UUID | |
| dispatch_number | String | e.g. DSP-2025-001 |
| sales_invoice_id | FK | Linked invoice |
| dispatch_date | Date | |
| dispatcher_name | String | Courier/Transport name |
| tracking_number | String | AWB/docket number |
| vehicle_number | String | |
| driver_name | String | |
| driver_phone | String | |
| from_address | Text | Warehouse location |
| to_address | Text | Customer address |
| dispatch_status | Enum | Pending / In-Transit / Delivered / Returned |
| expected_delivery | Date | |
| actual_delivery | Date | |
| delivery_proof | File | Photo / signature |
| notes | Text | |
| created_at | DateTime | |

---

### 3.11 Notification
| Field | Type | Description |
|-------|------|-------------|
| notification_id | UUID | |
| type | Enum | Payment Due / Overdue / Low Stock / Return Alert |
| severity | Enum | Info / Warning / Critical |
| linked_module | Enum | Sales / Purchase / Inventory |
| reference_id | FK | Invoice or Product ID |
| party_name | String | Customer or Supplier |
| message | Text | Full notification message |
| days_overdue | Number | How many days past due |
| amount_pending | Number | |
| is_read | Boolean | |
| created_at | DateTime | |

---

## 4. MODULE-WISE PAGE DETAILS

---

### 4.1 DASHBOARD

**Purpose:** Central view of the business health.

#### Sections & KPI Cards:
- **Sales Summary** — Total Sales (Monthly/Quarterly/Yearly), Number of Invoices
- **Purchase Summary** — Total Purchases, Pending Payables
- **Receivables** — Total due from customers, Overdue amount, On-time payments
- **Payables** — Total due to suppliers, Overdue to suppliers
- **Profit Indicator** — Revenue from payments received vs. pending (as profit/loss view)
  - Sales done but payment terms active → shown as "Expected Profit"
  - Payment terms expired, payment not received → shown in "Risk / Loss" bucket
- **Inventory Alerts** — Products below minimum stock level
- **Top Customers** — by revenue or frequency
- **Top Products** — by sales volume
- **Dispatch Status** — Pending / In-Transit / Delivered count
- **Expense Summary** — Total expenses this month
- **Recent Activity Feed** — Last 10 transactions across all modules
- **Upcoming Payment Dues** — Next 7 days calendar view

#### Charts:
- Bar chart: Monthly Sales vs Purchase
- Pie chart: Payment status breakdown (Paid / Pending / Overdue)
- Line chart: Revenue trend over last 6 months
- Donut chart: Expense category breakdown

#### Filters:
- Date range picker
- Customer / Supplier filter

---

### 4.2 INVENTORY MODULE

**Purpose:** Manage all products and track live stock.

#### Pages:
1. **Product List Page**
   - Table with: Product Name, SKU, Category, Current Stock, Unit, Purchase Price, Selling Price, GST%, Status (Low/Normal/Out of Stock)
   - Search, filter by category, sort by stock level
   - Export to Excel/PDF
   - Bulk import via CSV

2. **Add / Edit Product Form**
   - Product Name *
   - SKU / Item Code *
   - Category (dropdown + add new)
   - Unit (pcs / kg / ltr / box / set)
   - Opening Stock (initial qty)
   - Minimum Stock Alert Level
   - Purchase Price (default)
   - Selling Price (default)
   - GST Rate (%) — 0 / 5 / 12 / 18 / 28
   - HSN Code
   - Description
   - Product Image (optional)
   - Status (Active / Inactive)

3. **Stock Ledger / History Page** (per product)
   - Timeline of all stock movements
   - Columns: Date, Transaction Type (Purchase / Sale / Return), Reference Number, Qty In, Qty Out, Balance
   - Filterable by date range

4. **Low Stock Alert Page**
   - Products below minimum threshold
   - Quick action: Create Purchase Order

#### Stock Auto-Update Rules:
| Event | Stock Change |
|-------|-------------|
| Purchase added | + (increase) |
| Purchase return | - (decrease) |
| Sale created | - (decrease) |
| Sales return | + (increase) |

---

### 4.3 COMPANIES MODULE (Suppliers)

**Purpose:** Manage supplier profiles, their product catalogues, and payment terms.

#### Pages:
1. **Company List Page**
   - Table: Company Name, Contact Person, Phone, City, Payment Terms, Outstanding Balance, Status
   - Search and filter
   - Ageing summary column (0-30 / 31-60 / 61-90 / 90+ days buckets)

2. **Add / Edit Company Form**
   - Company Name *
   - Contact Person Name *
   - Phone * / Alternate Phone
   - Email
   - Address (Line 1, Line 2, City, State, Pincode)
   - GSTIN
   - PAN Number
   - Payment Terms (days) — e.g. 30, 45, 60, 90
   - Bank Details (Bank Name, Account No., IFSC, Branch)
   - Product Catalogue Section:
     - Add products they supply
     - Rate per product (their selling price to us)
     - MOQ (minimum order quantity)
   - Notes / Remarks

3. **Company Detail / Profile Page**
   - Full profile
   - Purchase history (all purchases from this supplier)
   - Payment history
   - Ageing table:
     | Period | Amount |
     |--------|--------|
     | Current (0-30 days) | ₹X |
     | 31-60 days | ₹X |
     | 61-90 days | ₹X |
     | 90+ days (Overdue) | ₹X |
   - Outstanding balance
   - Return history

---

### 4.4 CUSTOMERS MODULE

**Purpose:** Manage customer profiles and their purchase history.

#### Pages:
1. **Customer List Page**
   - Table: Name, Company, Phone, City, Payment Terms, Outstanding, Total Purchases
   - Search and filter by city / status
   - Export

2. **Add / Edit Customer Form**
   - Customer Name *
   - Company / Business Name
   - Phone * / Alternate Phone
   - Email
   - Address (Line 1, Line 2, City, State, Pincode)
   - GSTIN (for B2B)
   - PAN Number
   - Payment Terms (days)
   - Credit Limit (₹)
   - Preferred Dispatch Method
   - Notes / Internal Remarks

3. **Customer Detail / Profile Page**
   - Full profile view
   - Sales history (all invoices)
   - Payment history
   - Outstanding balance
   - Ageing analysis (same buckets as supplier)
   - Returns history
   - Expense records linked to their deliveries

---

### 4.5 SALES MODULE

**Purpose:** Create sales orders/invoices and track them.

#### Pages:
1. **Sales List Page**
   - Table: Invoice No., Date, Customer Name, Items, Total Amount, Paid, Balance, Payment Status, Dispatch Status
   - Filter: Date range, Customer, Status
   - Actions: View, Edit, Download PDF, Duplicate, Cancel

2. **Create / Edit Sales Invoice Form**

   **Section A — Invoice Header**
   - Invoice Number * (auto-generated, editable) — format: INV-YYYY-NNNN
   - Invoice Date * (default: today)
   - Due Date (auto-calculated based on customer payment terms)
   - Customer Name / Company * (searchable dropdown)
   - Billing Address (auto-filled from customer, editable)
   - Shipping Address (checkbox: same as billing, or enter separately)
   - Place of Supply (State — for GST)

   **Section B — Line Items Table**
   - Product Search (type to search from inventory)
   - Quantity *
   - Unit
   - Rate (default from product, editable)
   - Discount per line (amount or %)
   - GST % (auto-filled from product)
   - CGST / SGST / IGST (auto-split based on place of supply)
   - Line Total (computed)
   - Add Row / Remove Row buttons

   **Section C — Totals**
   - Subtotal
   - Discount (overall — Amount or Percentage toggle)
   - Taxable Amount (Subtotal - Discount)
   - Total GST (CGST + SGST or IGST)
   - Grand Total
   - Amount in Words (auto-generated)

   **Section D — Additional Details**
   - Dispatch Through (courier/transport name)
   - Vehicle Number
   - Description / Notes (for invoice footer)
   - Terms & Conditions (template text, editable)

   **Section E — Actions**
   - Save as Draft
   - Save & Preview
   - Save & Download PDF
   - Save & Share (WhatsApp/Email)

3. **Sales Invoice View / Detail Page**
   - Full invoice preview
   - Payment history against this invoice
   - Dispatch details linked
   - Expenses linked
   - Return history
   - Activity log (who created, edited)

---

### 4.6 PURCHASE MODULE

**Purpose:** Record all purchases from suppliers and update inventory.

#### Pages:
1. **Purchase List Page**
   - Table: Purchase No., Supplier Invoice No., Supplier Name, Date, Items, Total, Paid, Balance, Status
   - Filters: Date, Supplier, Status

2. **Create / Edit Purchase Form**

   **Section A — Header**
   - Purchase Number (auto-generated: PUR-YYYY-NNNN)
   - Supplier Invoice Number * (supplier's own bill number)
   - Purchase Date *
   - Due Date (auto-calculated from supplier payment terms)
   - Supplier Name * (dropdown from Companies)
   - Billing Address (your warehouse address)

   **Section B — Line Items**
   - Product Search
   - Quantity *
   - Unit
   - Purchase Rate *
   - Discount per item
   - GST %
   - Line Total

   **Section C — Totals**
   - Subtotal, Discount, Tax, Grand Total

   **Section D — Logistics**
   - Dispatch Through (transport/courier name)
   - Vehicle Number
   - Received Date
   - Notes / Remarks

   **Section E — Actions**
   - Save Draft / Save / Save & Print

3. **Purchase Detail Page**
   - Full record
   - Payment history
   - Return history against this purchase
   - Stock impact log

---

### 4.7 RETURNS MODULE

**Purpose:** Record sales returns (from customer) and purchase returns (to supplier).

#### Sub-module A: SALES RETURN

1. **Sales Return List Page**
   - Table: Return No., Original Invoice No., Customer, Date, Items, Refund Amount, Type, Status
   - Filter by date, customer

2. **Create Sales Return Form**
   - Return Number (auto: SR-YYYY-NNNN)
   - Return Date *
   - Link Original Invoice * (searchable — fetches all items from that invoice)
   - Customer (auto-filled from invoice)
   - Select Items to Return (from invoice line items — select which products and qty)
   - Quantity to Return per item
   - Return Reason * (Damaged / Wrong Item / Customer Cancelled / Quality Issue / Other)
   - Refund Type: Cash Refund / Credit Note / Exchange
   - Restock to Inventory (Yes / No toggle — updates stock if Yes)
   - Notes / Remarks

#### Sub-module B: PURCHASE RETURN

1. **Purchase Return List Page**
   - Table: Return No., Original Purchase No., Supplier, Date, Items, Debit Note Amount, Status

2. **Create Purchase Return Form**
   - Return Number (auto: PR-YYYY-NNNN)
   - Return Date *
   - Link Original Purchase * (searchable)
   - Supplier (auto-filled)
   - Select Items to Return
   - Quantity to Return
   - Return Reason
   - Debit Note Type: Cash Refund / Credit Adjustment
   - Deduct from Inventory (Yes/No — stock goes down)
   - Notes

---

### 4.8 EXPENSES MODULE

**Purpose:** Track delivery and field expenses linked to sales dispatches.

#### Pages:
1. **Expense List Page**
   - Table: Expense No., Date, Type, Linked Invoice, Dispatcher, Amount, Created By
   - Filter: Date, Type, Invoice

2. **Create Expense Form (Dynamic)**

   **Common Fields:**
   - Expense Number (auto: EXP-YYYY-NNNN)
   - Expense Date *
   - Expense Type * → dropdown: **Courier / Travelling / Food** (this selection changes the rest of the form dynamically)
   - Linked Sales Invoice (optional, searchable)
   - Linked Dispatch (optional)

   **If Type = COURIER:**
   - Courier Service Name *
   - Dispatcher Name *
   - Number of Items / Packages
   - Weight (kg)
   - Courier Amount *
   - Receipt / Tracking No.

   **If Type = TRAVELLING:**
   - From Location (Point A) *
   - To Location (Point B) *
   - Mode of Travel (Two-Wheeler / Auto / Taxi / Train / Bus / Flight)
   - Purpose of Travel
   - Travel Amount *
   - Toll / Parking Amount
   - Return Trip (Yes/No)

   **If Type = FOOD:**
   - Meal Type (Breakfast / Lunch / Dinner / Snacks)
   - Number of People
   - Restaurant / Vendor Name
   - Description of meal
   - Food Amount *

   **Summary:**
   - Total Expense (auto-calculated sum of all above entries)
   - Notes / Remarks
   - Attach Receipt (image upload)
   - Created By

3. **Expense Detail Page**
   - Full expense record
   - Linked invoice/dispatch view
   - Receipt preview

---

### 4.9 PAYMENTS MODULE

**Purpose:** Track all money received from customers and sent to suppliers.

#### Pages:
1. **Payments Overview Page**
   - Two tabs: **Received** (from customers) | **Sent** (to suppliers)
   - Summary cards: Total Received, Total Sent, Net Position
   - Table: Payment No., Date, Party Name, Linked Invoice/Purchase, Mode, Amount, Reference No.

2. **Record Payment Received Form** (from Customer)
   - Payment Number (auto: PAY-RCV-YYYY-NNNN)
   - Payment Date *
   - Customer Name * (dropdown)
   - Select Invoice(s) to settle * — shows all pending invoices for that customer with outstanding amounts
   - Amount Received *
   - Payment Mode * (Cash / Bank Transfer / Cheque / UPI / NEFT / RTGS)
   - Reference Number (UTR / Cheque No. / Transaction ID)
   - Bank Account (your company's account it was received in)
   - Notes

   → On save: Invoice payment_status updates, balance_due recalculates

3. **Record Payment Sent Form** (to Supplier)
   - Payment Number (auto: PAY-SNT-YYYY-NNNN)
   - Payment Date *
   - Supplier Name *
   - Select Purchase(s) to settle *
   - Amount Sent *
   - Payment Mode
   - Reference Number
   - Notes

4. **Payment Detail Page**
   - Full record
   - Linked transactions

5. **Ledger View** (per Customer or Supplier)
   - Running balance sheet
   - All invoices and payments chronologically
   - Opening / Closing balance

6. **Ageing Report Page**
   - Filter: All / Customer / Supplier
   - Shows: Party Name, Total Outstanding, 0-30, 31-60, 61-90, 90+ days buckets
   - Export to Excel

---

### 4.10 DISPATCH MODULE

**Purpose:** Track all outgoing shipments for sales orders.

#### Pages:
1. **Dispatch List Page**
   - Table: Dispatch No., Sales Invoice No., Customer, Dispatch Date, Dispatcher, Tracking No., Status, Expected Delivery
   - Status filter: Pending / In-Transit / Delivered / Returned
   - Color-coded status badges

2. **Create / Edit Dispatch Form**
   - Dispatch Number (auto: DSP-YYYY-NNNN)
   - Linked Sales Invoice * (searchable)
   - Customer Name (auto-filled)
   - Dispatch Date *
   - Dispatcher / Courier Name *
   - Tracking / Docket Number
   - Vehicle Number
   - Driver Name
   - Driver Phone
   - From Address (warehouse — auto-filled)
   - To Address (customer address — auto-filled, editable)
   - Dispatch Status (Pending / Packed / Dispatched / In-Transit / Out for Delivery / Delivered / Failed / Returned)
   - Expected Delivery Date
   - Actual Delivery Date
   - Delivery Proof Upload (photo / POD document)
   - Notes / Remarks

3. **Dispatch Detail / Tracking Page**
   - Full dispatch record
   - Status timeline (visual step indicator)
   - Linked invoice
   - Expenses added for this dispatch
   - Update status button (quick action)

---

### 4.11 NOTIFICATIONS MODULE

**Purpose:** Alert system for payments, stock, and overdue items.

#### Pages:
1. **Notification List / Inbox Page**
   - All notifications grouped by type
   - Filter: All / Payment Due / Overdue / Low Stock / Return Alert
   - Badges: Unread count
   - Mark all as read

2. **Notification Types & Triggers:**

   | Notification | Trigger Condition | Message Example |
   |---|---|---|
   | Payment Due (3 days) | Due date is 3 days away | "Invoice INV-001 of ₹5,000 from Customer X is due in 3 days" |
   | Payment Due (Today) | Due date = today | "Payment due TODAY — INV-001, ₹5,000 from Customer X" |
   | Payment Overdue | Due date has passed, not paid | "OVERDUE: INV-001 is 5 days past due. ₹5,000 pending from Customer X" |
   | Critical Overdue | 30+ days overdue | "CRITICAL: INV-001 is 35 days overdue. ₹12,000 pending from Customer X" |
   | Low Stock Alert | Stock < min_stock_alert | "Product 'Item A' stock is low — only 3 units remaining" |
   | Out of Stock | Stock = 0 | "URGENT: Product 'Item B' is OUT OF STOCK" |
   | Purchase Return Due | Debit note not settled | "Purchase Return PR-001 debit note ₹2,000 pending from Supplier Y" |
   | Upcoming Supplier Payment | Purchase due soon | "Payment to Supplier Z due in 5 days — ₹8,000" |

3. **Notification Detail View**
   - Full context of alert
   - Quick action buttons: View Invoice, Record Payment, Create Purchase Order

4. **Notification Settings Page**
   - Configure: How many days before due to send reminder (3 days / 7 days / custom)
   - Enable/disable notification types
   - Notification channels: In-app / Email / WhatsApp (future)

---

## 5. INVOICE GENERATION & PDF FLOW

### 5.1 Invoice Structure (What Prints on PDF)

```
┌──────────────────────────────────────────────────────────┐
│  [COMPANY LOGO]          YOUR COMPANY NAME               │
│                          Address, City, State, PIN       │
│                          GSTIN: XXXX | Phone: XXXX       │
├──────────────────────────────────────────────────────────┤
│  TAX INVOICE                                             │
│  Invoice No: INV-2025-001    Date: 01-Jan-2025           │
│  Due Date: 31-Jan-2025                                   │
├─────────────────────────┬────────────────────────────────┤
│  BILL TO:               │  SHIP TO:                      │
│  Customer Name          │  Customer Name                 │
│  Company Name           │  Delivery Address              │
│  Address                │  City, State, PIN              │
│  GSTIN: XXXX            │                                │
├─────────────────────────┴────────────────────────────────┤
│  S.No │ Item │ HSN │ Qty │ Unit │ Rate │ GST% │ Amount  │
│  1    │ ...  │ ... │ ... │ ...  │ ...  │ ...  │ ...     │
│  2    │ ...  │ ... │ ... │ ...  │ ...  │ ...  │ ...     │
├──────────────────────────────────────────────────────────┤
│                               Subtotal:    ₹XX,XXX       │
│                               Discount:  - ₹X,XXX        │
│                               Taxable Amt: ₹XX,XXX       │
│                               CGST (9%):   ₹X,XXX        │
│                               SGST (9%):   ₹X,XXX        │
│                               ROUND OFF:   ₹0.XX         │
│                               TOTAL:      ₹XX,XXX        │
├──────────────────────────────────────────────────────────┤
│  Amount in Words: Rupees Twenty Five Thousand Only       │
├──────────────────────────────────────────────────────────┤
│  Dispatch Through: BlueDart    Tracking: BDxxx           │
│  Vehicle No: MH12AB1234                                  │
├──────────────────────────────────────────────────────────┤
│  Terms & Conditions:                                     │
│  1. Payment due within 30 days                           │
│  2. Goods once sold not returnable without prior notice  │
├──────────────────────────────────────────────────────────┤
│  Bank Details:                Account:                   │
│  Bank Name, Branch             IFSC:                     │
│  UPI: xxx@bankname            For: YOUR COMPANY NAME    │
│                                                          │
│                               Authorized Signatory       │
└──────────────────────────────────────────────────────────┘
```

### 5.2 PDF Generation Flow

```
User clicks "Generate PDF"
        │
        ▼
System compiles invoice data from DB
(customer + line items + totals + GST + dispatch)
        │
        ▼
Template engine applies company letterhead + data
        │
        ▼
GST split calculated:
  - Same state → CGST + SGST (split 50/50)
  - Different state → IGST (full)
        │
        ▼
Amount in words generated (in INR format)
        │
        ▼
PDF rendered (using library like jsPDF / Puppeteer / wkhtmltopdf)
        │
        ▼
PDF stored in server / offered as download
        │
        ▼
Optional: Share via WhatsApp / Email link
```

### 5.3 Invoice Numbering System
- Format: `INV-YYYY-NNNN` (e.g., INV-2025-0001)
- Auto-increments per financial year
- Resets each April (Indian FY)
- Purchase: `PUR-YYYY-NNNN`
- Dispatch: `DSP-YYYY-NNNN`
- Returns: `SR-YYYY-NNNN` / `PR-YYYY-NNNN`
- Payments: `PAY-RCV-YYYY-NNNN` / `PAY-SNT-YYYY-NNNN`
- Expenses: `EXP-YYYY-NNNN`

---

## 6. STOCK UPDATE LOGIC

```
INVENTORY STOCK LEDGER

Event: Purchase Created
  → For each line item:
      product.current_stock += quantity_purchased
      Log: { type: "Purchase", ref: PUR-001, qty_in: 50, date: today }

Event: Purchase Return Created (deduct_from_inventory = true)
  → For each returned item:
      product.current_stock -= quantity_returned
      Log: { type: "Purchase Return", ref: PR-001, qty_out: 10, date: today }

Event: Sales Invoice Created
  → For each line item:
      product.current_stock -= quantity_sold
      Log: { type: "Sale", ref: INV-001, qty_out: 5, date: today }
      → Check: if current_stock < min_stock_alert → fire Low Stock Notification

Event: Sales Return Created (restock_to_inventory = true)
  → For each returned item:
      product.current_stock += quantity_returned
      Log: { type: "Sales Return", ref: SR-001, qty_in: 2, date: today }
```

---

## 7. PAYMENT & AGEING LOGIC

### Payment Status Calculation (per Invoice):
```
balance_due = total_amount - amount_paid

if balance_due == 0:
    payment_status = "Paid"
elif balance_due > 0 and today <= due_date:
    payment_status = "Pending"
elif balance_due > 0 and today > due_date:
    payment_status = "Overdue"
elif amount_paid > 0 and balance_due > 0:
    payment_status = "Partial"
```

### Ageing Bucket Calculation:
```
days_outstanding = today - invoice_date

0–30 days   → Current
31–60 days  → 30+ Overdue
61–90 days  → 60+ Overdue
91+ days    → Critical Overdue
```

### Dashboard Profit/Loss View:
```
For each Sales Invoice:
  IF payment_status == "Paid":
      → Add to "Received Revenue" (confirmed profit)
  
  IF payment_status == "Pending" AND today <= due_date:
      → Add to "Expected Revenue" (within terms — safe)
  
  IF payment_status == "Overdue" OR (payment_status == "Pending" AND today > due_date):
      → Add to "At Risk / Potential Loss" bucket
      → Fire notification if not already sent
```

---

## 8. NOTIFICATION ENGINE LOGIC

```
Runs daily (or on page load) — checks all invoices:

FOR each unpaid/partial Sales Invoice:
    days_to_due = due_date - today
    days_overdue = today - due_date

    IF days_to_due == 7:
        create notification (type: "Due in 7 Days", severity: Info)
    
    IF days_to_due == 3:
        create notification (type: "Due in 3 Days", severity: Warning)
    
    IF days_to_due == 0:
        create notification (type: "Due Today", severity: Warning)
    
    IF days_overdue > 0:
        create notification (type: "Overdue", severity: Critical)
        message: "Invoice INV-XXXX is {days_overdue} days overdue. ₹{balance_due} pending from {customer_name}"

FOR each Product:
    IF current_stock <= min_stock_alert:
        create notification (type: "Low Stock", severity: Warning)
    IF current_stock == 0:
        create notification (type: "Out of Stock", severity: Critical)

Deduplication: Don't create duplicate notifications for same invoice on same day
```

---

## 9. FORMS SUMMARY

| Module | Form Name | Key Fields |
|--------|-----------|------------|
| Inventory | Add/Edit Product | Name, SKU, Unit, Stock, Price, GST, HSN |
| Companies | Add/Edit Supplier | Name, Contact, GSTIN, Payment Terms, Products + Rates |
| Customers | Add/Edit Customer | Name, Phone, Address, GSTIN, Payment Terms, Credit Limit |
| Sales | Create Invoice | Invoice No., Customer, Line Items, Discount, Dispatch, Notes |
| Purchase | Create Purchase | Purchase No., Supplier Invoice, Supplier, Line Items, Dispatch |
| Sales Return | Create Return | Link Invoice, Select Items, Qty, Reason, Refund Type |
| Purchase Return | Create Return | Link Purchase, Select Items, Qty, Reason, Debit Note |
| Expenses | Add Expense (Dynamic) | Type → Courier / Travelling / Food specific fields |
| Payments | Record Received | Customer, Invoice(s), Amount, Mode, Reference |
| Payments | Record Sent | Supplier, Purchase(s), Amount, Mode, Reference |
| Dispatch | Create Dispatch | Link Invoice, Courier, Tracking, Addresses, Status |
| Notifications | Settings | Reminder days, notification types, channels |

---

## 10. INTER-MODULE RELATIONSHIPS

```
Companies (Supplier)
    │
    ├── Purchase ──────────────────► Inventory (+stock)
    │       │
    │       ├── Purchase Return ──► Inventory (-stock)
    │       │
    │       └── Payment Sent ──────► Payment Module
    │
    └── Notification (payment due/overdue to supplier)


Customers
    │
    ├── Sales ──────────────────────► Inventory (-stock)
    │       │
    │       ├── Sales Return ───────► Inventory (+stock)
    │       │
    │       ├── Dispatch ───────────► Dispatch Module
    │       │       │
    │       │       └── Expenses ──► Expense Module
    │       │
    │       └── Payment Received ──► Payment Module
    │
    └── Notification (payment due/overdue from customer)


Dashboard ◄──── aggregates all of the above
```

---

## APPENDIX: TECHNOLOGY RECOMMENDATIONS

### Frontend:
- React.js / Next.js
- Tailwind CSS for styling
- React Hook Form + Zod for form validation
- React Query for data fetching
- Recharts / Chart.js for dashboard charts

### Backend:
- Node.js with Express OR Django REST Framework
- PostgreSQL (relational DB — suits this linked data model well)
- Redis (for notification scheduling)

### PDF Generation:
- **Option A:** Puppeteer (HTML → PDF, best quality)
- **Option B:** jsPDF + jspdf-autotable (client-side, no server needed)
- **Option C:** React-PDF (component-based PDF)

### File Storage:
- AWS S3 / Cloudflare R2 (for delivery proofs, receipts, product images)

### Notifications:
- Cron job (daily run) OR event-triggered (on save)
- WhatsApp integration: Twilio / WATI API (Phase 2)
- Email: Nodemailer / SendGrid

---

*Document Version: 1.0 | Prepared for: Business Management System*
*Total Modules: 11 | Total Forms: 14+ | Total Data Entities: 11*
