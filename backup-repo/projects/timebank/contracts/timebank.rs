use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

// Timebank Smart Contract
// Soulbound TimeTokens for mutual aid economy

declare_id!("TBnk111111111111111111111111111111111111111");

#[program]
pub mod timebank {
    use super::*;

    // Initialize a new Timebank community
    pub fn initialize_community(
        ctx: Context<InitializeCommunity>,
        name: String,
        region: String,
        expiration_months: u8,
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let treasury = &mut ctx.accounts.treasury;
        
        community.name = name;
        community.region = region;
        community.expiration_months = expiration_months;
        community.admin = ctx.accounts.admin.key();
        community.treasury = treasury.key();
        community.member_count = 0;
        community.total_hours_exchanged = 0;
        community.created_at = Clock::get()?.unix_timestamp;
        
        // Initialize treasury
        treasury.balance = 0;
        treasury.community = community.key();
        
        msg!("Community initialized: {}", community.name);
        Ok(())
    }

    // Register as a service provider
    pub fn register_provider(
        ctx: Context<RegisterProvider>,
        skills: Vec<Skill>,
    ) -> Result<()> {
        let provider = &mut ctx.accounts.provider;
        let community = &mut ctx.accounts.community;
        
        provider.owner = ctx.accounts.owner.key();
        provider.community = community.key();
        provider.skills = skills;
        provider.reputation_score = 500; // Start at 500/1000
        provider.total_hours_provided = 0;
        provider.total_hours_received = 0;
        provider.is_active = true;
        provider.created_at = Clock::get()?.unix_timestamp;
        
        // Increment community member count
        community.member_count += 1;
        
        msg!("Provider registered: {}", provider.owner);
        Ok(())
    }

    // Request a service
    pub fn request_service(
        ctx: Context<RequestService>,
        skill_required: String,
        duration_estimate: u16, // in 15-min increments
        description: String,
    ) -> Result<()> {
        let request = &mut ctx.accounts.service_request;
        let requester = &ctx.accounts.requester;
        
        request.requester = requester.key();
        request.community = ctx.accounts.community.key();
        request.skill_required = skill_required;
        request.duration_estimate = duration_estimate;
        request.description = description;
        request.status = RequestStatus::Open;
        request.created_at = Clock::get()?.unix_timestamp;
        
        // Escrow tokens from requester
        // (They must have enough TimeTokens)
        
        msg!("Service requested: {}", description);
        Ok(())
    }

    // Accept a service request
    pub fn accept_service(
        ctx: Context<AcceptService>,
        request_id: Pubkey,
    ) -> Result<()> {
        let request = &mut ctx.accounts.service_request;
        let provider = &ctx.accounts.provider;
        
        require!(
            request.status == RequestStatus::Open,
            ErrorCode::RequestNotOpen
        );
        
        request.provider = Some(provider.owner);
        request.status = RequestStatus::Accepted;
        request.accepted_at = Clock::get()?.unix_timestamp;
        
        msg!("Service accepted by: {}", provider.owner);
        Ok(())
    }

    // Complete service and mint TimeTokens
    pub fn complete_service(
        ctx: Context<CompleteService>,
        actual_duration: u16,
        rating: u8, // 1-5
    ) -> Result<()> {
        let request = &mut ctx.accounts.service_request;
        let provider = &mut ctx.accounts.provider;
        let requester = &mut ctx.accounts.requester_data;
        let community = &mut ctx.accounts.community;
        
        require!(
            request.status == RequestStatus::Accepted,
            ErrorCode::RequestNotAccepted
        );
        
        // Calculate TimeTokens (15 min = 1 token)
        let tokens_to_mint = actual_duration;
        
        // Mint soulbound TimeTokens to provider
        // (Non-transferable, expires after X months)
        
        // Update stats
        provider.total_hours_provided += actual_duration;
        requester.total_hours_received += actual_duration;
        community.total_hours_exchanged += actual_duration;
        
        // Update reputation scores
        update_reputation(provider, requester, rating);
        
        request.status = RequestStatus::Completed;
        request.completed_at = Clock::get()?.unix_timestamp;
        request.actual_duration = actual_duration;
        
        msg!(
            "Service completed. Minted {} TimeTokens to {}",
            tokens_to_mint,
            provider.owner
        );
        Ok(())
    }

    // Raise a dispute
    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        request_id: Pubkey,
        evidence: String,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        let request = &ctx.accounts.service_request;
        
        dispute.request = request_id;
        dispute.raised_by = ctx.accounts.raiser.key();
        dispute.evidence = evidence;
        dispute.status = DisputeStatus::Pending;
        dispute.created_at = Clock::get()?.unix_timestamp;
        
        // Stake dispute fee (loser pays)
        
        msg!("Dispute raised for request: {}", request_id);
        Ok(())
    }

    // Resolve dispute (community jurors)
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        verdict: Verdict,
    ) -> Result<()> {
        let dispute = &mut ctx.accounts.dispute;
        
        require!(
            dispute.status == DisputeStatus::Pending,
            ErrorCode::DisputeNotPending
        );
        
        dispute.verdict = Some(verdict.clone());
        dispute.status = DisputeStatus::Resolved;
        dispute.resolved_at = Clock::get()?.unix_timestamp;
        
        // Apply penalties/rewards based on verdict
        match verdict {
            Verdict::ProviderWins => {
                // Release escrow to provider
                // Penalize requester
            }
            Verdict::RequesterWins => {
                // Return escrow to requester
                // Penalize provider
            }
            Verdict::Split => {
                // Split escrow
            }
        }
        
        msg!("Dispute resolved: {:?}", verdict);
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

#[account]
pub struct Community {
    pub name: String,
    pub region: String,
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub expiration_months: u8,
    pub member_count: u32,
    pub total_hours_exchanged: u64,
    pub created_at: i64,
}

#[account]
pub struct Provider {
    pub owner: Pubkey,
    pub community: Pubkey,
    pub skills: Vec<Skill>,
    pub reputation_score: u16, // 0-1000
    pub total_hours_provided: u32,
    pub total_hours_received: u32,
    pub is_active: bool,
    pub created_at: i64,
}

#[account]
pub struct ServiceRequest {
    pub requester: Pubkey,
    pub provider: Option<Pubkey>,
    pub community: Pubkey,
    pub skill_required: String,
    pub description: String,
    pub duration_estimate: u16,
    pub actual_duration: u16,
    pub status: RequestStatus,
    pub created_at: i64,
    pub accepted_at: Option<i64>,
    pub completed_at: Option<i64>,
}

#[account]
pub struct Dispute {
    pub request: Pubkey,
    pub raised_by: Pubkey,
    pub evidence: String,
    pub status: DisputeStatus,
    pub verdict: Option<Verdict>,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Skill {
    pub category: SkillCategory,
    pub name: String,
    pub description: String,
    pub verification_required: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum SkillCategory {
    Technical,
    Professional,
    Creative,
    Physical,
    Educational,
    Caregiving,
    Transportation,
    Wellness,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum RequestStatus {
    Open,
    Accepted,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum DisputeStatus {
    Pending,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Verdict {
    ProviderWins,
    RequesterWins,
    Split,
}

// ═══════════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════════

#[derive(Accounts)]
pub struct InitializeCommunity<'info> {
    #[account(init, payer = admin, space = 8 + 200)]
    pub community: Account<'info, Community>,
    #[account(init, payer = admin, space = 8 + 100)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterProvider<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(init, payer = owner, space = 8 + 500)]
    pub provider: Account<'info, Provider>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestService<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(init, payer = requester, space = 8 + 300)]
    pub service_request: Account<'info, ServiceRequest>,
    #[account(mut)]
    pub requester: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptService<'info> {
    #[account(mut)]
    pub service_request: Account<'info, ServiceRequest>,
    pub provider: Account<'info, Provider>,
}

#[derive(Accounts)]
pub struct CompleteService<'info> {
    #[account(mut)]
    pub service_request: Account<'info, ServiceRequest>,
    #[account(mut)]
    pub provider: Account<'info, Provider>,
    #[account(mut)]
    pub requester_data: Account<'info, Provider>, // Requester's provider account
    #[account(mut)]
    pub community: Account<'info, Community>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    pub service_request: Account<'info, ServiceRequest>,
    #[account(init, payer = raiser, space = 8 + 300)]
    pub dispute: Account<'info, Dispute>,
    #[account(mut)]
    pub raiser: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub dispute: Account<'info, Dispute>,
    #[account(mut)]
    pub service_request: Account<'info, ServiceRequest>,
}

#[account]
pub struct Treasury {
    pub community: Pubkey,
    pub balance: u64,
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

fn update_reputation(provider: &mut Provider, requester: &mut Provider, rating: u8) {
    // Rating 1-5
    // 5 = +50 points, 4 = +30, 3 = +10, 2 = -10, 1 = -30
    let change = match rating {
        5 => 50,
        4 => 30,
        3 => 10,
        2 => -10,
        1 => -30,
        _ => 0,
    };
    
    provider.reputation_score = (provider.reputation_score as i16 + change).clamp(0, 1000) as u16;
    
    // Requester also gets small boost for completing transaction
    requester.reputation_score = (requester.reputation_score + 5).min(1000);
}

// ═══════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════

#[error_code]
pub enum ErrorCode {
    #[msg("Request is not open")]
    RequestNotOpen,
    #[msg("Request is not accepted")]
    RequestNotAccepted,
    #[msg("Dispute is not pending")]
    DisputeNotPending,
    #[msg("Insufficient reputation")]
    InsufficientReputation,
    #[msg("Skill not verified")]
    SkillNotVerified,
}

