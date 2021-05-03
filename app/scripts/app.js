document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();
};

async function renderApp() {
  let client = await app.initialized();
  window['client'] = _client;
  client.events.on('app.activated', renderSidebar);
  return;
}

function renderSidebar() {
  const [subBox, descBox, emailBox] = [
    document.querySelector('.subject'),
    document.querySelector('.description'),
    document.querySelector('.email')
  ];
  let createTktBtn = document.querySelector('.create-ticket');
  createTktBtn.addEventListener('fwClick', createTicket);

  async function createTicket() {
    const endpoint = `https://<%=iparam.freshdesk_subdomain%>.freshdesk.com/api/v2/tickets`;
    const options = {
      headers: {
        'Authorization': ""
      }
    }
    await client.request.post(endpoint, options)
  }

  console.log(subBox, descBox, emailBox, createTktBtn);
}
