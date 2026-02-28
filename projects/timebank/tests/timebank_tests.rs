use anchor_lang::prelude::*;
use timebank::program::Timebank;
use timebank::{Community, Provider, ServiceRequest};

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::solana_program::system_program;
    use solana_program_test::*;
    use solana_sdk::{signature::Keypair, signer::Signer};

    #[tokio::test]
    async fn test_initialize_community() {
        let program = ProgramTest::new("timebank", timebank::ID, processor!(timebank::entry));
        let (mut banks_client, payer, recent_blockhash) = program.start().await;

        let community_keypair = Keypair::new();
        let treasury_keypair = Keypair::new();

        // Initialize community
        let tx = Transaction::new_signed_with_payer(
            &[timebank::instruction::initialize_community(
                timebank::ID,
                community_keypair.pubkey(),
                treasury_keypair.pubkey(),
                payer.pubkey(),
                "Test Community".to_string(),
                "Global".to_string(),
                12,
            )],
            Some(&payer.pubkey()),
            &[&payer,
                &community_keypair,
                &treasury_keypair,
            ],
            recent_blockhash,
        );

        banks_client.process_transaction(tx).await.unwrap();

        // Verify community was created
        let community_account = banks_client
            .get_account(community_keypair.pubkey())
            .await
            .unwrap()
            .unwrap();
        
        let community = Community::try_deserialize(&mut community_account.data.as_ref()
        ).unwrap();
        
        assert_eq!(community.name, "Test Community");
        assert_eq!(community.region, "Global");
        assert_eq!(community.expiration_months, 12);
        assert_eq!(community.admin, payer.pubkey());
    }

    #[tokio::test]
    async fn test_register_provider() {
        // Test provider registration
        // Verify skills are stored correctly
        // Verify reputation starts at 500
    }

    #[tokio::test]
    async fn test_request_service() {
        // Test service request creation
        // Verify tokens are escrowed
        // Verify status is Open
    }

    #[tokio::test]
    async fn test_complete_service() {
        // Test service completion
        // Verify TimeTokens are minted
        // Verify reputation updates
    }

    #[tokio::test]
    async fn test_dispute_resolution() {
        // Test dispute creation
        // Test voting mechanism
        // Test verdict application
    }
}

