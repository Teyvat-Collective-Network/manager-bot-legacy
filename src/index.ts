import { InteractionCommandClient } from 'detritus-client';
import { TCNManager } from './bot';
import config from './config';
import { loadListeners } from './listeners/baseListener';
import './types';

(async () => {
  const client = new TCNManager(config)
  
  await client.run();
  await loadListeners(client, 'src/listeners');
  
  const interactions = new InteractionCommandClient(client);
  await interactions.addMultipleIn(config.commands);
  await interactions.run();
})();
