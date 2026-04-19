#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, log};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,           // The LGU/NGO address
    Student(Address), // Maps student address to scholarship status
    EscrowBalance,   // Track total available funds
}

#[contract]
pub struct ScholarAidContract;

#[contractimpl]
impl ScholarAidContract {
    /// Initializes the contract with an admin (LGU/NGO)
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Admin pre-approves a student by hashing their credential and linking their wallet.
    /// This prevents duplicate claims and ensures only verified students can apply.
    pub fn register_student(env: Env, student: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Student(student.clone())) {
            panic!("Student already registered");
        }

        // Set status to 1 (Verified/Eligible)
        env.storage().persistent().set(&DataKey::Student(student), &1u32);
    }

    /// The core MVP function: Student claims their scholarship.
    /// Logic: Checks eligibility status -> Releases funds from escrow -> Marks as paid.
    pub fn claim_scholarship(env: Env, student: Address, amount: i128) {
        student.require_auth();

        let status: u32 = env.storage().persistent()
            .get(&DataKey::Student(student.clone()))
            .unwrap_or(0);

        // 0 = Not found, 1 = Eligible, 2 = Already Paid
        if status == 0 { panic!("Not eligible for scholarship"); }
        if status == 2 { panic!("Scholarship already disbursed"); }

        // Logic for internal fund release (Simulated for MVP disbursement)
        // In production, this would call the token client to transfer USDC/XLM
        log!(&env, "Disbursing funds to student", amount);

        // Update status to Paid (2) to prevent double-spending
        env.storage().persistent().set(&DataKey::Student(student), &2u32);
        
        env.events().publish((symbol_short!("PAID"),), amount);
    }

    /// Returns the current status of a student's scholarship claim
    pub fn verify_status(env: Env, student: Address) -> u32 {
        env.storage().persistent().get(&DataKey::Student(student)).unwrap_or(0)
    }
}

#[derive(Clone, Copy)]
pub enum ScholarshipType {
    FullTuition,
    Stipend,
    OneTimeGrant,
}

#[contractimpl]
impl ScholarshipContract {
    pub fn claim_scholarship(env: Env, student_address: BytesN<32>, scholarship_id: Symbol, scholarship_type: ScholarshipType, signature: BytesN<64>, server_public_key: BytesN<32>) -> Result<(), Error> {
        // Verify signature
        let message = format!("{}:{}", student_address.to_string(), scholarship_id.to_string()).into_bytes();
        let is_valid = env.crypto().ed25519_verify(&server_public_key, &Bytes::from_slice(&env, &message), &signature);
        if !is_valid {
            panic!("Invalid signature");
        }

        let storage = env.storage().persistent();
        let key = Symbol::new(&env, "student_claims");
        let mut claims: Map<BytesN<32>, Vec<ScholarshipType>> = storage.get(&key).unwrap_or(Map::new(&env));
        
        let student_claims = claims.get(student_address).unwrap_or(Vec::new(&env));
        if scholarship_type == ScholarshipType::FullTuition && student_claims.contains(&ScholarshipType::FullTuition) {
            panic!("Cannot claim multiple FullTuition grants");
        }
        // Allow stacking Stipends and OneTimeGrants
        
        student_claims.push_back(scholarship_type);
        claims.set(student_address, student_claims);
        storage.set(&key, &claims);
        
        // ...existing claim logic...
        Ok(())
    }
}