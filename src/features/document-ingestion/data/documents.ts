// Raw text fetched from the internal Google Drive document library (Step 9.1), one entry per
// approved document per the visibility classification confirmed with the user on 2026-07-22.
// Text is as-fetched (Drive's markdown export leaves stray backslash-escapes like \_ and \# --
// scripts/ingest-internal-docs.ts strips those before chunking, not this file).
export type InternalDocumentEntity = "residential" | "home-services";
export type InternalDocumentVisibility = "public" | "agent" | "internal";
export type InternalDocumentAudience = "consumer" | "agent" | "staff";

export interface InternalDocument {
  id: string;
  title: string;
  entity: InternalDocumentEntity;
  visibility: InternalDocumentVisibility;
  audience: InternalDocumentAudience;
  text: string;
}

export const INTERNAL_DOCUMENTS: InternalDocument[] = [
  // --- Public tier: fatwas + Sharia board letter (authoritative source docs) -----------------
  {
    id: "fatwa-main-program",
    title: "Fatwa on the Declining Balance Co-Ownership Home Acquisition Program",
    entity: "residential",
    visibility: "public",
    audience: "consumer",
    text: `We, the Shari'ah Supervisory Board of Guidance Financial Group, LLC (Guidance) have examined the documents of the Declining Balance Co-Ownership Home Acquisition Programs, inclusive of the Co-Ownership Agreement, Security Instrument, Consumer's Obligation to Pay, and Assignment of Agreements, all of which are required for each program. We have reviewed these documents and the purposes for which they have been designed, namely: 1. to assist Muslims and others residing in the United States of America to acquire their homes in compliance with Shari'ah, 2. to enjoy the tax benefits accorded by the federal government to home owners, 3. and for the investors to securitize their ownership investment in homes. The basic concept behind these contracts and documents is that the property is purchased in joint ownership between an affiliate of Guidance (the Co-Owner) and the person who requires finance (the Consumer). The Consumer makes monthly payments which are comprised of Profit Payments and Acquisition Payments. Profit Payments represent the Consumer payments for the enjoyment and use of the whole property, while Acquisition Payments represent the Consumer's payments for his acquiring the Co-Owner's interest in the property.

It has been ascertained by the Shari'ah Supervisory Board that the documents comply with the Shari'ah requirement for a valid "Diminishing Musharakah" arrangement, and that both parties benefit and bear the risks of their respective shares in the property throughout the contractual arrangement.

The documents designed for "Replacement" are meant for a situation where a person has already acquired a property and wishes to enter into a Shari'ah compliant arrangement. In this case, he will sell a share of his property to the Co-Owner, and then both parties will have the same arrangement of "Diminishing Musharakah" as detailed above. Since the units of property will be purchased by the consumer under this arrangement at cost, and without increase, there is no element of 'ina in this arrangement.

After reviewing the mechanism as well as the agreements and documents, and after suggesting amendments that have been incorporated, the Shari'ah Supervisory Board is of the view that given the circumstances prevailing in the United States, this arrangement conforms to the rules and principles of Shari'ah; and therefore, Muslims may avail themselves of this opportunity to acquire homes and properties by means of this method.

Agreed this 21st of October 2002 by Justice Muhammad Taqi Usmani, Dr. Abdul Sattar Abu Ghuddah, Shaykh Nizam Yaquby, Shaykh Yusuf Talal DeLorenzo, Dr. Mohamed Elgari, and Dr. Muhammad Imran Usmani.`,
  },
  {
    id: "fatwa-adjustable-program",
    title: "Fatwa on the Adjustable Profit Payment Declining Balance Co-Ownership Program",
    entity: "residential",
    visibility: "public",
    audience: "consumer",
    text: `GUIDANCE FINANCIAL GROUP PRONOUNCEMENT OF THE SHARIAH SUPERVISORY BOARD ADJUSTABLE PROFIT PAYMENT DECLINING BALANCE CO-OWNERSHIP PROGRAM

The Shariah Supervisory Board of Guidance Financial Group ("Guidance") has reviewed the structure and examined the legal documentation of the Adjustable Profit Payment version of the Declining Balance Co-ownership Program (the "Program").

The payments by the Consumer for the use of the Co-owner's share in the property are termed in the agreements as "Profit Payments". The principle of long term Ijarah, as determined by the Shariah standards, is that after determining the rent for an initial period in lump sum, the amount payable for next periods may be tied up with a well-known benchmark with a floor and ceiling. On the basis of this principle, the Profit Payments are determined by a formula that utilizes a Profit Factor. The Profit Factor itself is based on a widely-established market index, such as the yield on U.S. Treasury securities. After being predetermined for an initial period, Profit Payments are adjusted annually to reflect changes in the Profit Factor. Additionally, the Program sets limits to the amount by which the Profit Factor can rise or fall from year to year and sets an overall ceiling above which the Profit Factor may not rise.

In the absence of an Islamic alternative, the use of a conventional market index to determine the Profit Factor does not change the nature of the transaction or affect its compliance with the principles of Shariah. Furthermore, this Program is not subject to the ills of jahalah and gharar. The well-established nature of the index eliminates the potential for disputes and the presence of upper and lower limits on Profit Payments eliminates the parties' exposure to widely unforeseen loss.

The Shariah Supervisory Board is of the opinion that, given prevailing circumstances, the structure and documents governing the Adjustable Profit Payment version of the Program conform with the principles of Shariah.

Agreed this 15th of Dhul-Hijjah 1425 / 25th of January 2005, by Justice (Ret.) Muhammad Taqi Usmani, Dr. Abdul Sattar Abu Ghuddah, Shaykh Nizam Yaquby, Dr. Mohd. Daud Bakar, Shaykh Yusuf Talal DeLorenzo, and Dr. Muhammad Imran Usmani.`,
  },
  {
    id: "fatwa-disclosures",
    title: "Fatwa on Required Disclosures",
    entity: "residential",
    visibility: "public",
    audience: "consumer",
    text: `We, the Shari'ah Supervisory Board of Guidance Financial Group, LLC understand that state and federal government agencies, including the Federal Reserve Board and the Internal Revenue Service, require home finance companies to provide to consumers various disclosures and representations. Such disclosures refer to the terms "loan" and "interest," require the calculation of an annual percentage rate to allow the comparison of one financier to another, and have not been approved by the government for modification to reflect Islamic transactions in which interest is not present. Such disclosures do not constitute the Islamic contract to which the Consumer is committing. Therefore, the Shari'ah Supervisory Board does not object to the Company providing such disclosures to the Consumer. The Board further does not find that such disclosures, with their references to "interest" for the reporting of tax and other disclosure purposes only, corrupt or invalidate the Shari'ah documents to which the Consumer is committing. The Board encourages Guidance Financial Group to work with the various state and federal agencies to modify the documents in such a way as to reflect the interest-free transactions offered by the Company.

Agreed this 21st of October 2002 by Justice Muhammad Taqi Usmani, Dr. Abdul Sattar Abu Ghuddah, Shaykh Nizam Yaquby, Shaykh Yusuf Talal DeLorenzo, Dr. Mohamed Elgari, and Dr. Muhammad Imran Usmani.`,
  },
  {
    id: "fatwa-title-registration",
    title: "Fatwa on Title Registration",
    entity: "residential",
    visibility: "public",
    audience: "consumer",
    text: `We, the Shari'ah Supervisory Board of Guidance Financial Group, LLC understand that, when replacing a conventional mortgage loan with a Co-Ownership Agreement, the Consumer may face significant tax disadvantages related to recording the sale of an ownership stake in the property to the Co-Owner. Under Shari'ah, the sale of an ownership stake in the property takes effect upon the offer and acceptance through signing of the Co-Ownership Agreement if it practically and legally transfers all rights and obligations previously held by the consumer on a joint-ownership basis, even though the title is not registered in the name of the Co-Owner. Accordingly the practice of not recording title is accepted by Shari'ah so long as it is permissible under local law and custom.

Agreed this 21st of October 2002 by Justice Muhammad Taqi Usmani, Dr. Abdul Sattar Abu Ghuddah, Shaykh Nizam Yaquby, Shaykh Yusuf Talal DeLorenzo, Dr. Mohamed Elgari, and Dr. Muhammad Imran Usmani.`,
  },
  {
    id: "sharia-board-letter",
    title: "Greetings from the Sharia Supervisory Board",
    entity: "residential",
    visibility: "public",
    audience: "consumer",
    text: `For myself, and on behalf of the other members of the independent Shari'ah Supervisory Board of Guidance Financial Group, I wish you peace, prosperity and blessings in this world and the next.

Muslims across North America have experienced difficulties in managing their money matters in accordance with Shari'ah. In the absence of viable Islamic alternatives, most Muslims have opted, out of necessity, to use conventional financial products and services for their short and long term financial needs. Even so, many Muslims, sensitive to the clear prohibitions against riba, have attempted to limit their exposure to interest-based finance.

Scholars, like those of us who serve on the Guidance Shari'ah Supervisory Board, have worked hard in recent decades to revive the traditional role of Shari'ah in finance. Around the world, great strides forward are being made. Shari'ah-compliant businesses and financial service providers are now operating in almost every Muslim majority country, and in many countries where Muslims are a minority as well.

The intention of our Shari'ah Supervisory Board is to ensure that useful, competitive, and truly Shari'ah-compliant products are developed, delivered and maintained by Guidance Financial Group, so that you may rest assured that you are transacting in ways that comply with the religious and moral teachings of Islam. Toward this end, our Board performs regular audits of the company and its business.

It has been the pleasure of our Shari'ah Board to work with Guidance Financial Group, and with some of the leading experts in U.S. finance, in order to devise ways and means for you to purchase a home in a manner that is free of riba. We also work with Guidance to enable you to invest for your family's future in ways that accord with Islamic legal and moral principles.

In closing, I wish you a pleasant experience in all of your transactions with Guidance.

Yusuf Talal DeLorenzo, On behalf of the Shari'ah Supervisory Board`,
  },
  {
    id: "ghs-customer-faqs",
    title: "Guidance Home Services - Customer FAQs",
    entity: "home-services",
    visibility: "public",
    audience: "consumer",
    text: `What is Guidance Home Services (GHS)? GHS connects customers with experienced, vetted real estate agents and supports agents who want to grow their business through qualified referrals.

Is GHS a real estate brokerage? No. GHS is not a brokerage. We specialize in agent matching and referral services.

Does it cost customers anything to use GHS? No. GHS is completely free for customers.

How does GHS make money? GHS receives a referral fee from the agent after a successful closing.

How does GHS choose agents for customers? Agents are selected based on experience, performance, location, and availability.

How many agents will I be connected with? You will be connected with one primary agent selected by GHS.

What if I'm not satisfied with my assigned agent? Contact GHS and we will review your situation and, if appropriate, assign a different agent.

How quickly will I be connected to an agent? Most customers are connected within one hour during business hours.

What happens after I contact GHS? You share your needs, GHS reviews your information, an agent is assigned, and you begin working together.

Do I need to be pre-approved before working with an agent? No, but pre-approval is recommended and can help speed up the process.

Does GHS provide financing? No. GHS focuses on connecting customers with agents. Financing is handled through lenders and partners.

Can GHS help me find Islamic home financing? Yes. GHS works closely with Guidance Residential, which offers Shariah-compliant home financing.

Does GHS handle investor financing? No. Investor and specialized financing programs are handled through Guidance Residential and other partners.

What states does GHS serve? GHS operates in 35+ states, depending on agent availability.

Do you serve rural and smaller markets? Service depends on available partner agents in each area.

Is my information kept private? Yes. Your information is shared only with approved partners involved in your transaction.

Will GHS stay involved after I'm connected? Yes. GHS continues to support customers throughout the process.

Who do I contact if I need help? You may contact your assigned agent or the GHS support team.`,
  },

  // --- Agent tier: real-estate-agent-facing content -----------------------------------------
  {
    id: "ghs-realtor-faqs",
    title: "Guidance Home Services - Realtor FAQs",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `How can agents join GHS? Agents may apply to join based on availability in their service area. Some cities and regions are capped.

What are the requirements to join GHS as a full-time partner? Agents must have 10+ closings in the past 12 months and be active in an open service area.

What if I have fewer than 10 closings? Agents with fewer than 10 closings may be approved as part-time partners and receive fewer referrals.

Why are some cities capped? Caps help maintain service quality, agent performance, and fair lead distribution.

Do partner agents receive ongoing support? Yes. GHS provides performance tracking, referral management, and operational support.

What are GHS's referral terms? 25% referral fee with a 24-month obligation period.`,
  },
  {
    id: "ghs-agent-network-guidelines",
    title: "GHS Agent Network Guidelines - One Pager",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `AGENT NETWORK GUIDELINES - One Pager

1. Requirements to Join
- Must be affiliated with any licensed brokerage.
- Preferably 2 years of full-time real estate industry experience.
- Must have closed at least 10 units in the last 12 months. Agents with fewer closings are considered part-time and may not receive any referrals.
- Required to submit a signed GHS Master Referral Agreement.

2. GHS Agent Expectations
- Uphold the highest professional customer service standards.
- Avoid steering clients to competing home financing providers.
- Always claim GHS Clients within a 4-hour window.
- Maintain a customer service score of at least 8/10.
- Consistently respond to GHS Clients and provide updates.
- Regularly update the Guidance Home Services App and respond promptly to Concierge calls/emails.
- Do not charge fees related to obtaining a referral from GHS.
- Timely payment of referral fees to GHS.

3. Referral Rejection
- All rejected referrals, regardless of the reason, must be communicated to GHS within 48 hours.
- Acceptable reasons for referral rejection include: client's desired property is outside your service area; inability to pay the referral fee to GHS; lack of properties within the client's price range or area; existing relationship with the client, with proof required showing the agent has been actively providing real estate services to the GHS client within the past 6 months.

4. Customer Service Commitment
- Contact and claim a GHS Client within 4 hours of the referral.
- Prepare a Comparative Market Analysis (CMA), list properties in the MLS, and develop a marketing plan.
- Return all communications from GHS Clients, Account Executives, and the GHS Concierge promptly.
- Actively work to identify suitable properties, assist in preparing offers, and negotiate terms.
- Ensure proactive communication with both the GHS Client and the GHS Concierge to keep them informed.
- Manage the client's transaction, including appraisals, home inspections, and legal disclosures.

Guidance Residential, LLC | NMLS#2908 | 11107 Sunset Hills Rd., Suite 300, Reston, VA 20190`,
  },
  {
    id: "ghs-agent-packet",
    title: "GHS Agent Packet - You Should Be Closing More",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `YOU SHOULD BE CLOSING MORE: The Simple Way to Grow Your Real Estate Business

Guidance Home Services (GHS) is the preferred referral platform for Guidance Residential, the #1 U.S. Islamic Home Financing Provider - part of the Guidance Financial Group suite of companies. We connect real estate agents with qualified and motivated Muslim American homebuyers.

Competitive Advantages for GHS Network Agents:
1. Qualified Buyer Referrals - more than just leads, they are qualified and motivated buyers ready to take the next step.
2. Increased Visibility Through Partnership Opportunities and Access to Marketing Collateral - Guidance Residential attends industry-wide consumer events attended by as many as 35,000 people from the target market.
3. Work With The #1 U.S. Islamic Home Financing Brand - 80% of the market share, funded over $10 billion in home financing, 40,000 customers, approved by Freddie Mac and other Government Sponsored Enterprises.
4. Supplemental Buyer/Seller Business for Greater Income Potential.

The Guidance Difference: Guidance Residential offers a mortgage that is an alternative to a loan based on interest/usury. Clients become a co-owner with Guidance Residential, from whom they acquire full ownership through affordable payments. Guidance Residential works as a partner with the homebuyer instead of as a lender. Co-Ownership Benefits include a Non-Recourse Commitment (in the event of default, Guidance Residential does not have recourse against the customer's other assets), a Capped Late Payment Fee, and Shared Risk (if a property is lost due to a natural disaster or eminent domain, proceeds are shared based upon the percentage of ownership at the point of loss).

Frequently Asked Questions (for agents):
What is the timeline to close a file through Guidance Residential? Day 1: Application Stage, initial disclosures sent within 3 business days. Day 5: Processing Stage. Day 10: Underwriting Stage. Day 15: Conditional approval. Day 21: Full Approval. Day 23: Clear to Close. Day 26: Closing Stage. Day 30: Settlement/Closing Date. The 30-day timeline is a best-case scenario; on average it takes a minimum of 45 days to close a file from the day the application is taken.

Can only Muslim American consumers take advantage of Guidance Residential's program? No. Although the products are faith based, any potential client can take advantage of the consumer-friendly features of the program, regardless of religious affiliation.

What kind of product features are offered? 30, 20 and 15-year fixed terms; 3, 5, 7 and 10 year adjustable terms; jumbo financing, refinancing to access equity/cash out, relief and streamlined refinance options. Property types are single family, townhouses, condos, and 2-4 unit residences as well as investment properties.

Agent Network Guidelines, Buy & Sell Incentive Overview, and GHS Rebate Program (effective July 1, 2025): Selling a home only through a GHS-connected Listing Agent earns a 0.25% rebate on the final sale price. Buying a home only (with GR financing) through a GHS-connected Buyer Agent earns an appraisal credit of up to $500. Buying and selling combined earns a total 0.5% rebate plus the $500 appraisal credit, provided both transactions close with GHS-connected agents and GR financing. Final sale price must be at least $100,000. Rebate is not available in Alabama, Kansas, Mississippi, Missouri, New Jersey, Oregon, and Tennessee.

GHS Agent Cheat Sheet: GHS clients are faith-conscious Muslim Americans seeking a transparent, interest-free path to homeownership. The Account Executive (AE) manages financing -- direct all Islamic financing questions to the AE listed in the GHS App. Claim the client immediately through the GHS App. Avoid scheduling during Friday prayer (12:30-2 PM) or major Islamic holidays; during Ramadan, keep meetings short and efficient. Claim leads quickly -- the first agent to claim gets the referral.

Guidance Residential, LLC | NMLS#2908 | 11107 Sunset Hills Rd., Suite 300, Reston, VA 20190`,
  },
  {
    id: "ghs-agent-assignment-guide",
    title: "GHS Agent Assignment Guide",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `GHS Agent Assignment Guide

AE Recommendations: AEs may recommend their preferred GHS Agent for client referrals to Concierge. Concierge will prioritize the AE's recommendation, maintaining their critical role in the process.

Concierge Veto Process: Concierge has the authority to veto an AE's preferred GHS Agent under specific circumstances to ensure quality and compliance.

Veto Triggers:
1. Low REA Score: REA Score is below 7 due to low conversion rates, no customer Net Promoter Score (NPS), minimal or no leads submitted to Guidance Residential, poor communication with the Concierge team, lack of updates in the GHS App, or consistently claiming referrals outside the 4-hour window.
2. Expired License: the REA's license is expired in the system and has not been updated.
3. GHS App Non-Compliance: the REA has not downloaded or is not using the required GHS App to accept leads.
4. Agent Under Review, Removed, or Lead Contributor Only.
5. Part-Time Agent: classified as part-time, defined as completing 10 or fewer closings OR fewer than $4.5 million in volume in the last 12 months.
6. Active Client Limit: the REA has 5 or more active Client Referrals from Guidance Home Services. Preferred GHS Agents may have up to 7 active Client Referrals.

Concierge Follow Up Process: when a GR customer is PQ'd or TBD'd, Concierge follows up according to: TBD-Pre Approved Leads, 2 hours to follow up after TBD'd; PQ Completed Leads, 2 hours to follow up after PQ Completed; AE Email to Concierge, follow up ASAP; wait for AE response on preferred REA, 3 hours; wait for AE response after veto, 1 hour.

RM and DM Overrides: if the Concierge vetoes an AE's preferred REA, both Regional Managers (RMs) and District Managers (DMs) have the authority to override the decision with sufficient reason. Overrides should be used sparingly and only to reduce delays, not compromise the process.`,
  },
  {
    id: "ghst1-agent-signup-rules",
    title: "GHST1 Agent Signup Rules",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `GHST1 Agent Signup Rules

1. Agent Capacity Limits: Big City Cap -- maintain a limit of 30 agents per big city (population exceeding 600,000). Small City Cap -- enforce a cap of 10 agents in smaller metro areas (population below 600,000).

2. Qualification Criteria: Experience -- recommended 2 years' full-time experience. Historical Performance -- agents with less than 10 closings or $4.5 million in volume in the past 12 months are considered part-time and may be ineligible to receive leads. License and Agreement Compliance -- licensed and signed the GHS Master Referral Agreement, agreeing to all GHS standards and performance expectations.

3. Ongoing Performance Monitoring: Conversion Rate -- ensure GHS Agents achieve a minimum 25% conversion rate from the first 4 leads they receive. Concierge Rating -- collect and review feedback from the GHS Concierge team. Customer Service Scores -- 8/10 is the minimum NPS score required to be eligible to receive leads. Activity Reporting -- ensure agents are actively using the GHS App and updating client interaction logs promptly. Referral Fee Compliance -- verify agents are paying referral fees to GHS in a timely manner.

4. Agent Removal and Replacement: agents under 25% conversion rate with at least 4 leads, or below 8/10 NPS, or who do not adhere to GHS standards, should be removed. Capacity adjustments are made based on city population shifts, market demands, and the existing pool's performance.`,
  },
  {
    id: "ghst1-ideal-agent-profile",
    title: "Guidance Home Services - Ideal Agent Profile",
    entity: "home-services",
    visibility: "agent",
    audience: "agent",
    text: `Guidance Home Services - Ideal Agent Profile

The Guidance Home Services Team 1 (Realtor Acquisition Team) considers the following criteria when signing up new GHS Agents:

What Kind of Agents We Want: hungry and driven to grow their business; understands and aligns with the Guidance Residential (GR) vision; at least 2-7 years of real estate experience; preferably Muslim realtors or agents with Muslim clients; flexible and approachable; willing and able to communicate with the GHS Concierge Team.

What We Don't Want: agents who are purely transactional and not relationship-driven; only want high volume, cash-ready leads; refuse to work evenings or weekends; already have full pipelines and cannot take on new clients; fail to respond to referrals in a timely manner.`,
  },

  // --- Internal tier: staff-only SOPs, scripts, and process docs -----------------------------
  {
    id: "grt1-sops",
    title: "GR Team 1 (Outbound Team) Standard Operating Procedures",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Guidance Residential Team 1, Outbound Team, Standard Operating Procedures. Assisting Customers Financing with Guidance Residential.

Section 1: Online PQs. GR Team 1 is tasked with calling leads within one hour of assignment. Before making the customer call, they update the Buyer Record Status (BRS) to "Online Lead" and assign the record to themselves in Zoho CRM. They confirm the customer hasn't been assigned to an Account Executive (AE) in the past three months before proceeding.

GR Team 1 makes up to 14 contact attempts before marking a customer as "Fallout" in Zoho CRM, with specific reasons: "PQ Denied" if the customer disconnects after a full introduction, "PQ Withdrawn" if the customer states disinterest, "PQ Incomplete" if the number is a business line, or "Duplicate" if there's an active previous customer record.

After a successful conversation, GR Team 1 transfers the customer to an AE, updating Buyer Record Status based on whether the customer wants a Real Estate Agent (REA), already has one, or is purchasing versus refinancing. Email communication with customers is not allowed; only phone and voicemail.

Section 2: Outbound Campaigns operate under Fallout, Refinance, Boomerang, and other campaigns via automatic dialer, all logged in Touchstone CRM. The team may not comment on GR services -- customer questions are referred to an AE.

Section 3: Instructions for Account Executive Assignments -- if no AE is available, transfer live to AMs, then RMs, then inform the customer and request a callback time.

Section 4: Instructions for Customers Looking to Sell -- introduce the customer to GHS, collect property address, price range, and follow-up time, then generate a follow-up email.`,
  },
  {
    id: "grt1-script-online-pq-purchase",
    title: "GRT1 Script - Online PQ Purchase",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Concierge Script for Online Pre-Qualification Purchase Leads.

Greeting: Assalamu alaykum, my name is [YOUR NAME], calling on behalf of Guidance. May I speak with Mr./Ms. [CUSTOMER NAME]?

If unavailable, note the callback time and attempt up to 14 follow-ups. If available, congratulate the customer on choosing Guidance Residential and explain the Concierge Team's role.

Verification questions to enter in Zoho: purchase timeline (ASAP, 1-3 months, 4-6 months, 7-12 months), whether they are a first-time home buyer, whether they currently own or rent, whether they're selling before buying, whether they're working with a real estate agent, and how they heard about Guidance Residential.

If the customer doesn't have an agent, offer to connect them with a pre-screened agent through Guidance Home Services (GHS). If they have an agent, request the agent's name for alignment. Depending on the customer's situation (interested in a realtor, not interested, or selling and buying), the script branches into different closing paragraphs before transferring the call to a licensed Account Executive.`,
  },
  {
    id: "grt1-script-online-pq-refinance",
    title: "GRT1 Script - Online PQ Refinance",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Concierge Script for Follow-up on All Online Refinance Pre-Qualification Leads.

Greeting: Assalamu alaykum, my name is [YOUR NAME], calling on behalf of Guidance Residential, the #1 U.S. provider of Islamic Home Financing. May I speak with [Customer First Name]?

If unavailable: note this is a follow-up to a website inquiry, schedule a callback, and attempt up to 14 follow-ups.

If available: confirm this is a follow-up to the customer's online pre-qualification form for a refinance of their current property, verify the state where the property is located, and connect the customer with a licensed Guidance Residential Account Executive to review refinance options.`,
  },
  {
    id: "ghst2-sops",
    title: "GHS Team 2 (Concierge Team) Standard Operating Procedures",
    entity: "home-services",
    visibility: "internal",
    audience: "staff",
    text: `Guidance Home Services Team 2, Concierge Team, Standard Operating Procedures.

Section 1: Pre-Approval Alerts. GHS Team 2's primary role is to assist customers after they receive TBD pre-approvals/pre-qualifications. The team performs 10 follow-ups on TBD Pre-Approved Alerts (email to the AE after 5 attempts) and 5 follow-ups on PQ Completed Alerts.

Section 2: Lead Generation Process. GHST2 receives TBD Pre-Approval Alerts from the Chat team, distributed evenly across members, and also assists customers looking to sell a property by assigning them to Seller Agents.

Section 3: Assignment of Customers to Realtors. If no AE-preferred agent is specified, the team emails the AE and waits 1 hour before proceeding with general assignment. An introduction email is sent to the customer once Buyer Record Status moves to "REA Assigned," copying the REA, AE, AE's Regional and Divisional Manager, and Concierge. Buyer Record Status is updated through milestones: REA Assigned, Connected with REA, Showing Properties, Under Contract, and Closed (GHS+GRES or GHS+Other).

Section 4: Follow-up Process. One week after "Under Contract," GHS Team 2 contacts the REA for Title Company details and generates an email to the Title Company copying the GHS Agent, GHS Broker, GR AE, AE's RM, and Concierge.

Section 5: Closing Process. Upon closing, GHS Team 2 sends a Congratulatory Email to the REA, updates Buyer Record Status, and acquires the Closing Disclosure from the REA for the Accounting Department. A check follow-up task is set for one month after the Estimated Closing Date; if no referral-fee check is received, the team follows up daily for 5 working days, then reports the incident to GHS Management if there's still no response.`,
  },
  {
    id: "call-script-best-practices",
    title: "Customer Call Best Practices",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Customer Call Best Practices.

Customer-Centric Factors: Active Listening (fully understanding the customer's needs, concerns, or requests), Empathy (connecting with the customer on an emotional level), Problem-Solving (effectively addressing the customer's issue), First Call Resolution, Clear Communication (avoiding jargon), and Patience (maintaining composure in challenging situations).

Operational Factors: Speed of Response, Product Knowledge, System Proficiency, Adherence to Scripts (while maintaining a natural tone), and Call Quality Monitoring.

Customer Satisfaction and Loyalty: Building Rapport, Upselling/Cross-selling when appropriate, Gathering Feedback, and Closing the Call by summarizing key points and thanking the customer.`,
  },
  {
    id: "qa-call-scoring-guide",
    title: "QA Call Scoring Guide",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `QA Call Scoring Guide, scored 0-10 across categories:

Energy: 0 monotone/disinterested, 5 neutral, 10 highly engaging and confident.
Tone: 0 inappropriate/rude, 5 professional but not warm, 10 perfectly matched to customer emotion.
Call Flow: 0 disorganized, 5 basic structure present, 10 seamless and well-paced.
Grammar: 0 multiple serious errors, 5 minor issues but mostly professional, 10 flawless.
Pronunciation: 0 incomprehensible at times, 5 understandable with some distracting mispronunciations, 10 crisp and accurate.
Interruptions: 0 constant interruptions, 5 occasional but mostly allowed the customer to speak, 10 excellent patience and turn-taking.
Product Understanding: 0 incorrect/misleading information, 5 basic understanding but lacked confidence, 10 strong expertise and proactively informative.
Script: 0 ignored or deviated significantly, 5 covered script with awkward delivery, 10 flawless natural use of script.
Issue Resolved: 0 no resolution or next step, 5 reasonable resolution but incomplete communication, 10 fully resolved and confirmed with customer.
Accent (1-5 scale): 1 extremely difficult to understand, 3 noticeable accent with minor difficulty, 5 not a barrier.
Went Above and Beyond (binary): 0 no, met expectations only; 5 yes, exceeded expectations meaningfully.`,
  },
  {
    id: "after-6pm-flow-chart",
    title: "GR Concierge Team - Scheduling Callbacks After 7PM Local Time",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `GR Concierge Team - Scheduling Callbacks after 7PM Local Time.

For an Online PQ/Online App Concierge lead reached after 7PM local time: call the customer to schedule a callback for the next day, provide available timeslots (e.g. 9AM-7PM local time) with an Account Executive, and inform the customer the call shouldn't take longer than 15-20 minutes. If the concierge team member making the appointment is unavailable at the requested time, reassign to another team member and set a task in Zoho.

Notes to record in Zoho: script completed (Y/N), scheduled callback time, purchase timeframe, first-time-home-buyer status, whether they have an agent, and how they heard about GR.

At the scheduled callback time: if the script wasn't completed, proceed with the normal PQ follow-up script and record the same notes, then transfer the call to an AE. If the script was completed, confirm the same details with the customer before transferring to an AE.`,
  },
  {
    id: "ghs-team2-scripts",
    title: "GHS Team 2 Scripts",
    entity: "home-services",
    visibility: "internal",
    audience: "staff",
    text: `GHS Team 2 scripts for customer and realtor calls.

Customer PQ'd Matching Process Script: greet the customer, congratulate them on starting the purchase process with Guidance Residential, confirm they aren't yet working with a real estate agent, and offer to connect them to a pre-screened network agent (mentioning any current appraisal-credit promotion). Confirm continued interest in purchasing in the stated city/state before wrapping up.

Courtesy Call Script: check in on the customer's progress, ask if they've found a home or are working with an agent, and offer to match them with a Network Realtor if not.

Real Estate Agent Milestones Script: call the REA to check on buyer or seller milestones (contact made, showing properties, offer submitted, under contract, closed) and, if closed, ask about the referral check status with their brokerage.

Customer Milestones Script: call the customer to check on the same milestones from their side, referencing the last known Zoho status.

Customer Online Inquiry Script (Buyer's Agent): verify name, email, state, purchase timeline, and whether the customer already has a lender. If not, offer to connect them with a Guidance Residential Account Executive, then gather state, zip codes, and budget for realtor matching.

Customer Online Inquiry Script (Seller's Agent): verify name, email, state, current property address, and timelines to sell and purchase. Offer a Comparative Market Analysis (CMA) and, if agreed, promise an email introduction to a matched Network Agent.`,
  },
  {
    id: "ghst1-sops",
    title: "GHS Team 1 (Realtor Acquisition Team) Standard Operating Procedures",
    entity: "home-services",
    visibility: "internal",
    audience: "staff",
    text: `Guidance Home Services Team 1, Realtor Acquisition Team, Standard Operating Procedures.

Section 1: Registration Process. GHS Team 1 assists Realtors (REAs) with registration on the GHS Website and maintains REA relationships. Team 1 reaches out to REAs who've verified their email within 24 hours of registration, and follows up on AE-requested signups at least 3 times. Team 1 does not contact REAs without a verified email unless specifically requested and approved by GHS Management. Team 1 helps REAs complete registration, including the Master Cooperative Real Estate Agreement (MCREA), and verifies REA profiles in Zoho once auto-generated (within 1 hour of signup), including correct brokerage assignment and part-time/full-time categorization. A congratulatory email is sent upon approval.

Section 2: Assistance to GHS Team 2. Team 1 assists Team 2 with sourcing and contacting realtors in specific zip codes, providing REAs within 24 hours of request, sourced through sites like Zillow and Realtor.com, with hourly and email updates to GHS Team 2, Concierge Management, and the AE.

Section 3: Retaining REAs in the GHS Network. Automatic license-expiration emails go out 1 month, 15 days, and 1 day before expiration, with Team 1 following up by phone. Team 1's goal is to keep Inactive REAs under 20% of the network, sell the GHS App on every signup call, and limit voluntary REA removals to fewer than 3 per month.

Section 4: Removing REAs from the GHS Network. Before removal, Team 1 checks for active GHS Client Referrals or pending payments owed to GHS; if either exists, Team 1 informs Management and awaits instructions. Otherwise, Team 1 updates the REA's status to "REMOVED" in Zoho, deactivates the GHS Dashboard profile, and sends the standard removal email.`,
  },
  {
    id: "2025-concierge-process-overview",
    title: "2025 Concierge Process Overview for AEs, RMs, and DMs",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `2025 Concierge Process Overview for AEs, DMs, and RMs.

AE Recommendations: AEs can continue to recommend their preferred REA for client referrals; Concierge prioritizes the AE's recommendation.

Concierge Veto Process: Concierge has authority to veto an AE's preferred REA under specific triggers: (1) Low REA Score, below 7, due to low conversion rates, no customer NPS, minimal or no leads submitted to Guidance Residential, poor communication with Concierge, lack of GHS App updates, or consistently claiming referrals outside the 4-hour window; (2) Expired License not updated in the system; (3) GHS App Non-Compliance; (4) Agent Under Review, Removed, or Lead Contributor Only (agents designated solely to provide leads, not handle client referrals, are also subject to veto); (5) Part-Time Agent, defined as 12 or fewer closings within the past 12 months.

AE Response Time Guidelines: TBD-Pre Approved Leads -- the AE has 1 hour to respond. PQ Completed Leads -- the AE has 3 hours to respond. If no response is provided within the specified time, Concierge proceeds with assigning the lead as needed.

RM and DM Override Authority: if Concierge vetoes an AE's preferred REA, both Regional Managers (RMs) and District Managers (DMs) have the authority to override the decision, based on a balanced review of AE recommendations and Concierge feedback.`,
  },
  {
    id: "how-to-sell-guidance",
    title: "How To Sell Guidance (Salman Ali)",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Salman's Message to Guidance (sales coaching memo).

Focus has been on converting online PQ live transfers to pre-approved customers, resulting in the highest conversion ratio in company history through regular sales coaching calls. The target is 16 pre-approvals in pipeline at any time, resulting in a minimum of 4 disbursements per month and a pull-through ratio of at least 25%.

Top takeaways: (1) Mindset -- be prepared to sell the customer on a pre-approval on the first call rather than scheduling a callback. (2) Acknowledge the Lead Source explicitly when opening the call. (3) E-Consent -- collect the credit report fee and obtain e-consent without dwelling on it. (4) Explain the value of Guidance's program in 2-3 minutes if the customer agrees, covering: Guidance is wholly owned by Muslims and not a bank; the mission is Riba-Free home financing via a Co-ownership Agreement; over 40,000 Muslim-Americans have achieved Riba-Free home ownership; the program has been approved by 7 of the world's most distinguished Muslim scholars. (5) Explain the value of the pre-approval: it validates financial position, assures sellers the buyer is serious, is valid for 120 days, can be used on multiple properties, and costs $62.50 as a pass-through credit-check cost. (6) Ask for the Sale directly, offering to process payment on the call.

Closing message: customers call Guidance first, so the team should sell to them first rather than letting them shop around.`,
  },
  {
    id: "ghst2-connection-process-v3",
    title: "GHST2 - Connection Process V3",
    entity: "home-services",
    visibility: "internal",
    audience: "staff",
    text: `GHST2 Connection Process V3 -- Buyer, Seller, and combined Buyer & Seller agent request workflows.

Buyer Agent Request: (1) Receive request via automatic Zoho lead assignment, management assignment, or inbound transfer; confirm contract status is PQ or TBD; perform follow-up (PQ: 5 calls/3 emails, TBD: 10 calls/5 emails); confirm the customer needs an agent, else mark Fall Out. (2) Update CRM status to "Ready for REA Assignment"; check for an AE-preferred agent, else email the AE recommendation and wait 3 hours before proceeding. (3) Identify the top agent via the AE Agent Partner List or GHS Concierge recommendation; generate a referral alert in Zoho Creator. (4) Wait 1 hour for the REA to claim the referral, escalating with a call/email if unclaimed, and reassigning after 4 hours plus a further 2-hour wait if still unclaimed. (5) Send the client introduction email (copying REA, AE, RM, DM, Concierge), update CRM fields, and schedule next-day follow-up.

Seller Agent Request follows a parallel flow: confirm seller need (else Fall Out both Buyer and Seller Record Status), gather selling timeline/price range/property address, assign an agent (checking they handle listings if non-preferred), generate a referral alert, wait 1 hour for claim before escalating, and send the seller introduction email.

Buyer & Seller Agent Request combines both flows into two separate customer files (one buyer, one seller) that are assigned, tracked, and followed up in parallel, each with its own referral alert, claim window, and introduction email.`,
  },
  {
    id: "ghst2-process-flow",
    title: "GHST2 - Process Flow (Home Buyer Journey)",
    entity: "home-services",
    visibility: "internal",
    audience: "staff",
    text: `GHS Team 2 Process Flow -- Home Buyer Journey follow-up cadence across milestones.

REA Assigned -> Connected with REA: call the REA for an update 24 hours after assignment (email immediately if no answer); call the customer for an update 48 hours after assignment (email immediately if no answer); call the AE for an update 4 days after assignment if still no connection.

Connected with REA -> Showing Properties: call the REA for an update 7 days after connection (10 days for PQ'd customers); call the customer on the same cadence; escalate to the AE 15 days after connection if there's still no response.

Showing Properties -> Under Contract: call the REA or customer for an update 14 days after showing properties began, escalating to the customer directly if the REA is unresponsive for 24 hours.

Under Contract -> Closed: send an escrow email to the REA (copying the broker) as soon as the purchase contract is received; email the AE on the 1st day of the closing month; email the REA 15 days before the closing date; call the AE for final confirmation 3 days before closing; call or leave a voicemail with the REA to confirm closing occurred on the day of closing.

Closed: congratulate the REA and request the Closing Disclosure (CD) and referral check on the day of closing; congratulate the customer by email; follow up for the CD the same day, and for the referral check 21 days after closing if not yet received.`,
  },
  {
    id: "importance-of-islamic-home-financing",
    title: "Islamic Home Financing: Your Role in Customer Satisfaction (staff training deck)",
    entity: "residential",
    visibility: "internal",
    audience: "staff",
    text: `Staff training presentation: Islamic Home Financing -- Your Role in Customer Satisfaction, Understanding the Impact of Your Interactions.

What is Islamic Home Financing: aligned with Islamic principles, no interest (riba) involved, common structures include Murabaha, Ijara, and Musharakah. Key benefits for customers: peace of mind and ethical compliance, potential tax advantages, competitive rates and options.

Your Role in the Process: the initial interaction matters for building trust and rapport; identifying potential customers means understanding customer needs and qualifying leads for Islamic home financing; efficient transfer to account executives means providing accurate, relevant information and ensuring a smooth handover.

Why Islamic Home Financing Matters (to staff): contributes to the company's growth by expanding the customer base and market share; impacts customer satisfaction by meeting expectations and building long-term relationships; supports personal and professional development by enhancing product knowledge and customer service skills.

How to Effectively Communicate Islamic Home Financing: emphasize ethical and compliant financing, competitive rates, and benefits tailored to customer needs; use clear, simple language and avoid technical jargon; address common objections with accurate information.

Conclusion: this role is the foundation for a successful customer journey and contributes to overall company success -- continue learning about Islamic home financing and strive for excellence in customer service.`,
  },
];
