import { Client as TCN } from '@aroleaf/tcn-api';

declare module 'detritus-client/lib/clusterclient' {
  interface ClusterClient {
    tcn: TCN;
  }
}