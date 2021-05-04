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
  createIssBtn.addEventListener('fwClick', createIssue);

  async function createTicket() { }

}

async function showNotification(status, message) {
  const details = {
    type: `${status}`,
    message: `${message}`
  };
  try {
    await client.interface.trigger('showNotify', details);
  } catch (error) {
    console.error(error);
  }
}
