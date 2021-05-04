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

function renderSidebar() {
  const pick = document.querySelector.bind(document);
  const [subBox, descBox, emailBox] = [pick('.subject'), pick('.description'), pick('.email')];

  let createTktBtn = document.querySelector('.create-ticket');
  createTktBtn.addEventListener('fwClick', createTicket);

  async function createTicket() {
    const endpoint = `https://<%=iparam.subdomain%>.freshservice.com/api/v2/tickets`;
    let body = {
      description: `${descBox.value}`,
      email: `${emailBox.value}`,
      subject: `${subBox.value}`,
      priority: 1,
      status: 2
    };

    body = JSON.stringify(body);
    let options = {
      headers: {
        Authorization: 'Basic <%= encode(iparam.freshservice_api_key) %>',
        'Content-Type': 'application/json'
      },
      body
    };
    console.log(body);
    try {
      await client.request.post(endpoint, options);
      await showNotification('success', 'The ticket is created');
    } catch (error) {
      console.log('error', error);
      await showNotification('error', 'Something went wrong while creating ticket');
    }
  }
}
