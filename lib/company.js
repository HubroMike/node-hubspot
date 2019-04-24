const Property = require('./company_property')
const _ = require ("lodash");
const Fuse = require("fuse.js");

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

  getAll(options) {
    return this.get(options)
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
 searchCompanies(search, searchProps = ["name", "website"], recursive = true, returnProps = [], limit = 5, offset = 0) {
  const fuse = new Fuse([], {
    keys: searchProps.map(prop => `properties.${prop}.value`),
    shouldSort: true,
    includeScore: true
  });
  return this.get({ properties: [...returnProps, ...searchProps]}, offset)
    .then(data => {
      fuse.setCollection(data.companies);
      const results = fuse.search(search);

      console.log(results[0].item.properties.name.value);

      if( results.length !== 0 ) {
        return _.take(results, limit);
      }
      
      if (data['has-more'] && recursive)
        return this.searchCompanies(search, searchProps, recursive, returnProps, limit, data.offset);

      return [];
    });
 }

  // a function that searches for companies matching the data provided.
  // searchProps: Object  (the props you would like to match) example: { name: "hello project" }
  // recursive: boolean (should the function be called recursively if the result is not found in the first batch of results)
  // returnProps: Object (the props of the matching companies you would like to be included in the returned array)
  // offset: number (the current result offset - used by recursion)
  getByProps(searchProps, recursive = true, returnProps = [], offset = 0, limit = 5) {
    
    return this.get({ properties: [...returnProps, ...Object.keys(searchProps)], offset }).then(data => {
        const results = [];
        _.forEach(data.companies, company => {
          // we use a scoring system to order the results by the highest match
          let matchScore = 0;
          _.forEach(Object.keys(searchProps), key => {
            const prop = company.properties[key] && company.properties[key].value;
            const searchProp = searchProps[key];
            // console.log(prop);
            // an exact match of a prop is more important
            if(_.isEqual(prop, searchProp)) matchScore += 2;
            // for strings we can check partial matches
            else if(_.isString(prop) && _.isString(searchProp)) {
              _.forEach(searchProp.split(" "), partial => {
                if(_.includes(prop, partial)) matchScore++;
              });
            } 
          });
          if(matchScore !== 0) results.push({ company, matchScore });
        });
        if( results.length !== 0 ) {
          return _.take(_.sortBy(results, ["matchScore"]).reverse(), limit);
        }
        
        if (data['has-more'] && recursive)
          return this.getByProps(searchProps, recursive, returnProps, data.offset);

        return []
      }
    )
  }

  getByName (name, returnProps = []) {
    return this.getByProps({ name }, true, returnProps);
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
