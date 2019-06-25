const _ = require('lodash')

/**
 * @summary Implement the CRM Association API
 * (see: https://developers.hubspot.com/docs/methods/crm-associations/crm-associations-overview)
 *
 * *Note*: Only create/update are supported at the moment
 */
class Associations {
  constructor(client) {
    this.client = client
  }

  create({ fromId, toId, associationType}) {
    return this.client._request({
      method: 'PUT',
      path: '/crm-associations/v1/associations/',
      body: {
        fromObjectId: fromId,
        toObjectId: toId,
        category: "HUBSPOT_DEFINED",
        definitionId: associationType
      },
    })
  }
}

// supported association types
Associations._Type = {
  CONTACT_TO_COMPANY:	1,
  COMPANY_TO_CONTACT:	2,
  DEAL_TO_CONTACT: 3,
  CONTACT_TO_DEAL: 4,
  DEAL_TO_COMPANY: 5,
  COMPANY_TO_DEAL: 6,
  COMPANY_TO_ENGAGEMENT: 7,
  ENGAGEMENT_TO_COMPANY: 8,
  CONTACT_TO_ENGAGEMENT: 9,
  ENGAGEMENT_TO_CONTACT: 10,
  DEAL_TO_ENGAGEMENT:	11,
  ENGAGEMENT_TO_DEAL: 12,
  PARENT_COMPANY_TO_CHILD_COMPANY: 13,
  CHILD_COMPANY_TO_PARENT_COMPANY: 14,
  CONTACT_TO_TICKET: 15,
  TICKET_TO_CONTACT: 16,
  TICKET_TO_ENGAGEMENT:	17,
  ENGAGEMENT_TO_TICKET:	18,
  DEAL_TO_LINE_ITEM: 19,
  LINE_ITEM_TO_DEAL: 20,
  COMPANY_TO_TICKET: 25,
  TICKET_TO_COMPANY: 26,
  DEAL_TO_TICKET:	27,
  TICKET_TO_DEAL:	28,
  // Special types of associations for companies
  Company: {
    ADVISOR_TO_COMPANY: 33,
    COMPANY_TO_ADVISOR: 34,
    BOARD_MEMBER_TO_COMPANY: 35,
    COMPANY_TO_BOARD_MEMBER: 36,
    CONTRACTOR_TO_COMPANY: 37,
    COMPANY_TO_CONTRACTOR: 38,
    MANAGER_TO_COMPANY: 39,
    COMPANY_TO_MANAGER: 40,
    BUSINESS_OWNER_TO_COMPANY: 41,
    COMPANY_TO_BUSINESS_OWNER: 42,
    PARTNER_TO_COMPANY: 43,
    COMPANY_TO_PARTNER: 44,
    RESELLER_TO_COMPANY: 45,
    COMPANY_TO_RESELLER: 46
  }
};

module.exports = Associations
