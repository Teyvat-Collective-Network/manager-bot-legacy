import { ClusterClient, ClusterClientOptions } from 'detritus-client';
import { Client as TCN } from '@aroleaf/tcn-api';

import {
  DISCORD_TOKEN,
  TCN_API_URL,
  TCN_API_TOKEN,
} from '../.env.json';


export interface BotOptions extends ClusterClientOptions {
  commands: string;
}


export class TCNManager extends ClusterClient {
  tcn: TCN;

  constructor(options: BotOptions) {
    super(DISCORD_TOKEN, options);
    this.tcn = new TCN({ base: TCN_API_URL, token: TCN_API_TOKEN });
  }
}