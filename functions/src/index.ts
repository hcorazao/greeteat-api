import App from './app';
import HealthCheckController from './controllers/health-check.controller';
import MeetingsController from './controllers/meetings.controller';
import StripeController from './controllers/stripe.controller';
import TestController from './controllers/test.controller';
import VouchersController from './controllers/vouchers.controller';

const contollers = [
    new TestController,
    new VouchersController,
    new HealthCheckController,
    new MeetingsController,
    new StripeController];

const app = new App(contollers, 3001);

export const api = app.function();
  