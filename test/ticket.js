const chai = require('chai')
const expect = chai.expect

const Hubspot = require('..')
const hubspot = new Hubspot({ apiKey: 'demo' })

describe('tickets', () => {
  describe('create', () => {
    it('Should create a new ticket', () => {
      const properties = [
        {
          name: 'subject',
          value: 'This is an example ticket',
        },
        {
          name: 'content',
          value: 'Here are the details of the ticket.',
        },
        {
          name: 'hs_pipeline',
          value: 0,
        },
        {
          name: 'hs_pipeline_stage',
          value: 1,
        },
        {
          name: 'hs_ticket_priority',
          value: 'HIGH',
        },
      ]
      return hubspot.ticket.create(properties).then(data => {
        expect(data.properties.subject.value).to.equal(
          'This is an example ticket'
        )
        expect(data.properties.content.value).to.equal(
          'Here are the details of the ticket.'
        )
      })
    })
  })

  describe('get', () => {
    it('Should get tickets and include specified properties', () => {
      const properties = ['subject']
      return hubspot.ticket.get({ properties }).then(data => {
        expect(data.objects).to.not.equal(undefined)
        expect(data.objects).to.be.a('array')
        expect(data.objects[0].properties.subject).to.not.equal(undefined)
      })
    })
  })

  describe('getById', () => {
    let ticketId
    before(() => {
      return hubspot.ticket.get().then(data => {
        ticketId = data.objects[0].objectId
      })
    })
    it('Should return a list of tickets that match the prop and value provided', () => {
      return hubspot.ticket
        .getById(ticketId, { properties: ['hs_ticket_priority'] })
        .then(data => {
          expect(data.objectId).to.equal(ticketId)
          expect(data.properties.hs_ticket_priority).to.not.equal(undefined)
        })
    })
  })

  describe('getByProps', () => {
    it('Should return a list of tickets that match the prop and value provided', () => {
      return hubspot.ticket
        .getByProps({ hs_ticket_priority: 'HIGH' })
        .then(data => {
          expect(data[0].properties.hs_ticket_priority.value).to.equal('HIGH')
        })
    })
  })

  describe('getAll', () => {
    it('Should get all Tickets', () => {
      return hubspot.ticket.getAll().then(data => {
        expect(data.objects).to.not.equal(undefined)
        expect(data.objects).to.be.a('array')
      })
    })
  })

  describe('update', () => {
    let ticketId
    const updateData = [
      {
        name: 'hs_ticket_priority',
        value: 'HIGH',
      },
      {
        name: 'content',
        value: 'This is now an updated ticket marked as high priority.',
      },
    ]

    before(() => {
      return hubspot.ticket.getAll().then(data => {
        ticketId = data.objects[0].objectId
      })
    })

    it('Should update an existing ticket', () => {
      return hubspot.ticket.update(ticketId, updateData).then(data => {
        expect(data.properties.hs_ticket_priority.value).to.equal('HIGH')
        expect(data.properties.content.value).to.equal(
          'This is now an updated ticket marked as high priority.'
        )
      })
    })
  })

  describe('delete', function() {
    it('can delete', function() {
      const properties = [
        {
          name: 'subject',
          value: 'This is an example ticket',
        },
        {
          name: 'content',
          value: 'Here are the details of the ticket.',
        },
        {
          name: 'hs_pipeline',
          value: 0,
        },
        {
          name: 'hs_pipeline_stage',
          value: 1,
        },
      ]
      return hubspot.ticket.create(properties).then(data => {
        return hubspot.ticket.delete(data.objectId).then((data, msg) => {
          expect(data).to.be.an('undefined')
        })
      })
    })
  })
})
