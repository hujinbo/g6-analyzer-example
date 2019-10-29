
import InstanceManager from './InstanceManager'
import Store from './Store'
import EventCenter from './EventCenter'
import { store as buildModel, view } from 'react-easy-state'
import eventEnum from './EventCenter/constant'

import Graph from './Base/Graph';
// #TODO buildModel 加上mixin

export default {
  view,
  Graph,
  eventEnum,
  buildModel,
  EventCenter,
  InstanceManager,
  regModel: Store.regStoreModel,
}
