import { ClusterClient, GatewayClientEvents, ShardClient } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import * as Cron from 'node-cron';

import { BaseListener } from '../baseListener';
import { loader } from '../../lib/loader';

export interface cronjob<ClientType extends ShardClient | ClusterClient> {
  interval: string;
  run(client: ClientType): any;
}

export default class ReadyListener extends BaseListener<ClusterClient> {
  event = ClientEvents.GATEWAY_READY;
  repeat = false;

  async run(_payload: GatewayClientEvents.ClusterEvent & GatewayClientEvents.GatewayReady, client: ClusterClient) {
    const clusterJobs = await loader<cronjob<ClusterClient>>('src/cron/cluster');
    for (const job of clusterJobs) {
      Cron.schedule(job.interval, () => job.run(client));
    }

    const shardJobs = await loader<cronjob<ShardClient>>('src/cron/shard');
    for (const shard of client.shards.values()) {
      for (const job of shardJobs) {
        Cron.schedule(job.interval, () => job.run(shard));
      }
    }

    console.log('ready!');
  }
}