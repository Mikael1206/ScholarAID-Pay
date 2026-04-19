# ScholarAid Pay Smart Contract

A Soroban smart contract deployed on the Stellar testnet for managing scholarship disbursements. This contract enables Local Government Units (LGUs) or NGOs to register eligible students and allows verified students to claim their scholarships securely.

## Overview

ScholarAid Pay is a decentralized scholarship disbursement system built on Stellar/Soroban, designed to eliminate weeks-long payout delays for Filipino students. By utilizing blockchain technology, it enables secure, transparent, and instant fund transfers directly to eligible students' wallets, integrating AI eligibility checks and stacking logic to prevent fraud and ensure fair access to educational support.

The ScholarAid Pay contract implements a simple yet secure scholarship disbursement system:

- **Admin Registration**: LGU/NGO initializes the contract and registers eligible students
- **Student Claims**: Verified students can claim their scholarships
- **Status Verification**: Check scholarship claim status
- **Event Logging**: All disbursements are logged as events

## Contract Functions

### Initialization

#### `init(env: Env, admin: Address)`
Initializes the contract with an admin address (LGU/NGO).

**Parameters:**
- `admin`: The Stellar address of the administering entity

**Requirements:**
- Can only be called once
- Sets the admin who can register students

### Student Management

#### `register_student(env: Env, student: Address)`
Admin registers an eligible student for scholarship disbursement.

**Parameters:**
- `student`: The Stellar address of the eligible student

**Requirements:**
- Must be called by the admin
- Student must not already be registered
- Sets student status to "Eligible" (1)

#### `verify_status(env: Env, student: Address) -> u32`
Returns the current scholarship status of a student.

**Parameters:**
- `student`: The Stellar address to check

**Returns:**
- `0`: Not registered/eligible
- `1`: Eligible for scholarship
- `2`: Scholarship already disbursed

### Scholarship Claims

#### `claim_scholarship(env: Env, student: Address, amount: i128)`
Student claims their scholarship funds.

**Parameters:**
- `student`: The claiming student's Stellar address
- `amount`: The scholarship amount to disburse

**Requirements:**
- Must be called by the student themselves
- Student must be eligible (status = 1)
- Prevents double-claiming

**Events:**
- Publishes a "PAID" event with the disbursement amount

## Data Storage

The contract uses persistent storage with the following keys:

- `DataKey::Admin`: Stores the admin address
- `DataKey::Student(address)`: Maps each student address to their status (0, 1, or 2)
- `DataKey::EscrowBalance`: Reserved for future fund tracking

## Deployment

The contract is deployed on Stellar testnet. Contract ID: [Insert your contract ID here]

### Build Instructions

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

### Deploy Instructions

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholaraid_pay.wasm \
  --source your-keypair \
  --network testnet
```

## Usage Examples

### Initialize Contract (Admin)
```bash
stellar contract invoke \
  --id <contract-id> \
  --source admin-keypair \
  --network testnet \
  -- \
  init \
  --admin "GABC..."
```

### Register Student (Admin)
```bash
stellar contract invoke \
  --id <contract-id> \
  --source admin-keypair \
  --network testnet \
  -- \
  register_student \
  --student "GXYZ..."
```

### Claim Scholarship (Student)
```bash
stellar contract invoke \
  --id <contract-id> \
  --source student-keypair \
  --network testnet \
  -- \
  claim_scholarship \
  --student "GXYZ..." \
  --amount 10000000
```

### Check Status
```bash
stellar contract invoke \
  --id <contract-id> \
  --network testnet \
  -- \
  verify_status \
  --student "GXYZ..."
```

## Security Considerations

- **Authorization**: Only admin can register students, only students can claim their own scholarships
- **Double-spend Prevention**: Status tracking prevents multiple claims
- **Event Logging**: All transactions are logged for auditability
- **Testnet Only**: Currently deployed on testnet for development

## Future Enhancements

- Token integration for actual fund transfers
- Escrow balance tracking
- Batch student registration
- Scholarship amount limits per student
- Time-based claim windows

## Testing

Run the contract tests:

```bash
cd contract
cargo test
```

### Test Cases

- **Happy Path**: Admin registers student, student claims scholarship successfully
- **Duplicate Registration**: Prevents registering the same student twice
- **State Verification**: Checks status returns correct values
- **Authorization**: Ensures only admin can register, only student can claim

## License

[Add your license here]