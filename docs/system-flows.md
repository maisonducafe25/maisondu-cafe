# POS System Flows

## 1. Cashier & Customer Flow
This flow describes how a cashier interacts with the POS while serving a customer.

### Steps
1. Customer Orders

    - Cashier selects menu items from the POS interface.

    - POS shows real-time stock availability.

2. Order Confirmation

    - Customer confirms order; cashier reviews cart.

    - Discounts or promos applied (if any).

3. Payment Processing

    - Cashier selects payment method (cash, card, e-wallet).

    - POS calculates total, including tax.

    - Payment confirmed.

4. Receipt Printing

    - POS triggers receipt printer.

    - Cash drawer opens (if cash transaction).

5. Order Completed

- Inventory automatically deducts sold items.

- Transaction is stored in database.

### Edge Cases

- **Item Out of Stock** → POS blocks adding item and suggests alternatives.

- **Payment Failure** → Transaction canceled, no inventory deduction, prompt to retry.

- **Receipt Printer Offline** → POS logs error and provides re-print option later.

- **Cash Drawer Fails** → Alert admin and record in error logs.

- **Customer Cancels Order Mid-Transaction** → POS rolls back items and payments.

## 2. Inventory Flow
Covers how stock is tracked, updated, and deducted automatically.

### Steps
1. Stock In (Receiving Inventory)

    - Admin enters new stock via POS dashboard.

    - Each item recorded in InventoryLogs.

2. Stock Out (Sales or Wastage)

    - Each completed sale auto-deducts items.

    - Admin can also manually adjust for spoilage/waste.

3. Low-Stock Alerts

    - System monitors item thresholds.

    - POS dashboard highlights low-stock items.

    - Optionally send notification to admin.

### Edge Cases

- **Negative Stock** → POS blocks transaction and alerts admin.

- **Duplicate Stock Entry** → System validates supplier batch IDs.

- **Manual Adjustment Error** → System logs all adjustments with reason + admin ID.

- **Inventory Sync Issue** → Offline transactions queue until connection restored.

## 3. Reporting Flow
Generates sales and inventory reports for management.

### Steps

1. Daily Reports

    - End-of-day summary: total sales, top items, remaining stock.

2. Weekly & Monthly Reports

    - Aggregated data for trend analysis.

    - Export to CSV/PDF.

3. Custom Range Reports

    - Admin selects date range.

    - POS generates report dynamically.

### Edge Cases

- **Report Generation Timeout** → System retries or notifies admin.

- **No Data Available** → POS shows empty report with “No records found.”

- **Incorrect Date Range Input** → POS validates start/end date before processing.

## 4. User Management Flow
Manages role-based access (Admin vs Cashier).

### Steps

1. Login

    - User enters username/password.

    - Authentication via secure session (NextAuth).

2. Role Assignment

    - **Admin**: full access to inventory, reports, and user accounts.

    - **Cashier**: limited to sales transactions only.

3. Logout

    - Ends session securely.

4. Password Reset

    - Admin can reset cashier accounts.

    - Optional: self-service password reset via email.

### Edge Cases

- **Incorrect Login Attempt** → System locks account after X tries.

- **Unauthorized Access Attempt** → Access denied with alert logged.

- **Forgotten Password** → Requires admin reset or secure token link.

- **Session Timeout** → Auto logout after inactivity.

## 5. Backup & Restore Flow

Ensures business continuity by protecting data.

### Steps

1. Automated Backup

    - Automated Backup

    - POS runs scheduled backups (daily or weekly).

    - Backups stored locally + optionally in cloud.

2. Manual Backup

    - Admin can trigger backup anytime.

3. Restore Process

    - Admin selects backup file.

    - POS restores DB while preserving integrity.

### Edge Cases

  - Backup Fails → POS logs error, notifies admin.

  - Restore Fails → Rollback to last known good backup.

  - Partial Restore (corrupt file) → System validates checksum before restore.

  - Insufficient Storage → Admin notified to free space before backup.