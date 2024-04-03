document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();
};

async function renderApp() {
  try {
    let _client = await app.initialized();
    window['client'] = _client;
    client.events.on('app.activated', renderSidebar);
    return;
  } catch (error) {
    console.error(error);
    await showNotification('danger', 'Unable to load the app');
  }
}

async function createIssue() {
  var {
    ticket: { id: ticketID, subject, description }
  } = await client.data.get('ticket');

  console.log(ticketID, subject, description);
  try {
    let dbKey = String(ticketID).substr(0, 30);

    let dbResponse = await client.db.get(dbKey);
    await showNotification('warning', `An github issue is already created for ticket number ${dbResponse.ticketID}`);
  } catch (error) {
    if (error.status && error.message) {
      let { status, message } = error;
      let body = JSON.stringify({
        title: subject,
        body: description
      });

      let result = await client.request.invokeTemplate('createGithubIssue', { body: body });
      let responseJSON = JSON.parse(result.response);

      console.log('response', responseJSON);

      let { id: issueID, number: issueNumber } = responseJSON;
      let data = {
        ticketID,
        issueID,
        issueNumber
      };

      console.log('data', data);
      await Promise.all([client.db.set(String(issueID), { ...data }), client.db.set(String(ticketID), { ...data })]);
      await showNotification('success', 'Github Issue has been created successfully');
    } else {
      console.error('Here is what we know:', error);
    }
  }
}

function renderSidebar() {
  const pick = document.querySelector.bind(document);

  let createIssBtn = pick('.create-issue');
  let viewIssBtn = pick('.issue-details');

  createIssBtn.addEventListener('fwClick', createIssue);
  viewIssBtn.addEventListener('fwClick', async function showDetails() {
    try {
      await client.interface.trigger('showModal', {
        title: 'Github Issue Details',
        template: './views/modal.html'
      });
    } catch (error) {
      console.error('Saw following error:', error);
    }
  });
}

async function showNotification(status, message) {
  const details = {
    type: `${status}`,
    message: `${message}`
  };

  await client.interface.trigger('showNotify', details);
}
