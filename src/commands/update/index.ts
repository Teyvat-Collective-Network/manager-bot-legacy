import { Permissions } from 'detritus-client/lib/constants';
import { BaseSlashCommand } from '../baseCommand';
import { UpdateRoles } from './roles';

export default class Update extends BaseSlashCommand {
  name = 'update';
  description = 'force updates';
  permissions = [Permissions.ADMINISTRATOR];
  permissionsClient = [Permissions.MANAGE_ROLES];

  constructor() {
    super({
      options: [
        new UpdateRoles(),
      ],
    });
  }
}