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

  let viewIssBtn = pick('.issue-details');

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
