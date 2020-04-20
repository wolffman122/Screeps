import {Process} from '../../os/process'

interface TransferProcessMetaData
{
  creep: string
  flagName: string
  sourceRoom: string
  destinationRoom: string

}
export class TransferProcess extends Process
{
  metaData: TransferProcessMetaData;
  type = 'transfer';

  run()
  {
    this.completed = true;
    return;
  }
}
