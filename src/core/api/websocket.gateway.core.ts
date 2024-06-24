import { BeforeApplicationShutdown, ConsoleLogger } from '@nestjs/common';
import { sleep } from '@nestjs/terminus/dist/utils';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { getLogLevels } from '@waha/helpers';
import { WAHAEvents } from '@waha/structures/enums.dto';
import { HeartbeatJob } from '@waha/utils/HeartbeatJob';
import { WebSocket } from '@waha/utils/ws';
import { IncomingMessage } from 'http';
import * as lodash from 'lodash';
import * as url from 'url';
import { Server } from 'ws';

@WebSocketGateway({
  path: '/ws',
  cors: true,
})
export class WebsocketGatewayCore
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    BeforeApplicationShutdown
{
  HEARTBEAT_INTERVAL = 10_000;

  @WebSocketServer()
  server: Server;

  private listeners: Map<WebSocket, { session: string; events: string[] }> =
    new Map();

  private log: ConsoleLogger;
  private heartbeat: HeartbeatJob;

  constructor(private manager: SessionManager) {
    const levels = getLogLevels(false);
    this.log = new ConsoleLogger('WebsocketGateway', { logLevels: levels });
    this.heartbeat = new HeartbeatJob(this.log, this.HEARTBEAT_INTERVAL);
  }

  handleConnection(socket: WebSocket, request: IncomingMessage, ...args): any {
    const random = Math.random().toString(36).substring(7);
    const id = `wsc_${random}`;
    socket.id = id;
    this.log.debug(`New client connected: ${request.url}`);
    const params = this.getParams(id, request, socket);
    if (!params) {
      return;
    }
    const { session, events } = params;
    this.log.debug(
      `Client connected to session: '${session}', events: ${events}, ${id}`,
    );
    this.listeners.set(socket, { session, events });
  }

  private getParams(id: string, request: IncomingMessage, socket: WebSocket) {
    const query = url.parse(request.url, true).query;
    const session = (query.session as string) || '*';
    if (session !== '*') {
      this.log.warn(
        `Only connecting to all sessions is allowed for now, use session=*, ${id}`,
      );
      const error =
        'Only connecting to all sessions is allowed for now, use session=*';
      socket.close(4001, JSON.stringify({ error }));
      return null;
    }

    const events = ((query.events as string) || '*').split(',');
    if (
      !lodash.isEqual(events, ['*']) &&
      !lodash.isEqual(events, [WAHAEvents.SESSION_STATUS])
    ) {
      this.log.warn(
        `Only \'session.status\' event is allowed for now, use events=session.status or events=*, ${id}`,
      );
      const error =
        "Only 'session.status' event is allowed for now, use events=session.status or events=*";
      socket.close(4001, JSON.stringify({ error }));
      return null;
    }
    return { session, events };
  }

  handleDisconnect(socket: WebSocket): any {
    this.log.debug(`Client disconnected - ${socket.id}`);
    this.listeners.delete(socket);
  }

  async beforeApplicationShutdown(signal?: string) {
    this.log.log('Shutting down websocket server');
    // Allow pending messages to be sent, it can be even 1ms, just to release the event loop
    await sleep(100);
    this.server.clients.forEach((options, client) => {
      client.close(1001, 'Server is shutting down');
    });
    // Do not turn off heartbeat service here,
    // it's responsible for terminating the connection that is not alive
    this.log.log('Websocket server is down');
  }

  afterInit(server: Server) {
    this.log.debug('Websocket server initialized');
    this.manager.events.on(
      WAHAEvents.SESSION_STATUS,
      this.sendToAll.bind(this),
    );
    this.log.debug('Subscribed to manager events');

    this.log.debug('Starting heartbeat service...');
    this.heartbeat.start(server);
    this.log.debug('Heartbeat service started');
  }

  sendToAll(data: any) {
    this.listeners.forEach((options, client) => {
      if (options.events.length === 0) {
        return;
      }
      this.log.debug('Sending data to client', data);
      client.send(JSON.stringify(data));
    });
  }
}