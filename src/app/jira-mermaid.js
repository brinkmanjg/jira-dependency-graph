const TicketType = {
   ENG_TASK: 1,
   STORY: 2,
   API_TEST: 4,
   SPIKE: 8,
   BUG: 16,
   TEST: 32,
   CONFIGURATION: 64,
   SCHEMA_TASK: 128,
   TECH_DEBT: 256
}

const TicketStatus = {
   TODO: 1,
   IMPLEMENTATION: 2,
   REVIEW: 4,
   MERGE_READY: 8,
   EPIC_MERGED: 16,
   UX_APPROVED: 32,
   MANUAL_TESTING: 64,
   PM_READY: 128,
   CLOSED: 256,
   DRAFT: 512
}

const flatten = arrays => [].concat.apply([], arrays)

const splitter = (str, l) => {
   var strs = [];
   while (str.length > l) {
      var pos = str.substring(0, l).lastIndexOf(' ');
      pos = pos <= 0 ? l : pos;
      strs.push(str.substring(0, pos));
      var i = str.indexOf(' ', pos) + 1;
      if (i < pos || i > pos + l)
         i = pos;
      str = str.substring(i);
   }
   strs.push(str);
   return strs;
}

// const nodes = {
//    5291: { desc: 'Double Doughnut POC', type: TicketType.ENG_TASK, connections: [5298], status: TicketStatus.CLOSED },
//    5313: { desc: 'Category Line Graph POC', type: TicketType.ENG_TASK, connections: [5301], status: TicketStatus.CLOSED },
//    5298: { desc: 'Double Doughnut With Legend Component', type: TicketType.ENG_TASK, connections: [5301], status: TicketStatus.CLOSED },
//    5301: { desc: 'Freddie\' Overview UI Component', type: TicketType.ENG_TASK, connections: [5271], status: TicketStatus.CLOSED },
//    5315: { desc: 'Resolve differences between SharpKPI production database and source code', type: TicketType.ENG_TASK, connections: [5271], status: TicketStatus.CLOSED },
//    5328: { desc: 'Create API for Directions Dashboard UI', type: TicketType.ENG_TASK, connections: [5271], status: TicketStatus.CLOSED },
//    5329: { desc: 'Create API for Configuration of Client Targets on Directions Dashboard', type: TicketType.ENG_TASK, connections: [5271], status: TicketStatus.CLOSED },
//    5330: { desc: 'Coordinate with CloudOps on Deployment of Unlimited.KPI and SharpKPI database to environments', type: TicketType.ENG_TASK, connections: [5271], status: TicketStatus.IMPLEMENTATION },
//    5271: { desc: 'Update Directions Dashboard - Freddie\'s Overview', type: TicketType.STORY, connections: [5692, 5646], status: TicketStatus.IMPLEMENTATION },
//    5692: { desc: 'Create the Breakdown link in Freddie\'s Overview', type: TicketType.STORY, connections: [], status: TicketStatus.IMPLEMENTATION },
//    5646: { desc: 'Create Postman script to test Overview data api.', type: TicketType.API_TEST, connections: [], status: TicketStatus.TODO },
// }

module.exports = issues => {
   const jiraIssueStatusTranslation = {
      'todo': TicketStatus.TODO,
      'implementation': TicketStatus.IMPLEMENTATION,
      'review': TicketStatus.REVIEW,
      'merge ready': TicketStatus.MERGE_READY,
      'epic merged': TicketStatus.EPIC_MERGED,
      'ux approved': TicketStatus.UX_APPROVED,
      'manual testing': TicketStatus.MANUAL_TESTING,
      'pm ready': TicketStatus.PM_READY,
      'closed': TicketStatus.CLOSED,
      'draft': TicketStatus.DRAFT
   }

   const jiraIssueTypeTranslation = {
      'story': TicketType.STORY,
      'api test': TicketType.API_TEST,
      'engineering task': TicketType.ENG_TASK,
      'spike': TicketType.SPIKE,
      'bug': TicketType.BUG,
      'test': TicketType.TEST,
      'configuration': TicketType.CONFIGURATION,
      'schema task': TicketType.SCHEMA_TASK,
      'tech debt': TicketType.TECH_DEBT
   }

   let nodeList = issues.map(issue => ({
      key: issue.issueKey,
      desc: issue.summary,
      iconURL: issue.iconURL,
      status: jiraIssueStatusTranslation[issue.status.toLowerCase()],
      originalStatus: issue.status,
      type: jiraIssueTypeTranslation[issue.issueType.toLowerCase()],
      connections: issue.links.filter(link => link.type === 'blocks').map(link => link.key)
   }))

   const excludedNodes = nodeList.filter(node => !node.status || !node.type).map(node => node.key)
   console.log('excluded nodes', excludedNodes)

   const nodes = {}
   nodeList.filter(node => node.status && node.type).forEach(e => nodes[e.key] = e)

   // filter out connections that should be excluded
   Object.keys(nodes).forEach(key => {
      nodes[key].connections = nodes[key].connections.filter(connectionKey => nodes[connectionKey] !== undefined)
   })

   const graphNodes = Object.keys(nodes).sort((a, b) => nodes[b].connections.length - nodes[a].connections.length).map(ticketID => {
      const desc = splitter(nodes[ticketID].desc, 40).join('<br>')
      return `${ticketID}["<div class='title'><img src='${nodes[ticketID].iconURL}' /><span>${ticketID} (${nodes[ticketID].originalStatus})</span></div><div class='desc'>${desc}</div>"]`
   })
   const graphClasses = flatten(Object.keys(nodes).map(ticketID => {
      const typeclassSelector = type => ({
         [TicketType.ENG_TASK]: 'engTask',
         [TicketType.STORY]: 'story',
         [TicketType.API_TEST]: 'apiTest'
      }[type] || 'engTask')
      const statusClassSelector = status => ({
         [TicketStatus.TODO]: 'todo',
         [TicketStatus.CLOSED]: 'done'
      }[status] || 'progress')

      return [
         `class ${ticketID} ${typeclassSelector(nodes[ticketID].type)}`,
         `class ${ticketID} ${statusClassSelector(nodes[ticketID].status)}`
      ]
   }))
   const graphConnections = Object.keys(nodes).map(ticketID => nodes[ticketID].connections.map(connection => `${ticketID} --> ${connection}`))

   const graphDefinition = flatten(flatten([
      'graph LR',
      graphNodes,
      graphClasses,
      graphConnections
   ])).join('\n')

   return graphDefinition
}