const net = require('net');
const c = net.connect(5432, 'shop-weboutiapp-47c9mp', () => {
  console.log('CONNECTED');
  c.end();
});
c.on('error', (e) => console.log('ERROR:', e.message));
