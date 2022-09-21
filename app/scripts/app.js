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

async function createIssue() {
  var {
    ticket: { id: ticketID, subject, description }
  } = await client.data.get('ticket');

  console.log(ticketID, subject, description);
  try {
    let dbKey = String(ticketID);
    let dbResponse = await client.db.get(dbKey);
    await showNotification('warning', `An github issue is already created for ticket number ${dbResponse.ticketID}`);
  } catch (error) {
    if (!error) return;
    if (error.status && error.message) {
      let { response } = await client.request.invokeTemplate("createIssuesOnGitHub",{
        body: JSON.stringify({
          title: subject,
          body: description
        })
      })
      console.log('response', response);

      let { id: issueID, number: issueNumber } = JSON.parse(response);
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
  let createIssBtn = document.querySelector('.create-issue');
  let viewIssBtn = document.querySelector('.issue-details');

  createIssBtn.addEventListener('fwClick', createIssue);
  viewIssBtn.addEventListener('fwClick', async function showDetails() {
    try {
      await client.interface.trigger('showModal', {
        title: 'Github Issue Details',
        template: './views/modal.html'
      });
    } catch (error) {
      if (!error) return;
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
