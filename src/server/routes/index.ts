import { Router } from '../util';

import './web'
Router.group('/api', async () => await import('./api'))
