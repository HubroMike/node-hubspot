const _ = require('lodash')

class Ticket {
  constructor(client) {
    this.client = client
  }

  get(options) {
    return this.client._request({
      method: 'GET',
      path: '/crm-objects/v1/objects/tickets/paged',
      qs: options,
      qsStringifyOptions: {
        arrayFormat: 'repeat',
      },
    })
  }

  getById(id, options) {
    return this.client._request({
      method: 'GET',
      path: '/crm-objects/v1/objects/tickets/' + id,
      qs: options,
    })
  }

  getByProps(
    searchProps,
    recursive = true,
    returnProps = [],
    offset = 0,
    limit = 5
  ) {
    return this.get({
      properties: [...returnProps, ...Object.keys(searchProps)],
      offset,
    }).then(data => {
      const results = []
      _.forEach(data.objects, ticket => {
        let matchFound = false
        _.forEach(Object.keys(searchProps), key => {
          const prop = ticket.properties[key] && ticket.properties[key].value
          const searchProp = searchProps[key]
          if (_.isEqual(prop, searchProp)) {
            matchFound = true
            return false
          }
        })
        if (matchFound) results.push(ticket)
      })
      if (results.length >= limit) {
        return _.take(results, limit)
      }

      if (data['has-more'] && recursive)
        return [
          ...results,
          ...this.getByProps(
            searchProps,
            recursive,
            returnProps,
            data.offset,
            limit - results.length
          ),
        ]

      return results
    })
  }

  getAll(options) {
    return this.get(options)
  }

  create(options) {
    return this.client._request({
      method: 'POST',
      path: '/crm-objects/v1/objects/tickets',
      body: options,
    })
  }

  update(id, options) {
    return this.client._request({
      method: 'PUT',
      path: '/crm-objects/v1/objects/tickets/' + id,
      body: options,
    })
  }

  delete(id) {
    return this.client._request({
      method: 'DELETE',
      path: '/crm-objects/v1/objects/tickets/' + id,
    })
  }
}

module.exports = Ticket
