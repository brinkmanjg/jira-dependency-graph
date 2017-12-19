const express = require('express')
const cors = require('cors')
const app = express()
const JiraClient = require('./jira-client')

app.use(cors())
app.options('*', cors());

app.get('/api/getIssues', async (req, res) => {
   const epic = req.query.epic
   if (!epic) { return res.status(400).end() }
   const client = await JiraClient('https://sharpts.atlassian.net', 'dtaylor@unlimitedsystems.com', '"skybomb0"')
   const searchResults = await client.searchAll(`"Epic Link" = ${epic}`)
   const issues = searchResults.map(issue => ({
      issueKey: issue.key,
      summary: issue.fields.summary,
      issueType: issue.fields.issuetype.name,
      iconURL: issue.fields.issuetype.iconUrl,
      status: issue.fields.status.name,
      links: issue.fields.issuelinks.map(link =>
         link.outwardIssue
            ? ({ type: link.type.outward, key: link.outwardIssue.key })
            : ({ type: link.type.inward, key: link.inwardIssue.key })
      )
   }))
   res.json(issues)
})

const port = 3000
app.listen(port, (err) => {
   if (err) {
      return console.log('something bad happened', err)
   }

   console.log(`server is listening on ${port}`)
})