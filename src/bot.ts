import { ClusterClient, ClusterClientOptions } from 'detritus-client';
import { Client as TCN } from '@aroleaf/tcn-api';

import {
  DISCORD_TOKEN,
  TCN_REST_URL,
  TCN_SOCKET_URL,
  TCN_API_TOKEN,
} from '../.env.json';


export interface BotOptions extends ClusterClientOptions {
  commands: string;
}


export class TCNManager extends ClusterClient {
  tcn: TCN;

  constructor(options: BotOptions) {
    super(DISCORD_TOKEN, options);
    this.tcn = new TCN({ restUrl: TCN_REST_URL, socketUrl: TCN_SOCKET_URL, token: TCN_API_TOKEN });
  }
}