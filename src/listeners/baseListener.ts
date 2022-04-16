import { ClientEvents } from 'detritus-client/lib/constants'
import { ClusterClient, ShardClient } from 'detritus-client'

import { loader } from '../lib/loader';

export class BaseListener<ClientType extends ShardClient | ClusterClient> {
  declare event: ClientEvents;
  run?(payload: any, client: ClientType): any;
  repeat = true;

  connect(client: ClientType) {
    this.repeat 
      ? client.on(this.event, payload => this.run?.(payload, client))
      : client.once(this.event, payload => this.run?.(payload, client));
  }
}


export async function loadListeners(client: ClusterClient, ...dir: string[]) {
  const clusterListeners = await loader<typeof BaseListener>(...dir, 'cluster');
  for (const listener of clusterListeners) {
    new listener().connect(client);
  }

  for (const shard of client.shards.values()) {
    const shardListeners = await loader<typeof BaseListener>(...dir, 'shard');
    for (const listener of shardListeners) {
      new listener().connect(shard);
    }
  }
}