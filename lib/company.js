const Property = require('./company_property')
const _ = require('lodash')
const Fuse = require('fuse.js')

class Company {
  constructor(client) {
    this.client = client
    this.properties = new Property(this.client)
  }

  getById(id) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/' + id,
    })
  }

  get(options) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/paged',
      qs: options,
      qsStringifyOptions: {
        arrayFormat: 'repeat',
      },
    })
  }

  getTimeoutSafe(options) {
    return this.client.timeoutRetryRequest({
      method: 'GET',
      path: '/companies/v2/companies/paged',
      qs: options,
      qsStringifyOptions: {
        arrayFormat: 'repeat',
      },
    })
  }

  getAll(options) {
    return this.get(options)
  }

  getAllCompanies(returnProps = [], companies = [], offset = 0) {
    return this.getTimeoutSafe({
      limit: 250,
      offset,
      properties: [...returnProps],
    }).then(data => {
      companies.push(...data.companies)
      if (data['has-more']) {
        return this.getAllCompanies(returnProps, companies, data.offset)
      }
      return companies
    })
  }

  getRecentlyCreated(options) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/recent/created',
      qs: options,
    })
  }

  getRecentlyModified(options) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/recent/modified',
      qs: options,
    })
  }

  getByDomain(domain) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/domain/' + domain,
    })
  }

  // searches name and domain name
  searchCompanies(
    search,
    limit = 5,
    searchThreshold = 0.2,
    searchProps = ['name', 'website']
  ) {
    const fuse = new Fuse([], {
      keys: searchProps.map(prop => `properties.${prop}.value`),
      shouldSort: true,
      includeScore: true,
      threshold: searchThreshold,
    })

    return this.getAllCompanies(searchProps).then(companies => {
      fuse.setCollection(companies)
      const results = fuse.search(search)

      if (results.length !== 0) {
        return _.take(results, limit)
      }
      return []
    })
  }

  // a function that searches for companies matching the data provided.
  // searchProps: Object  (the props you would like to match) example: { name: "hello project" }
  // recursive: boolean (should the function be called recursively if the result is not found in the first batch of results)
  // returnProps: Object (the props of the matching companies you would like to be included in the returned array)
  // offset: number (the current result offset - used by recursion)
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
      _.forEach(data.companies, company => {
        // we use a scoring system to order the results by the highest match
        let matchScore = 0
        _.forEach(Object.keys(searchProps), key => {
          const prop = company.properties[key] && company.properties[key].value
          const searchProp = searchProps[key]
          // an exact match of a prop is more important
          if (_.isEqual(prop, searchProp)) matchScore += 2
          // for strings we can check partial matches
          else if (_.isString(prop) && _.isString(searchProp)) {
            _.forEach(searchProp.split(' '), partial => {
              if (_.includes(prop, partial)) matchScore++
            })
          }
        })
        if (matchScore !== 0) results.push({ company, matchScore })
      })
      if (results.length !== 0) {
        return _.take(_.sortBy(results, ['matchScore']).reverse(), limit)
      }

      if (data['has-more'] && recursive)
        return this.getByProps(searchProps, recursive, returnProps, data.offset)

      return []
    })
  }

  getByName(name, returnProps = []) {
    return this.getByProps({ name }, true, returnProps)
  }

  create(data) {
    return this.client._request({
      method: 'POST',
      path: '/companies/v2/companies/',
      body: data,
    })
  }

  delete(id) {
    return this.client._request({
      method: 'DELETE',
      path: '/companies/v2/companies/' + id,
    })
  }

  update(id, data) {
    return this.client._request({
      method: 'PUT',
      path: '/companies/v2/companies/' + id,
      body: data,
    })
  }

  updateBatch(data) {
    return this.client._request({
      method: 'POST',
      path: '/companies/v1/batch-async/update',
      body: data,
    })
  }

  addContactToCompany(data) {
    if (!data || !data.companyId || !data.contactVid) {
      return Promise.reject(
        new Error('companyId and contactVid params must be provided')
      )
    }

    return this.client._request({
      method: 'PUT',
      path:
        '/companies/v2/companies/' +
        data.companyId +
        '/contacts/' +
        data.contactVid,
    })
  }

  getContactIds(id, options) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/' + id + '/vids',
      qs: options,
    })
  }

  getContacts(id, options) {
    return this.client._request({
      method: 'GET',
      path: '/companies/v2/companies/' + id + '/contacts',
      qs: options,
    })
  }
}

module.exports = Company
