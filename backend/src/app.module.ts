/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { MailerModule } from '@nestjs-modules/mailer';
import Config from './config.js';
import { UserController } from './user/user.controller.js';
import { UserService } from './user/user.service.js';
import { AuthService } from './auth/auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { PoolController } from './pool/pool.controller.js';
import { PoolService } from './pool/pool.service.js';
import { AutomationController } from './automation/automation.controller.js';
import { AutomationService } from './automation/automation.service.js';
import { TradeController } from './trade/trade.controller.js';
import { TradeService } from './trade/trade.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();
const observeAppKey = process.env.OBSERVE_APP_KEY?.trim();
const observeAppSecret = process.env.OBSERVE_APP_SECRET?.trim();
export const observeEnabled = Boolean(observeAppKey && observeAppSecret);

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    MailerModule.forRoot({
      transport: Config.MAILER_TRANSPORT,
      defaults: {
        secure: false,
        from: Config.DEFAULT_FROM
      }
    }),
    AuthModule,
    ...(observeEnabled
      ? [
          ObserveModule.forRoot({
            appKey: observeAppKey!,
            appSecret: observeAppSecret!,
            serviceId: 'backend',
          }),
        ]
      : []),
  ],
  controllers: [AppController, UserController, PoolController, AutomationController,TradeController],
  providers: [AppService, UserService, AuthService, JwtService, PoolService, AutomationService, TradeService],
})
export class AppModule {}
