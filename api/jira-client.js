const axios = require('axios')
const util = require('util')

// axios.interceptors.request.use(function (config) {
//    console.log('REQUEST')
//    console.log(util.inspect(config, false, 2))
//    return config;
// }, function (error) {
//    console.log('ERROR')
//    console.log(util.inspect(error, false, 2))
//    return Promise.reject(error);
// });

// axios.interceptors.response.use(function (config) {
//    console.log('RESPONSE')
//    console.log(util.inspect(config, false, 2))
//    return config;
// }, function (error) {
//    console.log('ERROR')
//    console.log(util.inspect(error, false, 2))
//    return Promise.reject(error);
// });

module.exports = async (baseURL, username, password) => {
   let sessionCookie = undefined
   const lastSessionUpdate = new Date()
   const getSessionCookie = async () => {
      const minutesSinceUpdate = (new Date() - lastSessionUpdate) / 1000 / 60
      if (minutesSinceUpdate > 5 || !sessionCookie) {
         const session = (await axios.post(`${baseURL}/rest/auth/1/session`, { username, password })).data.session
         sessionCookie = `${session.name}=${session.value}`
      }
      return sessionCookie
   }

   const getIssue = async issueKey => {
      const cookie = await getSessionCookie()
      return axios.get(`${baseURL}/rest/api/latest/issue/${issueKey}`, {
         headers: {
            Cookie: cookie
         }
      })
   }

   const search = async (jql, fields = ['issuetype', 'status', 'summary', 'issuelinks'], startAt = 0, maxResults = 100) => {
      const cookie = await getSessionCookie()
      return axios({
         method: 'POST',
         url: `${baseURL}/rest/api/latest/search`,
         data: {
            startAt,
            jql,
            fields,
            maxResults
         },
         headers: {
            Cookie: cookie,
            'Content-Type': 'application/json'
         }
      }).then(result => result.data)
   }

   const searchAll = async (jql, fields = ['issuetype', 'status', 'summary', 'issuelinks']) => {
      let startAt = 0
      let allIssues = []
      for (let i = 0; i < 50; i++) {
         const result = await search(jql, fields, startAt)
         allIssues = allIssues.concat(result.issues)
         if (result.startAt + result.issues.length >= result.total) break;
         startAt = result.startAt + result.issues.length
      }
      return allIssues
   }

   return {
      getIssue,
      search,
      searchAll
   }
}