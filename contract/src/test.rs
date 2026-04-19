#![cfg(test)]
use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env};

#[test]
fn test_happy_path_claim() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ScholarAidContract);
    let client = ScholarAidContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);

    client.init(&admin);
    
    // Admin registers student
    env.mock_all_auths();
    client.register_student(&student);

    // Student claims funds
    client.claim_scholarship(&student, &5000);

    // Verify state: status should be 2 (Paid)
    assert_eq!(client.verify_status(&student), 2);
}

#[test]
#[should_panic(expected = "Student already registered")]
fn test_duplicate_registration_fails() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ScholarAidContract);
    let client = ScholarAidContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);

    client.init(&admin);
    env.mock_all_auths();
    
    client.register_student(&student);
    client.register_student(&student); // Should panic here
}

#[test]
fn test_state_verification() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ScholarAidContract);
    let client = ScholarAidContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);

    client.init(&admin);
    env.mock_all_auths();
    
    client.register_student(&student);
    
    // Assert student is registered (status 1) but not yet paid
    assert_eq!(client.verify_status(&student), 1);
}